import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { useGPSPoints } from '@/hooks/useGPSPoints';
import { FilterType, PontoGPS } from '@/types/gps';
import { WaypointMarker } from './WaypointMarker';
import { TrailPolyline } from './TrailPolyline';
import { MapFilters } from './MapFilters';
import { MapHeader } from './MapHeader';
import { MapStats } from './MapStats';
import { CreateWaypointDialog } from './CreateWaypointDialog';
import { EditPanel } from './EditPanel';

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

// Component to center map on specific point
function MapCenterHandler({ point }: { point: PontoGPS | null }) {
  const map = useMap();

  useEffect(() => {
    if (point) {
      map.setView([point.lat, point.lng], 16, { animate: true });
    }
  }, [point, map]);

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
  const { waypoints, trackpoints, tracks, isLoading, createPoint, updatePoint, deletePoint, getBounds } = useGPSPoints();
  const [filter, setFilter] = useState<FilterType>('all');
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<PontoGPS | null>(null);

  const bounds = useMemo(() => getBounds(), [getBounds]);

  const handleMapClick = (lat: number, lng: number) => {
    setClickPosition({ lat, lng });
    setCreateDialogOpen(true);
    setIsAddingWaypoint(false);
  };

  const handleEditPoint = (point: PontoGPS) => {
    setSelectedPoint(point);
  };

  const handleUpdatePoint = (data: Parameters<typeof updatePoint.mutate>[0]) => {
    updatePoint.mutate(data, {
      onSuccess: () => {
        setSelectedPoint(null);
      },
    });
  };

  const handleDeletePoint = (id: string) => {
    deletePoint.mutate(id, {
      onSuccess: () => {
        setSelectedPoint(null);
      },
    });
  };

  const showWaypoints = filter === 'all' || filter === 'waypoints';
  const showTrails = filter === 'all' || filter === 'trails';
  const allMarkers = showWaypoints ? [...waypoints, ...trackpoints] : trackpoints;

  // Default center (Brazil)
  const defaultCenter: [number, number] = [-15.7801, -47.9292];
  const defaultZoom = 4;

  return (
    <div className="relative w-full h-screen flex">
      {/* Map Container */}
      <div className={`flex-1 relative ${selectedPoint ? 'w-[calc(100%-384px)]' : 'w-full'}`}>
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
        <MapCenterHandler point={selectedPoint} />
        <MapClickHandler isAdding={isAddingWaypoint} onMapClick={handleMapClick} />

        {/* Trails */}
        {showTrails &&
          tracks.map((track) => <TrailPolyline key={track.id} track={track} />)}

        {/* All points as markers with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          disableClusteringAtZoom={16}
        >
          {allMarkers.map((point) => (
            <WaypointMarker key={point.id} point={point} onEdit={handleEditPoint} />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <MapHeader
          isAddingWaypoint={isAddingWaypoint}
          onToggleAddWaypoint={() => setIsAddingWaypoint(!isAddingWaypoint)}
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
          trackpointsCount={trackpoints.length}
          tracksCount={tracks.length}
          isLoading={isLoading}
        />
      </div>

      {/* Zoom controls position fix */}
      <style>{`
        .leaflet-control-zoom {
          position: absolute;
          right: ${selectedPoint ? '400px' : '16px'};
          bottom: 80px;
        }
      `}</style>
    </div>

      {/* Create Waypoint Dialog */}
      <CreateWaypointDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={(data) => createPoint.mutate(data)}
        position={clickPosition}
        isLoading={createPoint.isPending}
      />

      {/* Edit Panel */}
      {selectedPoint && (
        <EditPanel
          point={selectedPoint}
          onClose={() => setSelectedPoint(null)}
          onUpdate={handleUpdatePoint}
          onDelete={handleDeletePoint}
          isUpdating={updatePoint.isPending}
          isDeleting={deletePoint.isPending}
        />
      )}
    </div>
  );
}
