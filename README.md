# Heyama Test — Plateforme de gestion d'Objects

Mini-système full-stack : API centrale (NestJS) communiquant avec un client web (Next.js) et un client mobile (Expo), upload d'images vers Cloudflare R2 (S3-compatible), synchronisation temps réel via Socket.io.

Voir le cahier des charges complet : [docs/CDC.md](docs/CDC.md).

## Structure du repo

```
.
├── api/       # NestJS + MongoDB (Mongoose) + Cloudflare R2 + Socket.io
├── web/       # Next.js + shadcn/ui
├── mobile/    # React Native + Expo
├── docs/      # Cahier des charges
└── docker-compose.yml   # MongoDB local
```

## Setup

### 1. MongoDB (Docker local)

```bash
docker-compose up -d
```

### 2. API (NestJS)

```bash
cd api
cp .env.example .env   # renseigner les variables R2 (voir docs/CDC.md §4.5)
npm install
npm run start:dev
```

### 3. Web (Next.js)

```bash
cd web
npm install
npm run dev
```

### 4. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

⚠️ Pour que l'app mobile (device physique ou émulateur) joigne l'API, configurer l'IP locale de la machine hôte (pas `localhost`) dans la config du client mobile, ex. `http://192.168.x.x:3000`.

## Variables d'environnement (API)

```
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=heyama-objects
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
MONGO_URI=mongodb://localhost:27017/heyama
PORT=3000
```
