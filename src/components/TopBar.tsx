import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, LogOut, Menu, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import Notepad from '@/components/Notepad';
import Calculator from '@/components/Calculator';
import PdfStorage from '@/components/PdfStorage';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export default function TopBar({ onToggleSidebar }: TopBarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="rounded-lg p-1.5 hover:bg-muted transition-colors lg:hidden">
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">StudyFlow</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Link to="/calendar">
          <Button variant="ghost" size="icon" className="h-9 w-9" title="Exam Calendar">
            <CalendarDays className="h-4 w-4" />
          </Button>
        </Link>
        <Notepad />
        <Calculator />
        <PdfStorage />
        <span className="hidden text-sm text-muted-foreground sm:block ml-2">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
