import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calculator as CalcIcon } from 'lucide-react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [reset, setReset] = useState(false);

  const handleNumber = (n: string) => {
    if (reset) { setDisplay(n); setReset(false); return; }
    setDisplay(display === '0' ? n : display + n);
  };

  const handleOp = (nextOp: string) => {
    if (prev && op && !reset) {
      const result = calculate(parseFloat(prev), parseFloat(display), op);
      setDisplay(String(result));
      setPrev(String(result));
    } else {
      setPrev(display);
    }
    setOp(nextOp);
    setReset(true);
  };

  const calculate = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (!prev || !op) return;
    const result = calculate(parseFloat(prev), parseFloat(display), op);
    setDisplay(String(Math.round(result * 1e10) / 1e10));
    setPrev(null);
    setOp(null);
    setReset(true);
  };

  const handleClear = () => { setDisplay('0'); setPrev(null); setOp(null); setReset(false); };
  const handleDot = () => { if (!display.includes('.')) setDisplay(display + '.'); };
  const handlePercent = () => setDisplay(String(parseFloat(display) / 100));

  const btnClass = "h-12 text-lg font-medium rounded-xl transition-colors";

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Calculator">
          <CalcIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Calculator</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl bg-muted p-4 text-right">
            {prev && op && (
              <p className="text-xs text-muted-foreground mb-1">{prev} {op}</p>
            )}
            <p className="text-3xl font-semibold text-foreground tabular-nums truncate">{display}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button variant="secondary" className={btnClass} onClick={handleClear}>AC</Button>
            <Button variant="secondary" className={btnClass} onClick={() => setDisplay(String(-parseFloat(display)))}>±</Button>
            <Button variant="secondary" className={btnClass} onClick={handlePercent}>%</Button>
            <Button className={`${btnClass} bg-accent text-accent-foreground hover:bg-accent/80`} onClick={() => handleOp('÷')}>÷</Button>

            {['7','8','9'].map(n => <Button key={n} variant="outline" className={btnClass} onClick={() => handleNumber(n)}>{n}</Button>)}
            <Button className={`${btnClass} bg-accent text-accent-foreground hover:bg-accent/80`} onClick={() => handleOp('×')}>×</Button>

            {['4','5','6'].map(n => <Button key={n} variant="outline" className={btnClass} onClick={() => handleNumber(n)}>{n}</Button>)}
            <Button className={`${btnClass} bg-accent text-accent-foreground hover:bg-accent/80`} onClick={() => handleOp('-')}>−</Button>

            {['1','2','3'].map(n => <Button key={n} variant="outline" className={btnClass} onClick={() => handleNumber(n)}>{n}</Button>)}
            <Button className={`${btnClass} bg-accent text-accent-foreground hover:bg-accent/80`} onClick={() => handleOp('+')}>+</Button>

            <Button variant="outline" className={`${btnClass} col-span-2`} onClick={() => handleNumber('0')}>0</Button>
            <Button variant="outline" className={btnClass} onClick={handleDot}>.</Button>
            <Button className={`${btnClass} bg-primary text-primary-foreground hover:bg-primary/90`} onClick={handleEquals}>=</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
