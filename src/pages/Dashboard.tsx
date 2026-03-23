import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import TopBar from '@/components/TopBar';
import SubjectsSidebar from '@/components/SubjectsSidebar';
import DashboardStats from '@/components/DashboardStats';
import TaskList from '@/components/TaskList';
import AddTaskDialog from '@/components/AddTaskDialog';
import TaskAlarm from '@/components/TaskAlarm';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { tasks, isLoading, toggleTask, deleteTask } = useTasks(selectedSubject);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleToggle = async (id: string, status: 'pending' | 'completed') => {
    try {
      await toggleTask.mutateAsync({ id, status });
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full pt-14 lg:pt-0">
            <SubjectsSidebar selectedSubject={selectedSubject} onSelectSubject={(id) => { setSelectedSubject(id); setSidebarOpen(false); }} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <DashboardStats tasks={tasks} />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {selectedSubject ? 'Subject Tasks' : 'All Tasks'}
              </h2>
              <AddTaskDialog defaultSubjectId={selectedSubject} />
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : (
              <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
