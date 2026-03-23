import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Clock, Calendar } from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string, status: 'pending' | 'completed') => void;
  onDelete: (id: string) => void;
}

function formatTaskDate(dateStr: string) {
  const d = parseISO(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d');
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
        <div className="mb-3 rounded-full bg-muted p-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="font-medium text-foreground">No tasks yet</p>
        <p className="mt-1 text-sm text-muted-foreground">Add a task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => {
        const isCompleted = task.status === 'completed';
        const isOverdue = !isCompleted && isPast(parseISO(task.date)) && !isToday(parseISO(task.date));

        return (
          <div
            key={task.id}
            className={`group flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:shadow-sm ${
              isCompleted
                ? 'border-border/40 bg-muted/40'
                : isOverdue
                ? 'border-destructive/20 bg-destructive/5'
                : 'border-border bg-card'
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <Checkbox
              checked={isCompleted}
              onCheckedChange={() => onToggle(task.id, task.status)}
              className="mt-0.5 transition-transform active:scale-95"
            />

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.topic}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {task.subjects?.subject_name && (
                  <span className="rounded-md bg-secondary px-1.5 py-0.5 font-medium text-secondary-foreground">
                    {task.subjects.subject_name}
                  </span>
                )}
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  {formatTaskDate(task.date)}
                </span>
                {task.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.time}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onDelete(task.id)}
              className="rounded p-1 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
