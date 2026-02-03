import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { PontoGPS, GrupoGPS, CreateGrupoGPS, UpdateGrupoGPS } from '@/types/gps';
import { GroupManager } from './GroupManager';
import { PointsList } from './PointsList';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MapSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  points: PontoGPS[];
  groups: GrupoGPS[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onSelectPoint: (point: PontoGPS) => void;
  onEditPoint: (point: PontoGPS) => void;
  onCreateGroup: (data: CreateGrupoGPS) => void;
  onUpdateGroup: (data: UpdateGrupoGPS & { id: string }) => void;
  onDeleteGroup: (id: string) => void;
  isCreatingGroup?: boolean;
  isUpdatingGroup?: boolean;
  isDeletingGroup?: boolean;
}

export function MapSidebar({
  isOpen,
  onToggle,
  points,
  groups,
  selectedGroupId,
  onSelectGroup,
  onSelectPoint,
  onEditPoint,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  isCreatingGroup,
  isUpdatingGroup,
  isDeletingGroup,
}: MapSidebarProps) {
  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 top-4 z-[1001] bg-card shadow-lg"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-full bg-card border-r border-border shadow-xl z-[1001]',
          'transition-transform duration-300 ease-in-out',
          'w-80 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="font-semibold text-lg text-foreground">GPS Mapper</h2>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Groups Section */}
        <div className="p-4 shrink-0">
          <GroupManager
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectGroup={onSelectGroup}
            onCreateGroup={onCreateGroup}
            onUpdateGroup={onUpdateGroup}
            onDeleteGroup={onDeleteGroup}
            isCreating={isCreatingGroup}
            isUpdating={isUpdatingGroup}
            isDeleting={isDeletingGroup}
          />
        </div>

        <Separator />

        {/* Points List */}
        <div className="flex-1 min-h-0">
          <PointsList
            points={points}
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelectPoint={onSelectPoint}
            onEditPoint={onEditPoint}
          />
        </div>
      </div>
    </>
  );
}
