import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Task } from '@/hooks/useTasks';
import { isToday, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Clock } from 'lucide-react';

interface TaskAlarmProps {
  tasks: Task[];
}

export default function TaskAlarm({ tasks }: TaskAlarmProps) {
  const [ringingTask, setRingingTask] = useState<Task | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alarmLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopSound = useCallback(() => {
    if (alarmLoopRef.current) {
      clearInterval(alarmLoopRef.current);
      alarmLoopRef.current = null;
    }
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); } catch {}
      oscillatorRef.current = null;
    }
  }, []);

  const playAlarmSound = useCallback(() => {
    stopSound();

    const ctx = audioContextRef.current || new AudioContext();
    audioContextRef.current = ctx;

    let isPlaying = true;

    const beep = () => {
      if (!isPlaying) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
      oscillatorRef.current = osc;
    };

    beep();
    alarmLoopRef.current = setInterval(beep, 600);

    // Auto-stop after 30 seconds
    setTimeout(() => {
      isPlaying = false;
      stopSound();
    }, 30000);
  }, [stopSound]);

  const dismissAlarm = useCallback(() => {
    if (ringingTask) {
      setDismissedIds((prev) => new Set(prev).add(ringingTask.id));
    }
    stopSound();
    setRingingTask(null);
  }, [ringingTask, stopSound]);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentHours}:${currentMinutes}`;

      const pendingTodayWithTime = tasks.filter(
        (t) =>
          t.status === 'pending' &&
          t.time &&
          isToday(parseISO(t.date)) &&
          !dismissedIds.has(t.id)
      );

      for (const task of pendingTodayWithTime) {
        const taskTime = task.time!.substring(0, 5); // HH:MM
        if (taskTime === currentTime && !ringingTask) {
          setRingingTask(task);
          playAlarmSound();
          break;
        }
      }
    };

    intervalRef.current = setInterval(checkAlarms, 10000); // check every 10s
    checkAlarms(); // check immediately

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tasks, dismissedIds, ringingTask, playAlarmSound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  return (
    <Dialog open={!!ringingTask} onOpenChange={(open) => { if (!open) dismissAlarm(); }}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-destructive">
            <Bell className="h-5 w-5 animate-bounce" />
            Task Alarm!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 animate-pulse">
            <Bell className="h-8 w-8 text-destructive" />
          </div>

          <div>
            <p className="text-lg font-semibold text-foreground">{ringingTask?.topic}</p>
            {ringingTask?.subjects?.subject_name && (
              <p className="mt-1 text-sm text-muted-foreground">
                {ringingTask.subjects.subject_name}
              </p>
            )}
            <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {ringingTask?.time}
            </p>
          </div>

          <Button onClick={dismissAlarm} variant="destructive" className="w-full gap-2">
            <BellOff className="h-4 w-4" />
            Dismiss Alarm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
