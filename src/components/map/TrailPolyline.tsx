import { Polyline, Popup } from 'react-leaflet';
import { Track } from '@/types/gps';
import { Route, Mountain, Clock } from 'lucide-react';

interface TrailPolylineProps {
  track: Track;
}

export function TrailPolyline({ track }: TrailPolylineProps) {
  const positions = track.points.map((p) => [p.lat, p.lng] as [number, number]);

  if (positions.length < 2) return null;

  // Calculate track stats
  const totalPoints = track.points.length;
  const elevations = track.points
    .filter((p) => p.elevacao !== null)
    .map((p) => p.elevacao as number);

  const minElevation = elevations.length > 0 ? Math.min(...elevations) : null;
  const maxElevation = elevations.length > 0 ? Math.max(...elevations) : null;

  const firstPoint = track.points[0];
  const lastPoint = track.points[track.points.length - 1];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: 'hsl(185 55% 40%)',
        weight: 4,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    >
      <Popup className="gps-popup">
        <div className="p-4 min-w-[240px]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-trail/10 flex items-center justify-center flex-shrink-0">
              <Route className="w-5 h-5 text-trail" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">Trilha</h3>
              <p className="text-sm text-muted-foreground">
                {totalPoints} pontos registrados
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            {minElevation !== null && maxElevation !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Mountain className="w-4 h-4 text-elevation" />
                <span className="text-muted-foreground">Elevação:</span>
                <span className="font-medium">
                  {minElevation.toFixed(0)}m - {maxElevation.toFixed(0)}m
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Período:</span>
              <span className="font-medium">
                {formatDate(firstPoint.timestamp)} - {formatDate(lastPoint.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Polyline>
  );
}
