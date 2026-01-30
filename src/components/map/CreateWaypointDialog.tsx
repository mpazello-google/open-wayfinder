import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Mountain } from 'lucide-react';
import { CreatePontoGPS } from '@/types/gps';

interface CreateWaypointDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreatePontoGPS) => void;
  position: { lat: number; lng: number } | null;
  isLoading?: boolean;
}

export function CreateWaypointDialog({
  isOpen,
  onClose,
  onCreate,
  position,
  isLoading,
}: CreateWaypointDialogProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [elevacao, setElevacao] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position || !nome.trim()) return;

    onCreate({
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      lat: position.lat,
      lng: position.lng,
      tipo: 'waypoint',
      elevacao: elevacao ? parseFloat(elevacao) : undefined,
    });

    // Reset form
    setNome('');
    setDescricao('');
    setElevacao('');
    onClose();
  };

  const handleClose = () => {
    setNome('');
    setDescricao('');
    setElevacao('');
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-waypoint/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-waypoint" />
            </div>
            Novo Waypoint
          </DialogTitle>
          <DialogDescription>
            Adicione um ponto de interesse no mapa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {position && (
              <div className="flex gap-3 p-3 bg-muted rounded-lg text-sm">
                <div className="flex-1">
                  <span className="text-muted-foreground">Latitude:</span>
                  <span className="ml-2 font-mono font-medium">
                    {position.lat.toFixed(6)}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-muted-foreground">Longitude:</span>
                  <span className="ml-2 font-mono font-medium">
                    {position.lng.toFixed(6)}
                  </span>
                </div>
              </div>
            )}

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
                rows={3}
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nome.trim() || isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Waypoint'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
