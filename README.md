# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Leaflet (maps)
- Supabase (database)
- TanStack Query (data fetching)

## Importação de Pontos GPS

O projeto suporta importação de waypoints e trackpoints através de arquivos CSV ou JSON.

### Formato CSV

O arquivo CSV deve conter as seguintes colunas (separadas por vírgula):

```csv
id,tipo,nome,descricao,lat,lng,elevacao,timestamp,track_id
550e8400-e29b-41d4-a716-446655440001,waypoint,Praia de Copacabana,Praia famosa,-22.9711,-43.1822,5,2026-01-29T10:00:00Z,
```

### Formato JSON

O arquivo JSON deve conter um array de objetos com os seguintes campos:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "nome": "Praia de Copacabana",
    "descricao": "Praia famosa no Rio de Janeiro",
    "lat": -22.9711,
    "lng": -43.1822,
    "tipo": "waypoint",
    "elevacao": 5,
    "timestamp": "2026-01-29T10:00:00Z",
    "track_id": ""
  }
]
```

### Campos Obrigatórios

- `nome` (string): Nome do ponto
- `lat` (number): Latitude (-90 a 90)
- `lng` (number): Longitude (-180 a 180)
- `tipo` (string): "waypoint" ou "trackpoint"

### Campos Opcionais

- `id` (string): UUID único (será gerado automaticamente se omitido)
- `descricao` (string): Descrição do ponto
- `elevacao` (number): Elevação em metros
- `timestamp` (string): Data/hora no formato ISO 8601
- `track_id` (string): Identificador da trilha (para trackpoints)

### Exemplos

Veja os arquivos de exemplo incluídos no projeto:
- `exemplo-pontos.csv` - Exemplo com ~4600 waypoints reais
- `exemplo-pontos.json` - Exemplo com pontos do Rio de Janeiro

## Configuração do Supabase

1. Crie um arquivo `.env` na raiz do projeto (use `.env.example` como referência):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-anon-aqui
VITE_SUPABASE_PROJECT_ID=seu-projeto-id
```

2. Execute as migrações SQL em `supabase/migrations/` no seu projeto Supabase

## Deploy com Docker

### Construir e executar:

```bash
# Construir e iniciar o container
docker-compose up --build -d

# Ver logs
docker-compose logs -f

# Parar o container
docker-compose down
```

O projeto estará disponível em: http://localhost:8090/

**Nota**: As variáveis de ambiente do `.env` são automaticamente injetadas no build do Docker.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
