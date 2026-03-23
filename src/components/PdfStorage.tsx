import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FileText, Upload, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PdfFile {
  id: string;
  file_name: string;
  file_path: string;
  subject_id: string | null;
  created_at: string;
  subjects?: { subject_name: string } | null;
}

export default function PdfStorage() {
  const { user } = useAuth();
  const { subjects } = useSubjects();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [subjectId, setSubjectId] = useState<string>('all');

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['pdf_files', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pdf_files')
        .select('*, subjects(subject_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PdfFile[];
    },
    enabled: !!user,
  });

  const uploadFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('pdfs').upload(path, file);
      if (uploadErr) throw uploadErr;

      const { error: insertErr } = await supabase.from('pdf_files').insert({
        user_id: user.id,
        file_name: file.name,
        file_path: path,
        subject_id: subjectId !== 'all' ? subjectId : null,
      });
      if (insertErr) throw insertErr;

      queryClient.invalidateQueries({ queryKey: ['pdf_files'] });
      toast.success('PDF uploaded');
    } catch {
      toast.error('Upload failed');
    }
    setUploading(false);
  };

  const deletePdf = useMutation({
    mutationFn: async (pdf: PdfFile) => {
      await supabase.storage.from('pdfs').remove([pdf.file_path]);
      const { error } = await supabase.from('pdf_files').delete().eq('id', pdf.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf_files'] });
      toast.success('PDF deleted');
    },
  });

  const openPdf = async (path: string) => {
    const { data, error } = await supabase.storage.from('pdfs').createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      toast.error('Failed to open PDF');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  const filtered = subjectId === 'all' ? files : files.filter(f => f.subject_id === subjectId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="PDF Storage">
          <FileText className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>PDF Storage</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 mt-4 flex-1 overflow-hidden">
          <div className="flex gap-2">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.subject_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); e.target.value = ''; }}
            />
            <Button onClick={() => fileInput.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No PDFs yet. Upload one!</p>
            ) : (
              filtered.map(pdf => (
                <div key={pdf.id} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                  <FileText className="h-8 w-8 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{pdf.file_name}</p>
                    {pdf.subjects?.subject_name && (
                      <span className="text-xs rounded bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                        {pdf.subjects.subject_name}
                      </span>
                    )}
                  </div>
                  <button onClick={() => openPdf(pdf.file_path)} className="p-1 rounded hover:bg-muted">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => deletePdf.mutate(pdf)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
