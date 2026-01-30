import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PontoGPS, CreatePontoGPS, UpdatePontoGPS, Track } from '@/types/gps';
import { toast } from 'sonner';

export function useGPSPoints() {
  const queryClient = useQueryClient();

  const { data: points = [], isLoading, error } = useQuery({
    queryKey: ['pontos-gps'],
    queryFn: async (): Promise<PontoGPS[]> => {
      // Supabase has a default limit of 1000 rows
      // We need to fetch all records using pagination
      const allPoints: PontoGPS[] = [];
      const pageSize = 1000;
      let page = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('pontos_gps')
          .select('*')
          .order('timestamp', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        
        if (data && data.length > 0) {
          allPoints.push(...(data as PontoGPS[]));
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }

      return allPoints;
    },
  });

  const createPoint = useMutation({
    mutationFn: async (newPoint: CreatePontoGPS) => {
      const { data, error } = await supabase
        .from('pontos_gps')
        .insert(newPoint)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pontos-gps'] });
      toast.success('Waypoint criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar waypoint: ' + error.message);
    },
  });

  const updatePoint = useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePontoGPS & { id: string }) => {
      const { data, error } = await supabase
        .from('pontos_gps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pontos-gps'] });
      toast.success('Ponto atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar ponto: ' + error.message);
    },
  });

  const deletePoint = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('pontos_gps')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pontos-gps'] });
      toast.success('Ponto excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir ponto: ' + error.message);
    },
  });

  // Separate waypoints and trackpoints
  const waypoints = points.filter((p) => p.tipo === 'waypoint');
  const trackpoints = points.filter((p) => p.tipo === 'trackpoint');

  // Group trackpoints by track_id
  const tracks: Track[] = [];
  const trackMap = new Map<string, PontoGPS[]>();

  trackpoints.forEach((point) => {
    const trackId = point.track_id || 'default';
    if (!trackMap.has(trackId)) {
      trackMap.set(trackId, []);
    }
    trackMap.get(trackId)!.push(point);
  });

  trackMap.forEach((trackPoints, trackId) => {
    tracks.push({
      id: trackId,
      points: trackPoints.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }),
    });
  });

  // Calculate map bounds
  const getBounds = (): [[number, number], [number, number]] | null => {
    if (points.length === 0) return null;

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    points.forEach((point) => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLng = Math.min(minLng, point.lng);
      maxLng = Math.max(maxLng, point.lng);
    });

    return [
      [minLat, minLng],
      [maxLat, maxLng],
    ];
  };

  return {
    points,
    waypoints,
    trackpoints,
    tracks,
    isLoading,
    error,
    createPoint,
    updatePoint,
    deletePoint,
    getBounds,
  };
}
