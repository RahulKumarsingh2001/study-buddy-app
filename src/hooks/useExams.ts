import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Exam {
  id: string;
  user_id: string;
  subject_id: string | null;
  title: string;
  exam_date: string;
  notified: boolean;
  created_at: string;
  subjects?: { subject_name: string } | null;
}

export function useExams() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['exams', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('*, subjects(subject_name)')
        .order('exam_date', { ascending: true });
      if (error) throw error;
      return data as Exam[];
    },
    enabled: !!user,
  });

  const addExam = useMutation({
    mutationFn: async (exam: { title: string; exam_date: string; subject_id?: string | null }) => {
      const { data, error } = await supabase
        .from('exams')
        .insert({ ...exam, user_id: user!.id })
        .select('*, subjects(subject_name)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exams'] }),
  });

  return { exams: query.data ?? [], isLoading: query.isLoading, addExam, deleteExam };
}
