import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subject {
  id: string;
  subject_name: string;
  user_id: string;
  created_at: string;
}

export function useSubjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['subjects', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('subject_name');
      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!user,
  });

  const addSubject = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ subject_name: name, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subjects'] }),
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return { subjects: query.data ?? [], isLoading: query.isLoading, addSubject, deleteSubject };
}
