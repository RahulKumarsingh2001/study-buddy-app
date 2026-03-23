
-- Notes table for notepad
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- PDF storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);

-- PDF metadata table
CREATE TABLE public.pdf_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pdf_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pdfs" ON public.pdf_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload own pdfs" ON public.pdf_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own pdfs" ON public.pdf_files FOR DELETE USING (auth.uid() = user_id);

-- Storage RLS policies
CREATE POLICY "Users can upload pdfs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own pdfs" ON storage.objects FOR DELETE USING (bucket_id = 'pdfs' AND (storage.foldername(name))[1] = auth.uid()::text);
