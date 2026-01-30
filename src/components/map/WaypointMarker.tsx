import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PontoGPS } from '@/types/gps';
import { MapPin, Mountain, Calendar, Pencil, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaypointMarkerProps {
  point: PontoGPS;
  onEdit?: (point: PontoGPS) => void;
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

// Custom trackpoint icon
const trackpointIcon = L.divIcon({
  className: 'trackpoint-marker-container',
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: hsl(217 91% 60%);
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
      </svg>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export function WaypointMarker({ point, onEdit }: WaypointMarkerProps) {
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

  const isWaypoint = point.tipo === 'waypoint';
  const icon = isWaypoint ? waypointIcon : trackpointIcon;

  return (
    <Marker position={[point.lat, point.lng]} icon={icon}>
      <Popup className="gps-popup">
        <div className="p-4 min-w-[240px]">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isWaypoint ? 'bg-waypoint/10' : 'bg-primary/10'}`}>
              {isWaypoint ? (
                <MapPin className="w-5 h-5 text-waypoint" />
              ) : (
                <Navigation className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate flex-1">{point.nome}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isWaypoint ? 'bg-waypoint/10 text-waypoint' : 'bg-primary/10 text-primary'}`}>
                  {isWaypoint ? 'waypoint' : 'trackpoint'}
                </span>
              </div>
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

          {onEdit && (
            <div className="pt-3 mt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => onEdit(point)}
              >
                <Pencil className="w-4 h-4" />
                Editar ponto
              </Button>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
