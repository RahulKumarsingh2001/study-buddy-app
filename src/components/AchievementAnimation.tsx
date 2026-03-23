import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface AchievementAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export default function AchievementAnimation({ show, onComplete }: AchievementAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);

    // Fire confetti
    const end = Date.now() + 2000;
    const colors = ['hsl(152, 44%, 38%)', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="animate-scale-in text-center">
        <div className="text-6xl mb-3">🎉</div>
        <h2 className="text-2xl font-bold text-foreground bg-card/90 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-border">
          Task Completed!
        </h2>
        <p className="mt-2 text-muted-foreground bg-card/80 backdrop-blur-sm rounded-lg px-4 py-1 text-sm">
          Keep up the great work! 🚀
        </p>
      </div>
    </div>
  );
}
