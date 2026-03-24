import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExams } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubjects';
import TopBar from '@/components/TopBar';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarPlus, Trash2, Bell, Loader2, ArrowLeft } from 'lucide-react';
import { format, parseISO, differenceInDays, isToday, isTomorrow } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const { exams, isLoading, addExam, deleteExam } = useExams();
  const { subjects } = useSubjects();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [examDate, setExamDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [notifiedExams, setNotifiedExams] = useState<Set<string>>(new Set());

  // Check for exams happening tomorrow and notify
  useEffect(() => {
    if (exams.length === 0) return;

    const now = new Date();
    exams.forEach((exam) => {
      const examDay = parseISO(exam.exam_date);
      const daysUntil = differenceInDays(examDay, now);

      if ((daysUntil === 0 || daysUntil === 1) && !notifiedExams.has(exam.id)) {
        const label = daysUntil === 0 ? 'TODAY' : 'TOMORROW';
        toast.warning(`📢 Exam ${label}: ${exam.title}`, {
          description: exam.subjects?.subject_name
            ? `Subject: ${exam.subjects.subject_name}`
            : undefined,
          duration: 10000,
        });
        setNotifiedExams((prev) => new Set(prev).add(exam.id));
      }
    });
  }, [exams, notifiedExams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !examDate) return;
    try {
      await addExam.mutateAsync({
        title: title.trim(),
        exam_date: examDate,
        subject_id: subjectId || null,
      });
      toast.success('Exam added!');
      setTitle('');
      setExamDate('');
      setSubjectId('');
      setOpen(false);
    } catch {
      toast.error('Failed to add exam');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExam.mutateAsync(id);
      toast.success('Exam deleted');
    } catch {
      toast.error('Failed to delete exam');
    }
  };

  // Dates that have exams
  const examDates = exams.map((e) => parseISO(e.exam_date));

  // Exams for the selected date
  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';
  const examsOnDate = exams.filter((e) => e.exam_date === selectedDateStr);

  const getExamBadge = (exam_date: string) => {
    const d = parseISO(exam_date);
    const days = differenceInDays(d, new Date());
    if (days < 0) return <Badge variant="secondary">Passed</Badge>;
    if (days === 0) return <Badge variant="destructive">Today!</Badge>;
    if (days === 1) return <Badge className="bg-accent text-accent-foreground">Tomorrow</Badge>;
    return <Badge variant="outline">{days} days left</Badge>;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar onToggleSidebar={() => {}} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Exam Calendar</h1>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Add Exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Exam</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddExam} className="space-y-4 pt-2">
                  <Input
                    placeholder="Exam title (e.g. Math Final)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <Select value={subjectId} onValueChange={setSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full" disabled={addExam.isPending}>
                    {addExam.isPending ? 'Adding...' : 'Add Exam'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            {/* Calendar */}
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{ exam: examDates }}
                  modifiersClassNames={{
                    exam: 'bg-primary/20 text-primary font-bold',
                  }}
                />
              </CardContent>
            </Card>

            {/* Exam list */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {selectedDate
                      ? `Exams on ${format(selectedDate, 'MMMM d, yyyy')}`
                      : 'Select a date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {examsOnDate.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No exams on this date.</p>
                  ) : (
                    <div className="space-y-3">
                      {examsOnDate.map((exam) => (
                        <div
                          key={exam.id}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">{exam.title}</p>
                            {exam.subjects?.subject_name && (
                              <p className="text-sm text-muted-foreground">{exam.subjects.subject_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getExamBadge(exam.exam_date)}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(exam.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming exams */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" />
                    Upcoming Exams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : exams.filter((e) => differenceInDays(parseISO(e.exam_date), new Date()) >= 0).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming exams.</p>
                  ) : (
                    <div className="space-y-2">
                      {exams
                        .filter((e) => differenceInDays(parseISO(e.exam_date), new Date()) >= 0)
                        .map((exam) => (
                          <div
                            key={exam.id}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium text-sm text-foreground">{exam.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(parseISO(exam.exam_date), 'MMM d, yyyy')}
                                {exam.subjects?.subject_name && ` · ${exam.subjects.subject_name}`}
                              </p>
                            </div>
                            {getExamBadge(exam.exam_date)}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
