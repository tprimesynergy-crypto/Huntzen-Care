# 🚀 Guide de Configuration du Backend

Ce guide vous explique comment configurer et démarrer le backend avec une vraie base de données.

## 📋 Prérequis

- Node.js 18+ installé
- PostgreSQL installé OU compte Supabase
- npm ou yarn

## 🔧 Étape 1 : Installation des dépendances

```bash
cd backend-api
npm install
```

## 🗄️ Étape 2 : Configuration de la base de données

### Option A : PostgreSQL local

1. Créez une base de données PostgreSQL :
```sql
CREATE DATABASE huntzen_care;
```

2. Créez un fichier `.env` dans `backend-api/` :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/huntzen_care?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

### Option B : Supabase (Recommandé)

1. Créez un projet sur [Supabase](https://supabase.com)

2. Allez dans **Settings → Database**

3. Copiez la **Connection string** (URI) :
   - Format : `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
   - Remplacez `[YOUR-PASSWORD]` par votre mot de passe

4. Créez un fichier `.env` dans `backend-api/` :
```env
DATABASE_URL="postgresql://postgres.xxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
FRONTEND_URL="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

## 🗃️ Étape 3 : Initialisation de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les migrations et appliquer le schéma
npm run prisma:migrate

# (Optionnel) Ouvrir Prisma Studio pour voir les données
npm run prisma:studio
```

## 🚀 Étape 4 : Démarrer le serveur

```bash
# Mode développement (avec hot-reload)
npm run start:dev
```

Le serveur sera disponible sur `http://localhost:3000`

## ✅ Étape 5 : Vérifier que ça fonctionne

Ouvrez votre navigateur et allez sur :
- `http://localhost:3000` - Devrait afficher une erreur 404 (normal, pas de route racine)
- `http://localhost:3000/practitioners` - Devrait retourner `[]` (liste vide)

## 🔗 Étape 6 : Configurer le frontend

1. Créez un fichier `.env` à la racine du projet (à côté de `package.json`) :
```env
VITE_API_URL=http://localhost:3000
```

2. Redémarrez le serveur de développement du frontend :
```bash
npm run dev
```

## 📝 Endpoints disponibles

### Authentification
- `POST /auth/register` - Créer un compte
- `POST /auth/login` - Se connecter
- `GET /auth/me` - Profil de l'utilisateur connecté (nécessite token)

### Consultations
- `GET /consultations` - Liste des consultations (nécessite token)
- `POST /consultations` - Créer une consultation (nécessite token)
- `GET /consultations/:id` - Détails d'une consultation (nécessite token)

### Praticiens
- `GET /practitioners` - Liste des praticiens (public)
- `GET /practitioners/:id` - Détails d'un praticien (public)
- `GET /practitioners/:id/availability` - Disponibilités (public)

### Employés
- `GET /employees/me` - Profil de l'employé connecté (nécessite token)

## 🧪 Tester l'API

### Avec curl

```bash
# Créer un compte
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"EMPLOYEE"}'

# Se connecter
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Récupérer les praticiens (public)
curl http://localhost:3000/practitioners
```

### Avec Postman ou Insomnia

1. Importez les endpoints ci-dessus
2. Pour les routes protégées, ajoutez le header :
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

## 🐛 Dépannage

### Erreur de connexion à la base de données

- Vérifiez que PostgreSQL est démarré (si local)
- Vérifiez que `DATABASE_URL` est correct dans `.env`
- Vérifiez que le mot de passe est correct (Supabase)

### Erreur "Cannot find module"

```bash
cd backend-api
npm install
```

### Erreur Prisma

```bash
cd backend-api
npm run prisma:generate
npm run prisma:migrate
```

### CORS errors

Vérifiez que `FRONTEND_URL` dans `.env` correspond à l'URL de votre frontend.

## 📚 Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
