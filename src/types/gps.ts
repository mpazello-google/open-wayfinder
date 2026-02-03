export interface PontoGPS {
  id: string;
  nome: string;
  descricao: string | null;
  lat: number;
  lng: number;
  tipo: 'waypoint' | 'trackpoint';
  elevacao: number | null;
  timestamp: string | null;
  track_id: string | null;
  grupo_id: string | null;
  created_at: string;
}

export interface GrupoGPS {
  id: string;
  nome: string;
  cor: string;
  descricao: string | null;
  created_at: string;
}

export interface Track {
  id: string;
  points: PontoGPS[];
}

export interface CreatePontoGPS {
  nome: string;
  descricao?: string;
  lat: number;
  lng: number;
  tipo: 'waypoint' | 'trackpoint';
  elevacao?: number;
  track_id?: string;
  grupo_id?: string;
}

export interface UpdatePontoGPS {
  nome?: string;
  descricao?: string | null;
  lat?: number;
  lng?: number;
  tipo?: 'waypoint' | 'trackpoint';
  elevacao?: number | null;
  track_id?: string | null;
  grupo_id?: string | null;
}

export interface CreateGrupoGPS {
  nome: string;
  cor?: string;
  descricao?: string;
}

export interface UpdateGrupoGPS {
  nome?: string;
  cor?: string;
  descricao?: string | null;
}

export type FilterType = 'all' | 'waypoints' | 'trails';
