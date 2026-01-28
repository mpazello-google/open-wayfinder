import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PontoGPS } from '@/types/gps';
import { MapPin, Mountain, Calendar } from 'lucide-react';

interface WaypointMarkerProps {
  point: PontoGPS;
}

// Custom waypoint icon
const waypointIcon = L.divIcon({
  className: 'waypoint-marker-container',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: hsl(24 95% 53%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export function WaypointMarker({ point }: WaypointMarkerProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Marker position={[point.lat, point.lng]} icon={waypointIcon}>
      <Popup className="gps-popup">
        <div className="p-4 min-w-[220px]">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-waypoint/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-waypoint" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{point.nome}</h3>
              {point.descricao && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                  {point.descricao}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            {point.elevacao !== null && (
              <div className="flex items-center gap-2 text-sm">
                <Mountain className="w-4 h-4 text-elevation" />
                <span className="text-muted-foreground">Elevação:</span>
                <span className="font-medium">{point.elevacao.toFixed(0)}m</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Data:</span>
              <span className="font-medium">{formatDate(point.timestamp)}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span>
                {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
