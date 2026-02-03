-- Create groups table
CREATE TABLE public.grupos_gps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cor TEXT NOT NULL DEFAULT '#3b82f6',
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grupos_gps ENABLE ROW LEVEL SECURITY;

-- Create public policies for groups
CREATE POLICY "Leitura pública de grupos" 
ON public.grupos_gps 
FOR SELECT 
USING (true);

CREATE POLICY "Inserção pública de grupos" 
ON public.grupos_gps 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Atualização pública de grupos" 
ON public.grupos_gps 
FOR UPDATE 
USING (true);

CREATE POLICY "Deleção pública de grupos" 
ON public.grupos_gps 
FOR DELETE 
USING (true);

-- Add grupo_id column to pontos_gps
ALTER TABLE public.pontos_gps 
ADD COLUMN grupo_id UUID REFERENCES public.grupos_gps(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_pontos_gps_grupo_id ON public.pontos_gps(grupo_id);