import React, { useState } from 'react';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Plus, Trash2, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

interface SubjectsSidebarProps {
  selectedSubject: string | null;
  onSelectSubject: (id: string | null) => void;
}

export default function SubjectsSidebar({ selectedSubject, onSelectSubject }: SubjectsSidebarProps) {
  const { subjects, isLoading, addSubject, deleteSubject } = useSubjects();
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await addSubject.mutateAsync(newName.trim());
      setNewName('');
      setAdding(false);
      toast.success('Subject added');
    } catch {
      toast.error('Failed to add subject');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSubject.mutateAsync(id);
      if (selectedSubject === id) onSelectSubject(null);
      toast.success(`"${name}" deleted`);
    } catch {
      toast.error('Failed to delete subject');
    }
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">Subjects</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          onClick={() => onSelectSubject(null)}
          className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            selectedSubject === null
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          All Tasks
        </button>

        {subjects.map((subject, i) => (
          <div
            key={subject.id}
            className={`group mb-1 flex items-center rounded-lg transition-colors ${
              selectedSubject === subject.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <button
              onClick={() => onSelectSubject(subject.id)}
              className="flex-1 px-3 py-2.5 text-left text-sm font-medium"
            >
              {subject.subject_name}
            </button>
            <button
              onClick={() => handleDelete(subject.id, subject.subject_name)}
              className="mr-2 rounded p-1 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {isLoading && (
          <div className="space-y-2 px-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        {adding ? (
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Subject name"
              autoFocus
              className="h-9 text-sm"
            />
            <Button type="submit" size="sm" disabled={!newName.trim()}>
              Add
            </Button>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setAdding(true)}
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>
    </div>
  );
}
