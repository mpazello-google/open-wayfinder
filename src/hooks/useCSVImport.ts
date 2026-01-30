import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CSVPoint {
  id?: string;
  nome: string;
  lat: number;
  lng: number;
  tipo: 'waypoint' | 'trackpoint';
  descricao?: string;
  elevacao?: number;
  timestamp?: string;
  track_id?: string;
}

interface ParseResult {
  validPoints: CSVPoint[];
  invalidCount: number;
  headers: string[];
}

interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
}

// Robust CSV parser that handles quoted fields with commas and newlines
function parseCSV(text: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  // Split by lines, respecting quoted fields that may contain newlines
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
      // Skip \r\n as single newline
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  if (lines.length === 0) return rows;

  // Parse header line
  const headers = parseCSVLine(lines[0]);

  // Parse data lines
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function validatePoint(row: Record<string, string>): CSVPoint | null {
  const nome = row.nome?.trim();
  const lat = parseFloat(row.lat);
  const lng = parseFloat(row.lng);

  if (!nome || isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;

  const tipo = row.tipo?.trim().toLowerCase();

  return {
    id: row.id?.trim() || undefined,
    nome,
    lat,
    lng,
    tipo: tipo === 'trackpoint' ? 'trackpoint' : 'waypoint',
    descricao: row.descricao?.trim() || undefined,
    elevacao: row.elevacao ? parseFloat(row.elevacao) : undefined,
    timestamp: row.timestamp?.trim() || undefined,
    track_id: row.track_id?.trim() || undefined,
  };
}

export function useCSVImport() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const parseFile = (file: File): Promise<ParseResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const fileName = file.name.toLowerCase();
          
          let rows: Record<string, string>[] = [];
          
          // Check if file is JSON or CSV
          if (fileName.endsWith('.json')) {
            // Parse JSON
            const jsonData = JSON.parse(text);
            
            if (!Array.isArray(jsonData)) {
              reject(new Error('O arquivo JSON deve conter um array de objetos.'));
              return;
            }
            
            // Convert JSON objects to string records for validation
            rows = jsonData.map(item => {
              const record: Record<string, string> = {};
              for (const key in item) {
                record[key] = item[key] != null ? String(item[key]) : '';
              }
              return record;
            });
          } else {
            // Parse CSV
            rows = parseCSV(text);
          }
          
          const validPoints: CSVPoint[] = [];
          let invalidCount = 0;

          for (const row of rows) {
            const point = validatePoint(row);
            if (point) {
              validPoints.push(point);
            } else {
              invalidCount++;
            }
          }

          const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
          resolve({ validPoints, invalidCount, headers });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Formato inválido';
          reject(new Error(errorMessage));
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsText(file);
    });
  };

  const importMutation = useMutation({
    mutationFn: async (points: CSVPoint[]) => {
      const BATCH_SIZE = 500;
      const total = points.length;
      let imported = 0;

      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = points.slice(i, i + BATCH_SIZE);
        
        // Prepare batch for insert (remove undefined id to let DB generate)
        const insertBatch = batch.map(point => ({
          ...point,
          id: point.id || undefined,
        }));

        const { error } = await supabase.from('pontos_gps').insert(insertBatch);

        if (error) {
          throw new Error(`Erro no lote ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`);
        }

        imported += batch.length;
        setProgress({
          current: imported,
          total,
          percentage: Math.round((imported / total) * 100),
        });
      }

      return imported;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['pontos-gps'] });
      toast.success(`${count} pontos GPS importados com sucesso!`);
      setProgress(null);
    },
    onError: (error) => {
      toast.error('Erro na importação: ' + error.message);
      setProgress(null);
    },
  });

  const resetProgress = () => setProgress(null);

  const reset = () => {
    setProgress(null);
    importMutation.reset();
  };

  return {
    parseFile,
    importPoints: importMutation.mutate,
    isImporting: importMutation.isPending,
    isSuccess: importMutation.isSuccess,
    progress,
    resetProgress,
    reset,
  };
}
