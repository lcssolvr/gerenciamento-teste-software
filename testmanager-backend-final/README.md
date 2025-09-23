# TestManager — Backend

## Requisitos
- Node 18+
- Firebase Admin SDK (.env)
- (Opcional) Firebase Emulator

## Instalação e execução
```bash
npm i
cp .env.example .env
# Preencha credenciais Firebase
npm run dev
```

### Rotas principais
- `GET /health`
- `GET /api/auth/me`
- `POST /api/auth/create-user` (admin)
- `GET/POST/PATCH/DELETE /api/clients`
- `GET/POST/PATCH/DELETE /api/projects`
- `GET/POST/PATCH/DELETE /api/projects/:projectId/tests`
- Evidências de testes:
  - `POST /api/projects/:projectId/:testId/evidence`
  - `DELETE /api/projects/:projectId/:testId/evidence`

### Claims
Use `scripts/setClaims.js`:
```bash
node scripts/setClaims.js <UID> admin
node scripts/setClaims.js <UID> client <CLIENT_ID>
```

## .env
Veja `.env.example` (inclui `FIREBASE_STORAGE_BUCKET`).
