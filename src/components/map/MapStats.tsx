import { MapPin, Route, Loader2 } from 'lucide-react';

interface MapStatsProps {
  waypointsCount: number;
  tracksCount: number;
  isLoading: boolean;
}

export function MapStats({ waypointsCount, tracksCount, isLoading }: MapStatsProps) {
  if (isLoading) {
    return (
      <div className="map-control p-3 animate-fade-in">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Carregando pontos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="map-control p-3 animate-fade-in">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-waypoint/10 flex items-center justify-center">
            <MapPin className="w-3 h-3 text-waypoint" />
          </div>
          <span className="font-medium">{waypointsCount}</span>
          <span className="text-muted-foreground hidden sm:inline">waypoints</span>
        </div>

        <div className="w-px h-4 bg-border" />

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-trail/10 flex items-center justify-center">
            <Route className="w-3 h-3 text-trail" />
          </div>
          <span className="font-medium">{tracksCount}</span>
          <span className="text-muted-foreground hidden sm:inline">trilhas</span>
        </div>
      </div>
    </div>
  );
}
