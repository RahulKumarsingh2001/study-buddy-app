import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { StickyNote, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function Notepad() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
    enabled: !!user,
  });

  const createNote = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .insert({ user_id: user!.id, title: 'Untitled', content: '' })
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNote(data);
      setTitle(data.title);
      setContent(data.content);
    },
  });

  const saveNote = useMutation({
    mutationFn: async () => {
      if (!selectedNote) return;
      const { error } = await supabase
        .from('notes')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', selectedNote.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note saved');
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setSelectedNote(null);
      setTitle('');
      setContent('');
    },
  });

  const selectNote = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Notepad">
          <StickyNote className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Notepad
            <Button size="sm" variant="outline" onClick={() => createNote.mutate()}>
              <Plus className="h-4 w-4" /> New
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-hidden mt-4">
          {selectedNote ? (
            <div className="flex flex-1 flex-col gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="font-semibold"
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your notes here..."
                className="flex-1 min-h-[300px] resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={() => saveNote.mutate()} className="flex-1">
                  <Save className="h-4 w-4" /> Save
                </Button>
                <Button variant="outline" onClick={() => { setSelectedNote(null); setTitle(''); setContent(''); }}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : notes.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">No notes yet. Create one!</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center gap-2 rounded-lg border border-border bg-card p-3 cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => selectNote(note)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{note.content || 'Empty note'}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNote.mutate(note.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
