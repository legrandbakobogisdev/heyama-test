# Heyama Test — Plateforme de gestion d'Objects

Mini-système full-stack : API centrale (NestJS) communiquant avec un client web (Next.js) et un client mobile (Expo), upload d'images vers MinIO (S3-compatible, local), synchronisation temps réel via Socket.io.

Voir le cahier des charges complet : [docs/CDC.md](docs/CDC.md).

## Structure du repo

```
.
├── api/       # NestJS + MongoDB (Mongoose) + MinIO (S3-compatible) + Socket.io
├── web/       # Next.js + shadcn/ui
├── mobile/    # React Native + Expo
├── docs/      # Cahier des charges
└── docker-compose.yml   # MongoDB + MinIO en local
```

## Setup

### 1. MongoDB + MinIO (Docker local)

```bash
docker-compose up -d
```

Le service `minio-init` crée automatiquement le bucket `heyama-objects` et le rend public en lecture au premier démarrage. Console MinIO disponible sur http://localhost:9001 (identifiants : `minioadmin` / `minioadmin`).

### 2. API (NestJS)

```bash
cd api
cp .env.example .env
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

⚠️ Pour joindre l'API/MinIO depuis un device physique (mobile), l'app mobile et `S3_PUBLIC_URL` doivent utiliser l'**IP locale de la machine hôte** (pas `localhost`), tant que le téléphone est sur le même réseau Wi-Fi que le PC — ex. `http://192.168.x.x:3000`. `S3_ENDPOINT` reste en `localhost` (utilisé uniquement côté serveur, sur la même machine que MinIO). Si l'IP locale change (autre réseau Wi-Fi), mettre à jour `api/.env` et redémarrer l'API. Ngrok reste une option de secours si mobile et PC ne sont pas sur le même réseau.

## Variables d'environnement (API)

```
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=heyama-objects
S3_PUBLIC_URL=http://192.168.x.x:9000
MONGO_URI=mongodb://localhost:27017/heyama
PORT=3000
```
