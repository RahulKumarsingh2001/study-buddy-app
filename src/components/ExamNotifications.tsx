import { useExams } from '@/hooks/useExams';
import { differenceInDays, parseISO } from 'date-fns';
import { CalendarDays, X } from 'lucide-react';
import { useState } from 'react';

export default function ExamNotifications() {
  const { exams } = useExams();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const today = new Date();

  const upcoming = exams.filter((exam) => {
    const days = differenceInDays(parseISO(exam.exam_date), today);
    return days >= 0 && days <= 1 && !dismissed.has(exam.id);
  });

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-2">
      {upcoming.map((exam) => {
        const days = differenceInDays(parseISO(exam.exam_date), today);
        const isToday = days === 0;
        return (
          <div
            key={exam.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
              isToday
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : 'border-warning/30 bg-warning/10 text-warning-foreground'
            }`}
          >
            <CalendarDays className="h-5 w-5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{exam.title}</p>
              <p className="text-xs opacity-80">
                {isToday ? 'Exam is TODAY!' : 'Exam is TOMORROW!'}
                {exam.subjects?.subject_name && ` • ${exam.subjects.subject_name}`}
              </p>
            </div>
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(exam.id))}
              className="shrink-0 rounded-md p-1 hover:bg-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
