import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Task {
  id: string;
  user_id: string;
  subject_id: string;
  topic: string;
  date: string;
  time: string | null;
  status: 'pending' | 'completed';
  created_at: string;
  subjects?: { subject_name: string };
}

export function useTasks(subjectFilter?: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tasks', user?.id, subjectFilter],
    queryFn: async () => {
      let q = supabase
        .from('tasks')
        .select('*, subjects(subject_name)')
        .order('date', { ascending: true })
        .order('time', { ascending: true, nullsFirst: false });

      if (subjectFilter) {
        q = q.eq('subject_id', subjectFilter);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const addTask = useMutation({
    mutationFn: async (task: { subject_id: string; topic: string; date: string; time?: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user!.id, status: 'pending' })
        .select('*, subjects(subject_name)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'pending' | 'completed' }) => {
      const newStatus = status === 'pending' ? 'completed' : 'pending';
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  return { tasks: query.data ?? [], isLoading: query.isLoading, addTask, toggleTask, deleteTask };
}
