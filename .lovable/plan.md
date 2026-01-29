
# Plano: Importar CSV Wellington.csv para pontos_gps

## Resumo
Criar funcionalidade completa de importação de CSV que parseie o arquivo Wellington.csv (4.657 pontos GPS) e insira os dados na tabela `pontos_gps` do banco de dados.

## Estrutura do CSV

O arquivo possui formato compatível com a tabela:

| Coluna CSV | Campo Banco | Tipo |
|------------|-------------|------|
| id | id | uuid |
| tipo | tipo | text |
| nome | nome | text |
| descricao | descricao | text |
| lat | lat | float |
| lng | lng | float |
| elevacao | elevacao | float |
| timestamp | timestamp | timestamp |
| track_id | track_id | uuid |

## Desafios Identificados

1. **Descrições com quebra de linha**: Algumas descrições contêm texto multilinha entre aspas
2. **Volume de dados**: 4.657 registros exigem inserção em lotes
3. **Campos vazios**: Elevação, timestamp e track_id podem estar vazios

## Componentes a Criar

### 1. Hook: useCSVImport
**Arquivo:** `src/hooks/useCSVImport.ts`

- Parser CSV robusto que trata campos entre aspas
- Validação de dados obrigatórios (nome, lat, lng)
- Conversão de tipos (string para number/date)
- Inserção em lotes de 500 registros
- Gerenciamento de progresso e erros

### 2. Componente: CSVImportDialog
**Arquivo:** `src/components/map/CSVImportDialog.tsx`

Interface com:
- Área de drag & drop para arquivos
- Preview dos primeiros registros
- Contador de registros válidos/inválidos
- Barra de progresso durante importação
- Mensagens de sucesso/erro

### 3. Modificações no MapHeader
**Arquivo:** `src/components/map/MapHeader.tsx`

- Adicionar botão "Importar CSV" com ícone de upload

### 4. Modificações no GPSMap
**Arquivo:** `src/components/map/GPSMap.tsx`

- Estado para controlar o diálogo de importação
- Renderização do CSVImportDialog

## Detalhes Técnicos

### Parser CSV Robusto

Para lidar com campos que contêm vírgulas ou quebras de linha:

```typescript
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
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
```

### Inserção em Lotes

Para performance com milhares de registros:

```typescript
const BATCH_SIZE = 500;

for (let i = 0; i < validPoints.length; i += BATCH_SIZE) {
  const batch = validPoints.slice(i, i + BATCH_SIZE);
  await supabase.from('pontos_gps').insert(batch);
  setProgress((i + batch.length) / validPoints.length * 100);
}
```

### Validação de Dados

```typescript
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

function validatePoint(row: Record<string, string>): CSVPoint | null {
  const nome = row.nome?.trim();
  const lat = parseFloat(row.lat);
  const lng = parseFloat(row.lng);
  
  if (!nome || isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;
  
  return {
    id: row.id || undefined,
    nome,
    lat,
    lng,
    tipo: row.tipo === 'trackpoint' ? 'trackpoint' : 'waypoint',
    descricao: row.descricao || undefined,
    elevacao: row.elevacao ? parseFloat(row.elevacao) : undefined,
    timestamp: row.timestamp || undefined,
    track_id: row.track_id || undefined,
  };
}
```

## Interface do Usuário

### Fluxo de Importação

1. Usuário clica em "Importar CSV" no header
2. Diálogo abre com área de drag & drop
3. Usuário arrasta o arquivo Wellington.csv
4. Sistema mostra preview: "4.657 registros encontrados"
5. Usuário clica "Importar"
6. Barra de progresso: "Importando... 2.500/4.657"
7. Toast de sucesso: "4.657 pontos importados!"
8. Mapa atualiza automaticamente com os novos pontos

### Layout do Diálogo

```text
+------------------------------------------+
|  [X] Importar CSV                        |
+------------------------------------------+
|                                          |
|  +------------------------------------+  |
|  |                                    |  |
|  |  [Upload Icon]                     |  |
|  |                                    |  |
|  |  Arraste um arquivo CSV aqui      |  |
|  |  ou clique para selecionar        |  |
|  |                                    |  |
|  +------------------------------------+  |
|                                          |
|  Formato esperado:                       |
|  nome, lat, lng, tipo, descricao, ...    |
|                                          |
+------------------------------------------+
|               [Cancelar]                 |
+------------------------------------------+
```

## Arquivos a Modificar/Criar

| Arquivo | Ação |
|---------|------|
| `src/hooks/useCSVImport.ts` | Criar |
| `src/components/map/CSVImportDialog.tsx` | Criar |
| `src/components/map/MapHeader.tsx` | Modificar |
| `src/components/map/GPSMap.tsx` | Modificar |

## Resultado Esperado

Após aprovar este plano:
1. Botão "Importar CSV" aparecerá no header do mapa
2. Você poderá arrastar o arquivo Wellington.csv
3. Os 4.657 pontos serão importados para o banco
4. O mapa exibirá todos os waypoints com clustering
