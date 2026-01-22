# HuntZen Care Backend API

Backend NestJS pour l'application HuntZen Care.

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données

Créez un fichier `.env` à partir de `.env.example` :

```bash
cp .env.example .env
```

Modifiez `DATABASE_URL` avec vos identifiants PostgreSQL :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/huntzen_care?schema=public"
```

### 3. Configuration Supabase (optionnel)

Si vous utilisez Supabase PostgreSQL :

1. Allez dans votre projet Supabase Dashboard
2. Settings → Database
3. Copiez la "Connection string" (URI)
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe
5. Collez dans `.env` comme `DATABASE_URL`

Exemple :
```
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

### 4. Initialisation de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les migrations
npm run prisma:migrate

# (Optionnel) Ouvrir Prisma Studio pour voir les données
npm run prisma:studio
```

### 5. Démarrer le serveur

```bash
# Mode développement
npm run start:dev

# Mode production
npm run start:prod
```

L'API sera disponible sur `http://localhost:3000`

## 📁 Structure du projet

```
backend-api/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentification
│   │   ├── consultations/ # Gestion des consultations
│   │   ├── practitioners/ # Gestion des praticiens
│   │   ├── employees/     # Gestion des employés
│   │   └── prisma/        # Service Prisma
│   └── main.ts            # Point d'entrée
├── prisma/
│   └── schema.prisma      # Schéma de base de données
└── package.json
```

## 🔌 Endpoints API

### Authentification
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `POST /auth/refresh` - Rafraîchir le token

### Consultations
- `GET /consultations` - Liste des consultations
- `POST /consultations` - Créer une consultation
- `GET /consultations/:id` - Détails d'une consultation
- `PUT /consultations/:id` - Mettre à jour une consultation

### Praticiens
- `GET /practitioners` - Liste des praticiens
- `GET /practitioners/:id` - Détails d'un praticien
- `GET /practitioners/:id/availability` - Disponibilités

### Employés
- `GET /employees/me` - Profil de l'employé connecté
- `PUT /employees/me` - Mettre à jour le profil

## 🔐 Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DATABASE_URL` | URL de connexion PostgreSQL | - |
| `JWT_SECRET` | Clé secrète pour JWT | - |
| `JWT_REFRESH_SECRET` | Clé secrète pour refresh token | - |
| `FRONTEND_URL` | URL du frontend (CORS) | `http://localhost:5173` |
| `PORT` | Port du serveur | `3000` |

## 📝 Scripts disponibles

- `npm run start:dev` - Démarrer en mode développement (watch)
- `npm run start:prod` - Démarrer en mode production
- `npm run prisma:generate` - Générer le client Prisma
- `npm run prisma:migrate` - Créer/appliquer les migrations
- `npm run prisma:studio` - Ouvrir Prisma Studio

## 🗄️ Base de données

Le schéma de base de données est défini dans `prisma/schema.prisma`.

Pour créer une nouvelle migration :
```bash
npm run prisma:migrate
```

Pour voir les données :
```bash
npm run prisma:studio
```

## 🔗 Connexion avec le frontend

Le frontend doit être configuré pour appeler l'API sur `http://localhost:3000`.

Exemple de configuration dans le frontend :
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```
