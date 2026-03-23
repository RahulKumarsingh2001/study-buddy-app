import { Task } from '@/hooks/useTasks';
import { CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

interface DashboardStatsProps {
  tasks: Task[];
}

export default function DashboardStats({ tasks }: DashboardStatsProps) {
  const todayTasks = tasks.filter((t) => isToday(parseISO(t.date)));
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;

  const stats = [
    {
      label: "Today's Tasks",
      value: todayTasks.length,
      icon: ListTodo,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'text-success bg-success/10',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-accent-foreground bg-accent/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="fade-in-up flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
            <stat.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
