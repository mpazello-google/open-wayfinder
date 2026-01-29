import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useGPSPoints } from '@/hooks/useGPSPoints';
import { FilterType } from '@/types/gps';
import { WaypointMarker } from './WaypointMarker';
import { TrailPolyline } from './TrailPolyline';
import { MapFilters } from './MapFilters';
import { MapHeader } from './MapHeader';
import { MapStats } from './MapStats';
import { CreateWaypointDialog } from './CreateWaypointDialog';
import { CSVImportDialog } from './CSVImportDialog';

// Fix Leaflet default marker icon
const leafletIcon = L.Icon.Default.prototype as {
  _getIconUrl?: () => void;
};
delete leafletIcon._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to handle map bounds
function MapBoundsHandler({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);

  return null;
}

// Component to handle map clicks
function MapClickHandler({
  isAdding,
  onMapClick,
}: {
  isAdding: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (isAdding) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
  }, [isAdding, map]);

  useMapEvents({
    click: (e) => {
      if (isAdding) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return null;
}

export function GPSMap() {
  const { waypoints, tracks, isLoading, createPoint, getBounds } = useGPSPoints();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const bounds = useMemo(() => getBounds(), [getBounds]);

  const handleMapClick = (lat: number, lng: number) => {
    setClickPosition({ lat, lng });
    setDialogOpen(true);
    setIsAddingWaypoint(false);
  };

  const handleOpenImport = () => {
    setImportDialogOpen(true);
  };

  const showWaypoints = filter === 'all' || filter === 'waypoints';
  const showTrails = filter === 'all' || filter === 'trails';

  // Default center (Brazil)
  const defaultCenter: [number, number] = [-15.7801, -47.9292];
  const defaultZoom = 4;

  return (
    <div className="relative w-full h-screen">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsHandler bounds={bounds} />
        <MapClickHandler isAdding={isAddingWaypoint} onMapClick={handleMapClick} />

        {/* Trails */}
        {showTrails &&
          tracks.map((track) => <TrailPolyline key={track.id} track={track} />)}

        {/* Waypoints with clustering */}
        {showWaypoints && (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={60}
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            disableClusteringAtZoom={16}
          >
            {waypoints.map((point) => (
              <WaypointMarker key={point.id} point={point} />
            ))}
          </MarkerClusterGroup>
        )}
      </MapContainer>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <MapHeader
          isAddingWaypoint={isAddingWaypoint}
          onToggleAddWaypoint={() => setIsAddingWaypoint(!isAddingWaypoint)}
          onOpenImport={handleOpenImport}
        />
      </div>

      {/* Filters */}
      <div className="absolute top-24 left-4 z-[1000]">
        <MapFilters
          filter={filter}
          onFilterChange={setFilter}
          waypointsCount={waypoints.length}
          tracksCount={tracks.length}
        />
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <MapStats
          waypointsCount={waypoints.length}
          tracksCount={tracks.length}
          isLoading={isLoading}
        />
      </div>

      {/* Zoom controls position fix */}
      <style>{`
        .leaflet-control-zoom {
          position: absolute;
          right: 16px;
          bottom: 80px;
        }
      `}</style>

      {/* Create Waypoint Dialog */}
      <CreateWaypointDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreate={(data) => createPoint.mutate(data)}
        position={clickPosition}
        isLoading={createPoint.isPending}
      />

      {/* CSV Import Dialog */}
      {importDialogOpen && (
        <CSVImportDialog
          isOpen={importDialogOpen}
          onClose={() => setImportDialogOpen(false)}
        />
      )}
    </div>
  );
}
