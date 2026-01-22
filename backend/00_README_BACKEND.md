# 🚀 HUNTZEN CARE - DOCUMENTATION BACKEND COMPLÈTE

## 📚 STRUCTURE DE LA DOCUMENTATION

Ce dossier contient **TOUTE la documentation nécessaire** pour développer le backend HuntZen Care de A à Z.

---

## 📄 FICHIERS DE DOCUMENTATION

### **01_ANALYSE_COMPLETE_BACKEND.md** (OBLIGATOIRE - Lire en premier)
**Contenu** :
- Stack technique complète (NestJS, PostgreSQL, Redis, Jitsi, Socket.IO)
- Architecture globale (diagrammes)
- Multi-tenant & isolation (RLS PostgreSQL)
- RBAC complet (5 rôles détaillés)
- Modèle de données (13+ tables expliquées)
- Architecture API (100+ endpoints listés)
- Visioconférence (Jitsi self-hosted)
- Appels audio (WebRTC signaling)
- Chat temps réel (Socket.IO)
- Chiffrement AES-256-GCM
- Résumé complet de toutes les fonctionnalités

**Utilisation** : Document de référence principal. À lire AVANT de commencer le dev.

---

### **02_SCHEMA_DATABASE_COMPLET.md** (CRITIQUE)
**Contenu** :
- Schéma Prisma complet (800+ lignes)
- 13 modèles de données :
  - User, RefreshToken, Role
  - Company, Employee, Practitioner
  - Availability, Consultation, ConsultationEvent
  - Message, ClinicalNote, JournalEntry
  - Article, News, Notification, AuditLog, File, EmailQueue
- Enums (Role, Specialty, ConsultationStatus, etc.)
- Migrations SQL supplémentaires :
  - Row Level Security (RLS)
  - Index de performance
  - Vues matérialisées (compteurs)
  - Triggers (audit, calcul durée)
- Seeds (données de test)
- Commandes Prisma

**Utilisation** : Copier-coller le schéma dans `prisma/schema.prisma` puis exécuter migrations.

---

### **03_USER_STORIES_CRITERES_ACCEPTATION.md** (PLANIFICATION)
**Contenu** :
- 53 User Stories organisées par Sprint (13 sprints)
- Critères d'acceptation détaillés pour chaque US
- Endpoints avec paramètres exacts
- Tests à implémenter
- Checklist globale MVP

**Organisation par Sprint** :
- Sprint 1 : Authentification (6 US)
- Sprint 2 : Entreprises & Employés (5 US)
- Sprint 3 : Praticiens & Disponibilités (3 US)
- Sprint 4 : Consultations (6 US)
- Sprint 5 : Chat temps réel (3 US)
- Sprint 6 : Notes & Journal (2 US)
- Sprint 7 : Compteurs & Exports (3 US)
- Sprint 8 : Blog & News (2 US)
- Sprint 9 : Notifications (2 US)
- Sprint 10 : Recherche avancée (1 US)
- Sprint 11 : Avis & Évaluations (1 US)
- Sprint 12 : Sécurité & RGPD (3 US)
- Sprint 13 : Monitoring & Admin (2 US)

**Utilisation** : Guide de développement sprint par sprint. À suivre dans l'ordre.

---

### **04_GUIDE_IMPLEMENTATION_CURSOR.md** (DÉVELOPPEMENT)
**Contenu** :
- Guide pas-à-pas pour donner à Cursor
- 13 phases de développement (25 jours estimés)
- Instructions détaillées pour chaque module
- Prompts Cursor optimisés (copier-coller)
- Code d'exemple pour services critiques
- Configuration Docker + docker-compose
- Scripts NPM
- Checklist finale avant déploiement
- Bonnes pratiques Cursor

**Utilisation** : À donner étape par étape à Cursor pour générer le code backend complet.

---

## 🎯 COMMENT UTILISER CETTE DOCUMENTATION

### **Étape 1 : Comprendre le projet (1-2h)**
1. Lire **01_ANALYSE_COMPLETE_BACKEND.md** en entier
2. Noter les points clés : multi-tenant, RBAC, chiffrement E2E
3. Comprendre l'architecture globale

### **Étape 2 : Setup initial (1 jour)**
1. Suivre Phase 0 du **04_GUIDE_IMPLEMENTATION_CURSOR.md**
2. Installer NestJS + dépendances
3. Copier schéma Prisma depuis **02_SCHEMA_DATABASE_COMPLET.md**
4. Exécuter migrations + seeds
5. Vérifier connexion DB

### **Étape 3 : Développement sprint par sprint (4-5 semaines)**
1. Pour chaque sprint, lire les User Stories dans **03_USER_STORIES_CRITERES_ACCEPTATION.md**
2. Suivre le guide d'implémentation correspondant dans **04_GUIDE_IMPLEMENTATION_CURSOR.md**
3. Donner les prompts à Cursor
4. Tester chaque endpoint au fur et à mesure
5. Commiter à chaque fonctionnalité terminée

### **Étape 4 : Tests & Debug (1 semaine)**
1. Utiliser la checklist finale du **04_GUIDE_IMPLEMENTATION_CURSOR.md**
2. Tester tous les endpoints (Postman/Insomnia)
3. Vérifier WebSocket (chat + audio)
4. Tester Jitsi intégration
5. Valider chiffrement E2E

### **Étape 5 : Déploiement (1-2 jours)**
1. Configurer Docker (Phase 13)
2. Setup Nginx reverse proxy
3. Configurer domaines (API + Jitsi)
4. SSL/HTTPS (Let's Encrypt)
5. Monitoring (Health check + logs)

---

## 📊 RÉSUMÉ TECHNIQUE

### **Stack Backend**
- **Framework** : NestJS 10.x + TypeScript 5.x
- **Base de données** : PostgreSQL 15+ (RLS activé)
- **ORM** : Prisma 5.x
- **Cache** : Redis 7.x
- **Queue** : BullMQ 4.x
- **WebSocket** : Socket.IO 4.x
- **Visioconférence** : Jitsi Meet (self-hosted)
- **Chiffrement** : AES-256-GCM (crypto Node.js)
- **Auth** : JWT (access + refresh tokens)
- **Email** : Nodemailer (SMTP)
- **Upload** : Multer (disk local ou MinIO)

### **Fonctionnalités Principales**
- ✅ Authentification multi-rôles (5 rôles)
- ✅ Multi-tenant strict (isolation PostgreSQL RLS)
- ✅ CRUD complet (Entreprises, Employés, Praticiens, Consultations)
- ✅ Réservation consultations + agenda
- ✅ Visioconférence (Jitsi) avec JWT
- ✅ Appels audio (WebRTC P2P)
- ✅ Chat temps réel (Socket.IO + chiffrement E2E)
- ✅ Notes cliniques chiffrées (praticien uniquement)
- ✅ Journal personnel chiffré (employé uniquement)
- ✅ Compteurs consultations (praticien + employé)
- ✅ Exports CSV (paie praticien + usage RH)
- ✅ Blog/News (publication articles)
- ✅ Notifications (in-app + email)
- ✅ Upload fichiers (avatars, docs)
- ✅ 2FA (TOTP)
- ✅ RGPD (export données + suppression compte)
- ✅ Audit logs complets
- ✅ Health check & monitoring

### **Architecture**
```
Frontend (Next.js)
       ↓ HTTPS
Backend (NestJS) → PostgreSQL (multi-tenant RLS)
       ↓           → Redis (cache + queue)
       ↓           → Jitsi (vidéo)
       ↓           → Socket.IO (chat + audio signaling)
       ↓           → SMTP (emails)
       ↓           → File storage (uploads)
```

### **Sécurité**
- 🔐 JWT avec refresh token rotation
- 🔐 Chiffrement AES-256-GCM (notes, journal, messages)
- 🔐 RLS PostgreSQL (isolation tenant)
- 🔐 RBAC strict (5 rôles, guards NestJS)
- 🔐 Rate limiting (login, API)
- 🔐 Helmet (headers sécurité)
- 🔐 CORS configuré
- 🔐 Validation input (class-validator)
- 🔐 2FA optionnel (TOTP)
- 🔐 Audit logs complets

### **Conformité**
- ✅ **RGPD** : Export données, suppression compte, consentements
- ✅ **Secret médical** : Chiffrement E2E, accès strictement contrôlés
- ✅ **Minimisation** : RH voit uniquement compteurs (pas contenu santé)
- ✅ **Traçabilité** : Audit logs sur toutes actions sensibles

---

## 📈 MÉTRIQUES DU PROJET

### **Taille du code (estimée)**
- **Backend** : ~15 000 lignes TypeScript
- **Prisma schema** : ~800 lignes
- **Tests** : ~5 000 lignes (à implémenter)

### **Nombre de fichiers (backend)**
- **Modules** : 15 modules
- **Controllers** : 20 controllers
- **Services** : 25 services
- **DTOs** : 50+ DTOs
- **Guards** : 5 guards
- **Decorators** : 5 decorators
- **Gateways** : 3 gateways (WebSocket)
- **Migrations** : 10+ migrations SQL

### **Endpoints API**
- **Total** : 100+ endpoints REST
- **WebSocket events** : 20+ events
- **Authentification** : 8 endpoints
- **Entreprises** : 6 endpoints
- **Employés** : 9 endpoints
- **Praticiens** : 10 endpoints
- **Consultations** : 12 endpoints
- **Chat** : 6 endpoints
- **Notes cliniques** : 4 endpoints
- **Journal** : 5 endpoints
- **Reports** : 6 endpoints
- **Blog** : 6 endpoints
- **News** : 5 endpoints
- **Notifications** : 4 endpoints
- **Files** : 3 endpoints
- **RGPD** : 3 endpoints
- **Health** : 2 endpoints
- **Audit** : 1 endpoint

### **Tables Base de Données**
- **Total** : 18 tables
- **Vues matérialisées** : 2 vues (compteurs)
- **Index** : 50+ index
- **Triggers** : 3 triggers (audit, durée)

---

## 🏆 POINTS FORTS DE L'ARCHITECTURE

### **1. Multi-tenant Strict**
- Isolation au niveau DB (RLS PostgreSQL)
- `companyId` sur toutes tables sensibles
- Middleware pour définir tenant dans contexte
- Aucune fuite de données entre entreprises

### **2. Secret Médical Absolu**
- Chiffrement E2E (notes, journal, messages)
- Clé unique par document
- **JAMAIS** accessible par RH/Admin
- Audit logs sans contenu sensible

### **3. Compteurs Fiables**
- Événements horodatés (ConsultationEvent)
- Calcul automatique durée (trigger DB)
- Vues matérialisées (performance)
- Exports CSV conformes RGPD

### **4. Performance**
- Vues matérialisées (stats pré-calculées)
- Redis cache (sessions, données fréquentes)
- Index optimisés (requêtes rapides)
- Pagination systématique
- Compression Gzip

### **5. Sécurité**
- JWT rotation (refresh tokens)
- Rate limiting (brute force)
- Validation input stricte
- 2FA disponible
- Audit logs complets

### **6. Temps Réel**
- Chat instantané (Socket.IO)
- Notifications live
- Indicateurs présence
- Audio call (WebRTC)
- Vidéo (Jitsi externe)

### **7. Scalabilité**
- Architecture stateless (JWT)
- Redis pour sessions distribuées
- Queue BullMQ (tâches async)
- Docker + orchestration K8s ready
- Horizontal scaling possible

---

## 🛠️ OUTILS DE DÉVELOPPEMENT RECOMMANDÉS

### **IDE**
- **VS Code** + extensions :
  - Prisma
  - ESLint
  - Prettier
  - REST Client
  - Docker

### **API Testing**
- **Insomnia** ou **Postman**
- Collection d'endpoints à créer

### **Database**
- **Prisma Studio** : `npx prisma studio`
- **pgAdmin** ou **DBeaver** pour PostgreSQL

### **WebSocket Testing**
- **Socket.IO Client** (navigateur)
- **Postman** (WebSocket support)

### **Monitoring (Production)**
- **Sentry** : Tracking erreurs
- **Prometheus** + **Grafana** : Métriques
- **Loki** : Logs centralisés

---

## ⚠️ POINTS D'ATTENTION CRITIQUES

### **1. Clés de chiffrement**
```bash
# Générer ENCRYPTION_KEY (32 bytes = 64 hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
⚠️ **JAMAIS** commiter cette clé  
⚠️ Stocker en sécurité (vault, secrets manager)

### **2. JWT Secrets**
- JWT_SECRET ≠ JWT_REFRESH_SECRET (2 clés différentes)
- Minimum 32 caractères aléatoires
- Rotation régulière en production

### **3. RLS PostgreSQL**
- Activer sur TOUTES tables sensibles
- Tester isolation (user A ne voit pas data user B)
- Middleware tenant OBLIGATOIRE

### **4. Chiffrement E2E**
- Tester déchiffrement après insertion
- Vérifier IV unique par document
- AuthTag validé (GCM)

### **5. Compteurs**
- Événements STARTED/ENDED obligatoires
- Trigger calcul durée testé
- Vue matérialisée rafraîchie (CRON)
- Export CSV validé par RH

### **6. Jitsi**
- JWT Jitsi configuré correctement
- Domain, App ID, Secret cohérents
- Expiration token = durée consultation
- Praticien = modérateur

### **7. WebSocket**
- Authentification JWT sur connection
- Rooms isolées par consultation
- Gestion déconnexions
- Cleanup à la fin

### **8. RGPD**
- Consentements enregistrés
- Export données complet
- Suppression = anonymisation (pas delete hard)
- Notes cliniques conservées 20 ans (légal)

---

## 📞 SUPPORT & QUESTIONS

### **Documentation manquante ?**
- Consulter commentaires dans le code généré
- Lire documentation NestJS officielle
- Prisma docs pour requêtes complexes

### **Erreurs courantes**
1. **Migration Prisma échoue** : Vérifier DATABASE_URL, reset DB si dev
2. **JWT invalide** : Vérifier secret, expiration, format Bearer
3. **WebSocket déconnecté** : CORS, authentification, port 3001
4. **Chiffrement erreur** : ENCRYPTION_KEY valide (32 bytes hex)
5. **RLS bloque requête** : Middleware tenant actif, companyId correct

### **Performance lente**
1. Vérifier index DB (EXPLAIN ANALYZE)
2. Activer cache Redis
3. Optimiser requêtes (N+1, select specific fields)
4. Pagination activée
5. Vues matérialisées rafraîchies

---

## ✅ CHECKLIST AVANT PRODUCTION

### **Sécurité**
- [ ] Toutes clés secrets en variables env (jamais en dur)
- [ ] CORS configuré (origin spécifique, pas '*')
- [ ] Helmet activé
- [ ] Rate limiting actif
- [ ] RLS PostgreSQL testé
- [ ] Chiffrement E2E validé
- [ ] Audit logs opérationnels
- [ ] 2FA disponible

### **Performance**
- [ ] Index DB créés
- [ ] Vues matérialisées fonctionnelles
- [ ] Redis cache connecté
- [ ] Compression activée
- [ ] Pagination partout

### **Monitoring**
- [ ] Health check endpoint opérationnel
- [ ] Logs structurés (Winston)
- [ ] Sentry configuré (erreurs)
- [ ] Prometheus/Grafana (métriques)
- [ ] Backups automatisés

### **Conformité**
- [ ] RGPD : export + suppression testés
- [ ] Secret médical : accès RH vérifiés (interdits)
- [ ] Compteurs : validés par RH test
- [ ] Consentements enregistrés
- [ ] Notice confidentialité visible

### **Documentation**
- [ ] README.md à jour
- [ ] Swagger/OpenAPI généré
- [ ] .env.example complet
- [ ] Guide déploiement rédigé

---

## 🚀 DÉMARRAGE RAPIDE (RÉSUMÉ 5 MIN)

```bash
# 1. Clone + install
git clone https://github.com/huntzen/backend.git
cd backend
npm install

# 2. Copier Prisma schema
# Copier contenu de 02_SCHEMA_DATABASE_COMPLET.md dans prisma/schema.prisma

# 3. Setup DB
# Créer .env avec DATABASE_URL
npx prisma migrate dev --name init
npx prisma db seed

# 4. Démarrer
npm run start:dev

# 5. Tester
curl http://localhost:3000/health
# Ou ouvrir Prisma Studio :
npx prisma studio
```

**API disponible sur** : `http://localhost:3000`  
**WebSocket (chat)** : `ws://localhost:3001/chat`  
**WebSocket (audio)** : `ws://localhost:3001/audio-call`

---

## 🎓 RESSOURCES COMPLÉMENTAIRES

### **Documentation Officielle**
- **NestJS** : https://docs.nestjs.com/
- **Prisma** : https://www.prisma.io/docs/
- **Socket.IO** : https://socket.io/docs/v4/
- **Jitsi** : https://jitsi.github.io/handbook/docs/dev-guide/
- **PostgreSQL RLS** : https://www.postgresql.org/docs/15/ddl-rowsecurity.html

### **Tutoriels**
- NestJS + Prisma : https://docs.nestjs.com/recipes/prisma
- JWT Auth : https://docs.nestjs.com/security/authentication
- WebSocket : https://docs.nestjs.com/websockets/gateways
- File Upload : https://docs.nestjs.com/techniques/file-upload

### **Exemples GitHub**
- NestJS Boilerplate : https://github.com/brocoders/nestjs-boilerplate
- Prisma Examples : https://github.com/prisma/prisma-examples

---

**🎉 DOCUMENTATION BACKEND COMPLÈTE - PRÊTE POUR LE DÉVELOPPEMENT !**

**Temps estimé de développement** : 25 jours (5 semaines)  
**Complexité** : Moyenne-Haute  
**Stack** : Moderne & éprouvée  
**Résultat** : Backend production-ready 🚀
