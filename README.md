# Heyama Test — Plateforme de gestion d'Objects

Mini-système full-stack pour le test technique Heyama : une API centrale (NestJS) qui parle à un client web (Next.js) et un client mobile (Expo), avec upload d'images vers MinIO (S3-compatible, en local) et synchronisation temps réel via Socket.io.

Le cahier des charges complet est dans [docs/CDC.md](docs/CDC.md), et une doc technique détaillée (architecture, fichier par fichier) dans [docs/DOCUMENTATION.pdf](docs/DOCUMENTATION.pdf).

## Déploiement en production

L'app tourne en continu, indépendamment de toute machine locale :

- **Web** : https://heyama-web.onrender.com
- **API** : https://heyama-api-tn3u.onrender.com
- **Mobile** : build l'APK (voir plus bas) avec `EXPO_PUBLIC_API_URL=https://heyama-api-tn3u.onrender.com`

Stack de prod : Render (API + Web, plan gratuit), MongoDB Atlas (cluster M0 gratuit), Cloudflare R2 (stockage image, remplace MinIO qui a besoin d'un disque persistant). Le plan gratuit Render met le service en veille après 15 min d'inactivité — le premier chargement après une pause peut prendre 30-60s le temps qu'il redémarre.

## Structure du repo

```
.
├── api/       # NestJS + MongoDB (Mongoose) + MinIO + Socket.io
├── web/       # Next.js + shadcn/ui
├── mobile/    # React Native + Expo
├── proxy/     # Reverse proxy local (bonus, pour l'accès distant via ngrok)
├── docs/      # Cahier des charges + doc technique
└── docker-compose.yml   # MongoDB + MinIO en local
```

Le repo suit un workflow GitFlow (`main` pour les releases taguées, `develop` pour l'intégration, une branche `feature/*` par morceau de travail).

## Setup en local

### 1. MongoDB + MinIO (Docker)

```bash
docker-compose up -d
```

Le service `minio-init` crée automatiquement le bucket `heyama-objects` et le rend public en lecture au premier démarrage. Console MinIO sur http://localhost:9001 (`minioadmin` / `minioadmin`).

### 2. API (NestJS)

```bash
cd api
cp .env.example .env
npm install
npm run start:dev
```

Tourne sur http://localhost:3000.

### 3. Web (Next.js)

```bash
cd web
npm install
npm run dev
```

Tourne sur http://localhost:3001 (le 3000 est déjà pris par l'API). Copier `.env.example` en `.env.local` si besoin.

### 4. Mobile (Expo)

```bash
cd mobile
npm install
npx expo start
```

Scanner le QR code avec l'app Expo Go (SDK 54).

⚠️ **Le téléphone ne peut pas résoudre `localhost`.** Pour qu'un device physique joigne l'API (et les images MinIO), il faut utiliser l'IP locale de la machine hôte, tant que le téléphone est sur le même Wi-Fi que le PC :

```bash
# api/.env
S3_PUBLIC_URL=http://192.168.x.x:9000

# mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

Si l'IP change (autre réseau), il faut mettre à jour ces deux fichiers et redémarrer l'API + Metro.

## Variables d'environnement

**`api/.env`** (local, MinIO)
```
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=heyama-objects
S3_PUBLIC_URL=http://localhost:9000/heyama-objects   # bucket inclus dans le chemin
S3_REGION=us-east-1
MONGO_URI=mongodb://localhost:27017/heyama
PORT=3000
```

**`api/.env`** (prod, Cloudflare R2 — voir [docs/DEPLOIEMENT.md](docs/DEPLOIEMENT.md) pour le detail)
```
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_ACCESS_KEY=<r2 access key id>
S3_SECRET_KEY=<r2 secret access key>
S3_BUCKET=heyama-objects
S3_PUBLIC_URL=https://pub-xxxx.r2.dev   # deja scope a la bucket, pas de nom de bucket dans le chemin
S3_REGION=auto
MONGO_URI=mongodb+srv://user:pass@cluster.xxxx.mongodb.net/heyama?retryWrites=true&w=majority
```

**`web/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**`mobile/.env`**
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Accès distant (bonus) : partager l'app avec un testeur

Si le testeur n'est pas sur le même réseau, on expose tout via un tunnel [ngrok](https://ngrok.com). Le plan gratuit n'accorde qu'un seul hostname public par compte, donc on passe par un petit reverse proxy local (`proxy/server.js`) qui redistribue une seule URL vers les trois services :

```bash
node proxy/server.js       # écoute sur :8000, route par chemin
ngrok http 8000            # un seul tunnel
```

- `/` → API (port 3000)
- `/app` → Web (port 3001)
- `/uploads/*` → MinIO (port 9000)

Une fois l'URL ngrok obtenue, la reporter partout (aucun `localhost` ne doit apparaître côté client) :

```bash
# api/.env
S3_PUBLIC_URL=https://xxxx.ngrok-free.dev/uploads

# web/.env.local
NEXT_PUBLIC_API_URL=https://xxxx.ngrok-free.dev
NEXT_PUBLIC_BASE_PATH=/app

# mobile/.env
EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.dev
```

Puis redémarrer API + Web (et Metro si le mobile doit aussi passer par ngrok). Le domaine ngrok gratuit reste stable d'une session à l'autre pour un même compte, donc pas besoin de tout reconfigurer à chaque redémarrage — juste relancer les services dans l'ordre : Docker → API → Web → proxy → ngrok.

**Deux limitations du plan gratuit ngrok à connaître :**
- Il affiche une page d'avertissement HTML aux navigateurs sur la première visite (bouton "Visit Site" à cliquer). Normal, pas un bug.
- Il bloque aussi les requêtes **GET** faites par un navigateur (mais pas les POST/DELETE, va savoir). Le code contourne déjà ça côté web (header `ngrok-skip-browser-warning` sur les appels API et le socket, et les images passent par un composant qui les récupère en JS plutôt qu'une balise `<img>` classique). Le mobile n'est pas concerné, un client réseau natif n'est pas détecté comme un navigateur.

## Build d'un APK release (bonus)

```bash
cd mobile
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

L'APK sort dans `android/app/build/outputs/apk/release/app-release.apk`, signé avec le keystore de debug par défaut d'Expo (largement suffisant pour un testeur, pas pour le Play Store). L'URL de l'API est figée dans le bundle au moment du build : si le testeur n'est pas sur le même réseau, penser à mettre `EXPO_PUBLIC_API_URL` sur l'URL ngrok *avant* de lancer `gradlew assembleRelease`, et à ne pas relancer ngrok entre-temps (l'URL changerait).

Deux ou trois choses à savoir si le build native plante :
- Le dossier `android/` est régénéré à chaque `prebuild` — s'il y a un souci de version Gradle/NDK, ça repart de zéro à chaque fois.
- `reactNativeArchitectures` dans `android/gradle.properties` peut être limité à `arm64-v8a` pour accélérer la compilation si on cible juste un téléphone moderne au lieu des 4 architectures par défaut.
- Un build release compile du C++ pour chaque architecture ciblée ; ça peut prendre plusieurs Go d'espace disque temporaire.

## Installer sur un device Android via adb

```bash
adb devices                              # vérifier que le téléphone est détecté
adb install -r app/build/outputs/apk/release/app-release.apk
```
