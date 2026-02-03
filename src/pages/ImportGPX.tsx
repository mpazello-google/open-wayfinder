import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGPSPoints } from '@/hooks/useGPSPoints';
import { Upload, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GPXWaypoint {
  name: string;
  lat: number;
  lon: number;
  description?: string;
  elevation?: number;
}

const ImportGPX = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);
  const { createPoint } = useGPSPoints();
  const navigate = useNavigate();

  const parseGPXFile = async (gpxContent: string): Promise<GPXWaypoint[]> => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(gpxContent, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Arquivo GPX inválido');
    }

    const waypoints: GPXWaypoint[] = [];
    const wptElements = xmlDoc.getElementsByTagName('wpt');

    for (let i = 0; i < wptElements.length; i++) {
      const wpt = wptElements[i];
      const lat = parseFloat(wpt.getAttribute('lat') || '0');
      const lon = parseFloat(wpt.getAttribute('lon') || '0');
      
      const nameElement = wpt.getElementsByTagName('name')[0];
      const descElement = wpt.getElementsByTagName('desc')[0];
      const eleElement = wpt.getElementsByTagName('ele')[0];
      
      waypoints.push({
        name: nameElement?.textContent || `Waypoint ${i + 1}`,
        lat,
        lon,
        description: descElement?.textContent || undefined,
        elevation: eleElement ? parseFloat(eleElement.textContent || '0') : undefined,
      });
    }

    return waypoints;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.gpx')) {
        toast.error('Por favor, selecione um arquivo GPX válido');
        return;
      }
      setFile(selectedFile);
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Selecione um arquivo GPX primeiro');
      return;
    }

    setIsProcessing(true);
    setImportStatus(null);

    try {
      // Read file content
      const fileContent = await file.text();
      
      // Parse GPX
      const waypoints = await parseGPXFile(fileContent);
      
      if (waypoints.length === 0) {
        toast.warning('Nenhum waypoint encontrado no arquivo GPX');
        setIsProcessing(false);
        return;
      }

      // Import waypoints to database
      let success = 0;
      let failed = 0;

      for (const waypoint of waypoints) {
        try {
          await createPoint.mutateAsync({
            nome: waypoint.name,
            descricao: waypoint.description,
            lat: waypoint.lat,
            lng: waypoint.lon,
            tipo: 'waypoint',
            elevacao: waypoint.elevation,
          });
          success++;
        } catch (error) {
          console.error('Erro ao importar waypoint:', error);
          failed++;
        }
      }

      setImportStatus({
        success,
        failed,
        total: waypoints.length,
      });

      if (failed === 0) {
        toast.success(`${success} waypoints importados com sucesso!`);
      } else {
        toast.warning(`${success} importados, ${failed} falharam`);
      }
    } catch (error) {
      console.error('Erro ao processar arquivo GPX:', error);
      toast.error('Erro ao processar arquivo GPX: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Mapa
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Importar Arquivo GPX
            </CardTitle>
            <CardDescription>
              Faça upload de um arquivo GPX para importar waypoints para o mapa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gpx-file">Selecione o arquivo GPX</Label>
              <Input
                id="gpx-file"
                type="file"
                accept=".gpx"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
              {file && (
                <p className="text-sm text-gray-600">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar Waypoints
                </>
              )}
            </Button>

            {importStatus && (
              <Alert className={importStatus.failed === 0 ? 'border-green-500' : 'border-yellow-500'}>
                {importStatus.failed === 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  <strong>Importação concluída:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>✅ {importStatus.success} waypoints importados com sucesso</li>
                    {importStatus.failed > 0 && (
                      <li>❌ {importStatus.failed} waypoints falharam</li>
                    )}
                    <li>📊 Total: {importStatus.total} waypoints processados</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Como usar:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Selecione um arquivo GPX do seu computador</li>
                <li>Clique em "Importar Waypoints"</li>
                <li>Os waypoints serão adicionados ao mapa automaticamente</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportGPX;
