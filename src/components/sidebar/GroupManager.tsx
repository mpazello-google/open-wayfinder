import { useState } from 'react';
import { Plus, Edit2, Trash2, FolderOpen, Check, X } from 'lucide-react';
import { GrupoGPS, CreateGrupoGPS, UpdateGrupoGPS } from '@/types/gps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

interface GroupManagerProps {
  groups: GrupoGPS[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: (data: CreateGrupoGPS) => void;
  onUpdateGroup: (data: UpdateGrupoGPS & { id: string }) => void;
  onDeleteGroup: (id: string) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function GroupManager({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  isCreating,
  isUpdating,
  isDeleting,
}: GroupManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<GrupoGPS | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<GrupoGPS | null>(null);
  const [formData, setFormData] = useState({ nome: '', cor: PRESET_COLORS[0], descricao: '' });

  const handleOpenCreate = () => {
    setEditingGroup(null);
    setFormData({ nome: '', cor: PRESET_COLORS[0], descricao: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (group: GrupoGPS) => {
    setEditingGroup(group);
    setFormData({
      nome: group.nome,
      cor: group.cor,
      descricao: group.descricao || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (group: GrupoGPS) => {
    setGroupToDelete(group);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome.trim()) return;

    if (editingGroup) {
      onUpdateGroup({ id: editingGroup.id, ...formData });
    } else {
      onCreateGroup(formData);
    }
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (groupToDelete) {
      onDeleteGroup(groupToDelete.id);
      if (selectedGroupId === groupToDelete.id) {
        onSelectGroup(null);
      }
    }
    setIsDeleteDialogOpen(false);
    setGroupToDelete(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Grupos</h3>
        <Button size="sm" variant="ghost" onClick={handleOpenCreate} className="h-7 px-2">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-1">
        {/* All Points option */}
        <button
          onClick={() => onSelectGroup(null)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors',
            selectedGroupId === null
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          )}
        >
          <FolderOpen className="h-4 w-4" />
          <span className="flex-1 text-left">Todos os pontos</span>
        </button>

        {/* Group list */}
        {groups.map((group) => (
          <div
            key={group.id}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors group',
              selectedGroupId === group.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <button
              onClick={() => onSelectGroup(group.id)}
              className="flex items-center gap-2 flex-1 text-left"
            >
              <div
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: group.cor }}
              />
              <span className="truncate">{group.nome}</span>
            </button>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(group);
                }}
                className="p-1 hover:bg-secondary/50 rounded"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDelete(group);
                }}
                className="p-1 hover:bg-destructive/20 rounded text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do grupo"
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, cor: color })}
                    className={cn(
                      'h-8 w-8 rounded-full transition-transform hover:scale-110',
                      formData.cor === color && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do grupo"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.nome.trim() || isCreating || isUpdating}
            >
              {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              O grupo "{groupToDelete?.nome}" será excluído. Os pontos associados não serão
              excluídos, apenas desvinculados do grupo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
