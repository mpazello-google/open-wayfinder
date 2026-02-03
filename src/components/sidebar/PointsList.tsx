import { useState, useMemo } from 'react';
import { MapPin, Route, Search, Edit2, Download, CheckSquare, Square } from 'lucide-react';
import { PontoGPS, GrupoGPS } from '@/types/gps';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { generateGPX, downloadGPX } from '@/lib/gpx';
import { toast } from 'sonner';

interface PointsListProps {
  points: PontoGPS[];
  groups: GrupoGPS[];
  selectedGroupId: string | null;
  onSelectPoint: (point: PontoGPS) => void;
  onEditPoint: (point: PontoGPS) => void;
}

export function PointsList({
  points,
  groups,
  selectedGroupId,
  onSelectPoint,
  onEditPoint,
}: PointsListProps) {
  const [search, setSearch] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<Set<string>>(new Set());

  const filteredPoints = useMemo(() => {
    let filtered = points;

    // Filter by group
    if (selectedGroupId) {
      filtered = filtered.filter((p) => p.grupo_id === selectedGroupId);
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.nome.toLowerCase().includes(searchLower) ||
          p.descricao?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [points, selectedGroupId, search]);

  const getGroupColor = (grupoId: string | null) => {
    if (!grupoId) return null;
    const group = groups.find((g) => g.id === grupoId);
    return group?.cor || null;
  };

  const waypoints = filteredPoints.filter((p) => p.tipo === 'waypoint');
  const trackpoints = filteredPoints.filter((p) => p.tipo === 'trackpoint');

  const togglePointSelection = (pointId: string) => {
    setSelectedPoints((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pointId)) {
        newSet.delete(pointId);
      } else {
        newSet.add(pointId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedPoints.size === filteredPoints.length) {
      setSelectedPoints(new Set());
    } else {
      setSelectedPoints(new Set(filteredPoints.map((p) => p.id)));
    }
  };

  const allSelected = filteredPoints.length > 0 && selectedPoints.size === filteredPoints.length;
  const someSelected = selectedPoints.size > 0 && selectedPoints.size < filteredPoints.length;

  const handleExportGPX = () => {
    if (selectedPoints.size === 0) {
      toast.error('Selecione pelo menos um ponto para exportar');
      return;
    }

    try {
      const pointsToExport = points.filter((p) => selectedPoints.has(p.id));
      const gpxContent = generateGPX(pointsToExport);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `waypoints_${timestamp}.gpx`;
      downloadGPX(gpxContent, filename);
      toast.success(`${pointsToExport.length} pontos exportados com sucesso!`);
      setSelectedPoints(new Set()); // Clear selection after export
    } catch (error) {
      console.error('Erro ao exportar GPX:', error);
      toast.error('Erro ao exportar arquivo GPX');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pontos..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {allSeleisSelected={selectedPoints.has(point.id)}
                    onToggleSelect={() => togglePointSelection(point.id)}
                    cted ? (
              <CheckSquare className="h-4 w-4" />
            ) : someSelected ? (
              <CheckSquare className="h-4 w-4 opacity-50" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedPoints.size > 0 ? (
              <span>{selectedPoints.size} selecionados</span>
            ) : (
              <span>Selecionar todos</span>
            )}
          </button>
          <Button
            onClick={handleExportGPX}
            disabled={selectedPoints.size === 0}
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
          >
            <Download className="h-3 w-3" />
            Exportar GPX
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Waypoints Section */}
          {waypoints.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Waypoints ({waypoints.length})
              </h4>
              <div className="space-y-1">
                {waypoints.map((point) => (
                  <PointItem
                    key={point.id}
                    point={point}
                    groupColor={getGroupColor(point.grupo_id)}
                    onSelect={() => onSelectPoint(point)}
                    onEdit={() => onEditPoint(point)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trackpoints Section */}
          {trackpoints.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Route className="h-3 w-3" />
                Trackpoints ({trackpoints.length})
              </h4>
              <div className="space-y-1">
                {trackpoints.slice(0, 100).map((point) => (
                  <PointItem
                    key={point.id}
                    isSelected={selectedPoints.has(point.id)}
                    onToggleSelect={() => togglePointSelection(point.id)}
                    point={point}
                    groupColor={getGroupColor(point.grupo_id)}
                    onSelect={() => onSelectPoint(point)}
                    onEdit={() => onEditPoint(point)}
                  />
                ))}
                {trackpoints.length > 100 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Mostrando 100 de {trackpoints.length} trackpoints
                  </p>
                )}
              </div>
            </div>
          )}

          {filteredPoints.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum ponto encontrado</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface PointItemProps {
  isSelected: boolean;
  onToggleSelect: () => void;
  onSelect: () => void;
  onEdit: () => void;
}

function PointItem({ point, groupColor, isSelected, onToggleSelect, onSelect, onEdit }: PointItemProps) {
  const isWaypoint = point.tipo === 'waypoint';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm group',
        'hover:bg-muted cursor-pointer transition-colors',
        isSelected && 'bg-muted/50'
      )}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggleSelect}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      /    'hover:bg-muted cursor-pointer transition-colors'
      )}
    >
      <button onClick={onSelect} className="flex items-center gap-2 flex-1 min-w-0 text-left">
        <div className="relative shrink-0">
          {isWaypoint ? (
            <MapPin className="h-4 w-4 text-waypoint" />
          ) : (
            <Route className="h-4 w-4 text-trail" />
          )}
          {groupColor && (
            <div
              className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background"
              style={{ backgroundColor: groupColor }}
            />
          )}
        </div>
        <span className="truncate">{point.nome}</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </button>
    </div>
  );
}
