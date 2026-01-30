import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Mountain, Trash2, Navigation, X } from 'lucide-react';
import { PontoGPS, UpdatePontoGPS } from '@/types/gps';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EditPanelProps {
  point: PontoGPS | null;
  onClose: () => void;
  onUpdate: (data: UpdatePontoGPS & { id: string }) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function EditPanel({
  point,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: EditPanelProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [elevacao, setElevacao] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  useEffect(() => {
    if (point) {
      setNome(point.nome);
      setDescricao(point.descricao || '');
      setElevacao(point.elevacao?.toString() || '');
      setLat(point.lat.toString());
      setLng(point.lng.toString());
    }
  }, [point]);

  if (!point) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    onUpdate({
      id: point.id,
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      elevacao: elevacao ? parseFloat(elevacao) : null,
    });
  };

  const handleDelete = () => {
    onDelete(point.id);
  };

  const isWaypoint = point.tipo === 'waypoint';

  return (
    <div className="w-96 bg-background border-l border-border flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isWaypoint ? 'bg-waypoint/10' : 'bg-primary/10'}`}>
            {isWaypoint ? (
              <MapPin className="w-4 h-4 text-waypoint" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
          </div>
          <div>
            <h2 className="font-semibold">Editar {isWaypoint ? 'Waypoint' : 'Trackpoint'}</h2>
            <p className="text-xs text-muted-foreground">Modifique as informações do ponto</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Mirante da Pedra Grande"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Adicione detalhes sobre este local..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="elevacao" className="flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-muted-foreground" />
              Elevação (metros)
            </Label>
            <Input
              id="elevacao"
              type="number"
              value={elevacao}
              onChange={(e) => setElevacao(e.target.value)}
              placeholder="Ex: 1250"
            />
          </div>

          {point.timestamp && (
            <div className="text-sm text-muted-foreground">
              <span>Criado em: </span>
              <span className="font-medium">
                {new Date(point.timestamp).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o ponto "{point.nome}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="submit" disabled={!nome.trim() || isUpdating} className="w-full">
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}
