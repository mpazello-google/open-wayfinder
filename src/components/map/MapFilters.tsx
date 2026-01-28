import { MapPin, Route } from 'lucide-react';
import { FilterType } from '@/types/gps';
import { cn } from '@/lib/utils';

interface MapFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  waypointsCount: number;
  tracksCount: number;
}

export function MapFilters({
  filter,
  onFilterChange,
  waypointsCount,
  tracksCount,
}: MapFiltersProps) {
  return (
    <div className="map-control p-2 animate-fade-in">
      <div className="flex gap-2">
        <button
          onClick={() => onFilterChange(filter === 'waypoints' ? 'all' : 'waypoints')}
          className={cn(
            'filter-chip filter-chip-waypoint',
            filter === 'waypoints' && 'active'
          )}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Waypoints</span>
          <span className="text-[10px] opacity-70">({waypointsCount})</span>
        </button>

        <button
          onClick={() => onFilterChange(filter === 'trails' ? 'all' : 'trails')}
          className={cn(
            'filter-chip filter-chip-trail',
            filter === 'trails' && 'active'
          )}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Trilhas</span>
          <span className="text-[10px] opacity-70">({tracksCount})</span>
        </button>
      </div>
    </div>
  );
}
