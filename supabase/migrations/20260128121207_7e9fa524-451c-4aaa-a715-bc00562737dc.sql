-- Criar tabela pontos_gps para armazenar waypoints e trackpoints
CREATE TABLE public.pontos_gps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'waypoint' CHECK (tipo IN ('waypoint', 'trackpoint')),
  elevacao DOUBLE PRECISION,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  track_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance com grandes volumes
CREATE INDEX idx_pontos_gps_tipo ON public.pontos_gps(tipo);
CREATE INDEX idx_pontos_gps_track_id ON public.pontos_gps(track_id);
CREATE INDEX idx_pontos_gps_coords ON public.pontos_gps(lat, lng);

-- Habilitar RLS
ALTER TABLE public.pontos_gps ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (MVP sem autenticação)
CREATE POLICY "Leitura pública de pontos GPS" 
ON public.pontos_gps 
FOR SELECT 
USING (true);

-- Política de inserção pública (MVP sem autenticação)
CREATE POLICY "Inserção pública de pontos GPS" 
ON public.pontos_gps 
FOR INSERT 
WITH CHECK (true);

-- Política de atualização pública (MVP)
CREATE POLICY "Atualização pública de pontos GPS" 
ON public.pontos_gps 
FOR UPDATE 
USING (true);

-- Política de deleção pública (MVP)
CREATE POLICY "Deleção pública de pontos GPS" 
ON public.pontos_gps 
FOR DELETE 
USING (true);