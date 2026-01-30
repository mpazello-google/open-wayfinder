import { MapPin, Route, Loader2, Navigation } from 'lucide-react';

interface MapStatsProps {
  waypointsCount: number;
  trackpointsCount: number;
  tracksCount: number;
  isLoading: boolean;
}

export function MapStats({ waypointsCount, trackpointsCount, tracksCount, isLoading }: MapStatsProps) {
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

  const totalPoints = waypointsCount + trackpointsCount;

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
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
            <Navigation className="w-3 h-3 text-primary" />
          </div>
          <span className="font-medium">{trackpointsCount}</span>
          <span className="text-muted-foreground hidden sm:inline">trackpoints</span>
        </div>

        <div className="w-px h-4 bg-border" />

        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-trail/10 flex items-center justify-center">
            <Route className="w-3 h-3 text-trail" />
          </div>
          <span className="font-medium">{tracksCount}</span>
          <span className="text-muted-foreground hidden sm:inline">trilhas</span>
        </div>

        <div className="w-px h-4 bg-border hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground">
          <span>Total:</span>
          <span className="font-medium text-foreground">{totalPoints}</span>
        </div>
      </div>
    </div>
  );
}
