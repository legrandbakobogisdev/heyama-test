# CDC — Examen DEV Heyama : Plateforme de gestion d'Objects

**Version** : 1.0
**Auteur** : Albert Le Grand
**Contexte** : Test technique d'entrée — Heyama Dev Team
**Contrainte de délai** : 24h MAX

---

## 1. Contexte et objectif

L'examen consiste à livrer un mini-système full-stack démontrant la capacité à faire communiquer une API centrale avec deux clients (mobile + web), incluant upload de fichiers vers un stockage objet S3-compatible et synchronisation temps réel entre clients.

Le sujet précise explicitement que **le design UI n'est pas évalué** ("just make sure it's functional and coherent") et que **les solutions partielles sont acceptées**. La priorité va donc à :
1. Une API robuste et complète (socle non négociable)
2. Une synchronisation realtime fonctionnelle
3. Une couverture mobile ET web, même minimaliste

## 2. Périmètre fonctionnel

### 2.1 Entité métier : `Object`

| Champ | Type | Règle |
|---|---|---|
| `_id` | ObjectId (Mongo) | généré automatiquement |
| `title` | string | requis, non vide |
| `description` | string | requis |
| `imageUrl` | string | URL publique retournée après upload S3 |
| `createdAt` | Date | généré automatiquement à la création |

### 2.2 Fonctionnalités requises

- Créer un Object (titre + description + image) depuis mobile OU web
- Lister les Objects (mobile + web)
- Voir le détail d'un Object (mobile + web)
- Supprimer un Object (le sujet ne précise pas d'UI de suppression obligatoire côté client, mais l'endpoint API est requis — cf. bonus §7)
- Toute création doit se propager en temps réel sur tous les écrans connectés (mobile ↔ web), via Socket.io

## 3. Architecture technique

```
┌─────────────────┐        ┌──────────────────┐
│  Mobile (Expo)   │◄──────►│                  │
└─────────────────┘  HTTP  │                  │
                     +WS    │   API NestJS     │──── MongoDB (Docker local)
┌─────────────────┐        │                  │
│  Web (Next.js)   │◄──────►│                  │──── Cloudflare R2 (S3-compatible)
└─────────────────┘  HTTP  └──────────────────┘
                     +WS
```

### 3.1 Choix techniques et justification

| Composant | Choix | Justification |
|---|---|---|
| API | NestJS | Imposé par le sujet |
| DB | MongoDB via Mongoose, **Docker local** | Imposé ; local = zéro dépendance réseau externe, pas de signup |
| Stockage image | **Cloudflare R2** (S3-compatible, hors AWS) | Imposé "S3 sauf Amazon" ; gratuit (10 Go), URLs publiques accessibles depuis mobile ET web (contrairement à MinIO local, injoignable depuis un téléphone physique) ; compatible `@aws-sdk/client-s3` en changeant juste l'endpoint |
| Realtime | Socket.io via `@nestjs/websockets` | Imposé explicitement dans le sujet |
| Web | Next.js + shadcn/ui | Imposé |
| Mobile | React Native + Expo | Imposé |

### 3.2 Pourquoi pas MinIO en local (décision actée)

MinIO local aurait généré des URLs type `http://localhost:9000/...`, inaccessibles depuis un smartphone physique (réseau différent de la machine hôte). Cloudflare R2 règle ce problème avec des URLs publiques universelles, sans coût.

## 4. Spécification API (NestJS)

### 4.1 Modèle Mongoose

```ts
@Schema()
export class ObjectEntity {
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) imageUrl: string;
  @Prop({ default: Date.now }) createdAt: Date;
}
```

### 4.2 Endpoints

| Méthode | Route | Body | Réponse | Comportement |
|---|---|---|---|---|
| POST | `/objects` | multipart/form-data : `title`, `description`, `image` | `201` + objet créé | Upload image → R2, récupère URL publique, sauvegarde Mongo, **émet event Socket.io `object:created`** |
| GET | `/objects` | — | `200` + liste triée par `createdAt` desc | — |
| GET | `/objects/:id` | — | `200` + objet, ou `404` | — |
| DELETE | `/objects/:id` | — | `204`, ou `404` | Supprime le document Mongo **et** l'objet correspondant sur R2 ; **émet event `object:deleted`** |

### 4.3 Validation

- DTO avec `class-validator` : `title` et `description` non vides (`@IsNotEmpty()`)
- Rejet si aucun fichier image fourni sur POST (`400`)
- Types de fichiers acceptés : `image/jpeg`, `image/png`, `image/webp` (filtre Multer)
- Taille max : 5 Mo (arbitraire, à documenter dans le README)

### 4.4 Gateway Socket.io

```ts
@WebSocketGateway({ cors: { origin: '*' } })
export class ObjectsGateway {
  @WebSocketServer() server: Server;

  emitCreated(obj) { this.server.emit('object:created', obj); }
  emitDeleted(id)  { this.server.emit('object:deleted', id); }
}
```

- Un seul namespace/room global (pas de scoping par utilisateur, hors périmètre)
- Le service `ObjectsService` appelle le gateway après chaque mutation réussie en base

### 4.5 Configuration R2

Variables d'environnement (`.env`) :
```
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=heyama-objects
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
MONGO_URI=mongodb://localhost:27017/heyama
PORT=3000
```

Client S3 :
```ts
new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
})
```

## 5. Spécification Web (Next.js + shadcn/ui)

### 5.1 Pages

| Route | Contenu |
|---|---|
| `/` | Liste des Objects (grille ou liste, image + titre), bouton "Ajouter" |
| `/objects/new` | Formulaire : input `title`, textarea `description`, input file image, bouton submit → POST `/objects` |
| `/objects/[id]` | Détail : image, titre, description, date de création |

### 5.2 Realtime côté web

- Connexion `socket.io-client` au montage de la page liste
- Sur `object:created` → prepend à la liste en state local (pas de refetch complet)
- Sur `object:deleted` → retrait de la liste

### 5.3 Composants shadcn/ui suggérés

`Card`, `Input`, `Textarea`, `Button`, `Skeleton` (loading state liste)

## 6. Spécification Mobile (React Native + Expo)

### 6.1 Écrans (navigation simple, ex. Expo Router ou React Navigation stack)

| Écran | Contenu |
|---|---|
| `ObjectList` | Écran d'accueil, `FlatList` des Objects, bouton flottant "+" |
| `ObjectCreate` | Formulaire identique au web, `expo-image-picker` pour choisir une image galerie |
| `ObjectDetail` | Détail d'un Object |

### 6.2 Realtime côté mobile

- Même client `socket.io-client`, connexion à l'URL de l'API (⚠️ utiliser l'IP locale de la machine hôte, pas `localhost`, pour que l'app sur téléphone physique/émulateur atteigne l'API — ex. `http://192.168.x.x:3000`)
- Mêmes events `object:created` / `object:deleted`

### 6.3 Upload image

- `expo-image-picker` → récupère l'URI locale
- Construction d'un `FormData` avec `uri`, `type`, `name` → POST multipart vers `/objects`

## 7. Hors périmètre strict / Bonus si le temps le permet

- Édition d'un Object (`PUT /objects/:id`)
- UI de suppression (bouton delete sur la liste)
- Pagination / recherche
- Authentification (non demandée, hors scope)
- Tests automatisés (non demandés explicitement, mais un test e2e basique sur `POST /objects` serait un plus)

## 8. Livrables attendus

- Repo GitHub avec commits réguliers (le sujet demande explicitement de pousser au fur et à mesure, pas un seul commit final)
- `README.md` avec :
  - Instructions de setup (`docker-compose up` pour Mongo, `.env` à renseigner pour R2)
  - Commandes de lancement API / web / mobile
  - IP locale à configurer côté mobile pour joindre l'API
- `docker-compose.yml` (MongoDB uniquement, R2 étant externe)

## 9. Planning (24h)

| Bloc | Durée estimée |
|---|---|
| Setup Docker Mongo + scaffold NestJS + compte R2 | 0h45 |
| CRUD API + validation | 2h30 |
| Upload/suppression R2 | 1h30 |
| Gateway Socket.io | 1h |
| Web Next.js (liste, création, détail, socket) | 5h |
| Mobile Expo (liste, création, détail, socket) | 6h |
| README, docker-compose, nettoyage git | 1h30 |
| Marge / debug / pause | ~5h |

## 10. Risques identifiés

| Risque | Mitigation |
|---|---|
| Mobile ne joint pas l'API (`localhost` invalide sur device physique) | Utiliser l'IP locale du PC hôte, documentée dans le README |
| Quota/latence R2 en fin de délai | Bucket créé et testé en tout début de session (bloc setup) |
| Temps insuffisant pour tout finir | Couper mobile en dernier recours ; API + une UI complète priment sur la couverture totale |
| CORS entre Next.js/Expo et NestJS | Activer CORS large (`origin: '*'`) sur l'API dès le scaffold |
