import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useCSVImport } from '@/hooks/useCSVImport';

interface CSVImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedData {
  validPoints: Array<{
    nome: string;
    lat: number;
    lng: number;
    tipo: 'waypoint' | 'trackpoint';
    descricao?: string;
    elevacao?: number;
    timestamp?: string;
    track_id?: string;
  }>;
  invalidCount: number;
  headers: string[];
}

export function CSVImportDialog({ isOpen, onClose }: CSVImportDialogProps) {
  const { parseFile, importPoints, isImporting, progress, resetProgress } = useCSVImport();
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');

  const handleClose = useCallback(() => {
    if (!isImporting) {
      setParsedData(null);
      setFileName('');
      setParseError('');
      resetProgress();
      onClose();
    }
  }, [isImporting, onClose, resetProgress]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setParseError('Por favor, selecione um arquivo CSV válido.');
      return;
    }

    setParseError('');
    setFileName(file.name);

    try {
      const result = await parseFile(file);
      setParsedData(result);
    } catch (error) {
      setParseError('Erro ao processar o arquivo CSV.');
      setParsedData(null);
    }
  }, [parseFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = useCallback(() => {
    if (parsedData?.validPoints.length) {
      importPoints(parsedData.validPoints, {
        onSuccess: () => {
          handleClose();
        },
      });
    }
  }, [parsedData, importPoints, handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar CSV
          </DialogTitle>
          <DialogDescription>
            Importe pontos GPS a partir de um arquivo CSV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop zone - only show when not importing and no data parsed */}
          {!isImporting && !parsedData && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
              `}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInput}
              />
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                Arraste um arquivo CSV aqui
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou clique para selecionar
              </p>
            </div>
          )}

          {/* Parse error */}
          {parseError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {parseError}
            </div>
          )}

          {/* Parsed data preview */}
          {parsedData && !isImporting && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{fileName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {parsedData.validPoints.length.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Registros válidos</p>
                  </div>
                </div>

                {parsedData.invalidCount > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-2xl font-bold text-destructive">
                        {parsedData.invalidCount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Inválidos</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview of first few records */}
              <div className="text-xs text-muted-foreground">
                <p className="mb-1">Primeiros registros:</p>
                <div className="max-h-24 overflow-y-auto space-y-1 bg-muted/50 rounded p-2">
                  {parsedData.validPoints.slice(0, 3).map((point, i) => (
                    <div key={i} className="truncate">
                      {point.nome} ({point.lat.toFixed(4)}, {point.lng.toFixed(4)}) - {point.tipo}
                    </div>
                  ))}
                  {parsedData.validPoints.length > 3 && (
                    <div className="text-muted-foreground/70">
                      ... e mais {(parsedData.validPoints.length - 3).toLocaleString()} registros
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import progress */}
          {isImporting && progress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Importando pontos GPS...</span>
                <span className="font-medium">
                  {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
                </span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {progress.percentage}% concluído
              </p>
            </div>
          )}

          {/* Expected format hint */}
          {!parsedData && !isImporting && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
              <p className="font-medium mb-1">Formato esperado:</p>
              <code className="text-[10px]">
                nome, lat, lng, tipo, descricao, elevacao, timestamp, track_id
              </code>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isImporting}
          >
            Cancelar
          </Button>
          {parsedData && !isImporting && (
            <Button
              onClick={handleImport}
              disabled={parsedData.validPoints.length === 0}
            >
              Importar {parsedData.validPoints.length.toLocaleString()} pontos
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
