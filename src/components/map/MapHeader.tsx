import { Compass, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MapHeaderProps {
  isAddingWaypoint: boolean;
  onToggleAddWaypoint: () => void;
}

export function MapHeader({ isAddingWaypoint, onToggleAddWaypoint }: MapHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="map-control flex items-center justify-between p-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Compass className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-foreground">GPS Mapper</h1>
          <p className="text-xs text-muted-foreground">Visualize e cadastre pontos GPS</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate('/import-gpx')}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Importar GPX</span>
        </Button>
        <Button
          onClick={onToggleAddWaypoint}
          variant={isAddingWaypoint ? 'default' : 'outline'}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isAddingWaypoint ? 'Clique no mapa' : 'Novo Waypoint'}
          </span>
          <span className="sm:hidden">
            {isAddingWaypoint ? 'Clique...' : 'Novo'}
          </span>
        </Button>
      </div>
    </header>
  );
}
