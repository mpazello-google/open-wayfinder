import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import https from 'https';

// Ignora erro de certificado SSL (apenas para ambiente corporativo)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const SUPABASE_URL = 'https://tygrlihpyquxmccnwifr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5Z3JsaWhweXF1eG1jY253aWZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MDEzMTUsImV4cCI6MjA4NTE3NzMxNX0.b-7wPHascYOKR8LGJu7L6hk_1xREun9UL1LqJL_viyo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseCSV(text) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }
  
  return data;
}

async function importCSV(filename) {
  console.log(`📁 Lendo arquivo: ${filename}`);
  const csvContent = readFileSync(filename, 'utf-8');
  
  console.log('📊 Parseando CSV...');
  const rows = parseCSV(csvContent);
  
  console.log(`✅ ${rows.length} registros encontrados`);
  
  const points = rows.map(row => ({
    nome: row.nome,
    lat: parseFloat(row.lat),
    lng: parseFloat(row.lng),
    tipo: row.tipo || 'waypoint',
    descricao: row.descricao || null,
    elevacao: row.elevacao ? parseFloat(row.elevacao) : null,
    timestamp: row.timestamp || null,
    track_id: row.track_id || null
  }));
  
  console.log('📤 Enviando para o Supabase...');
  const { data, error } = await supabase
    .from('pontos_gps')
    .insert(points)
    .select();
  
  if (error) {
    console.error('❌ Erro ao importar:', error);
    process.exit(1);
  }
  
  console.log(`✅ ${data.length} pontos importados com sucesso!`);
  data.forEach(point => {
    console.log(`  - ${point.nome} (${point.lat}, ${point.lng})`);
  });
}

const filename = process.argv[2] || 'exemplo-pontos.csv';
importCSV(filename).catch(console.error);
