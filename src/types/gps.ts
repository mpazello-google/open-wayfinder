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
}

export type FilterType = 'all' | 'waypoints' | 'trails';
