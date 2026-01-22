# 📋 CAHIER DES CHARGES - HUNTZEN CARE V1.0

## ⚠️ PRINCIPES NON NÉGOCIABLES

### **1. Multi-tenant**
- La plateforme doit supporter **10+ entreprises** (objectif)
- **5 à 100 employés** par entreprise
- **50+ praticiens** disponibles (multi-entreprises)
- Isolation stricte des données par `company_id`
- Row Level Security (RLS) PostgreSQL activé

### **2. Secret médical absolu**
- ❌ **RH ne voit JAMAIS** :
  - Notes cliniques
  - Messages chat
  - Contenu consultations
  - Journal employé
  - Identité du praticien consulté (optionnel mais recommandé)
- ✅ **RH voit UNIQUEMENT** :
  - Nombre de consultations par employé
  - Durée totale de consultations par employé
  - KPIs anonymisés au niveau entreprise

### **3. Paiement hors plateforme**
- ❌ **AUCUN tarif/prix dans le produit**
- ❌ **AUCUN paiement in-app**
- ✅ **La plateforme fournit des compteurs d'activité** pour payer les praticiens hors plateforme :
  - Nombre de consultations
  - Durée totale de consultation
  - Temps par période (jour/semaine/mois)
  - Export CSV pour comptabilité

### **4. Reporting & Compteurs**
Les **Admin, RH, Super Admin** doivent connaître l'usage (nombre + durée) :
- ✅ **Par praticien** (pour paiement hors plateforme)
- ✅ **Par employé** (usage du service, anonymisé)
- ✅ **Par entreprise** (usage global)

---

## 🎯 1. VISION PRODUIT

### **HuntZen Care : MHaaS (Mental Health as a Service)**

Plateforme SaaS B2B de santé mentale en entreprise avec 5 rôles distincts :

#### **Employé (R5)**
- Prend RDV avec praticiens
- Consultation vidéo (Jitsi)
- Chat sécurisé
- Journal personnel (chiffré)
- Ressources bien-être

#### **Praticien (R4)**
- Gère son agenda
- Consultations vidéo/chat
- Notes cliniques (chiffrées)
- Compteur activité (pour paiement)

#### **Admin RH Entreprise (R3)**
- Active employés
- Consulte KPIs anonymisés
- Voit usage (nombre + durée) sans contenu médical
- Publie news internes

#### **Admin HuntZen (R2)**
- Gouvernance plateforme
- Validation entreprises/praticiens
- Gestion contenus globaux
- Support N2

#### **Super Super Admin PSG (R1)**
- Infrastructure
- Sécurité
- Monitoring
- Backups
- Logs techniques

---

## 👥 2. RÔLES (RBAC) + PERMISSIONS

### **R1 - Super Super Admin (PSG)**

**Accès** :
- ✅ Infrastructure (CPU, RAM, Disk)
- ✅ Sécurité (logs auth, rate limit, anomalies)
- ✅ Supervision (uptime, monitoring)
- ✅ Backups & restauration
- ✅ Gestion clés chiffrement (KMS interne)
- ✅ Audit trail global

**Interdictions** :
- ❌ Contenu médical (notes, messages, journaux)
- ❌ Identité des patients dans consultations

---

### **R2 - Admin HuntZen**

**Accès** :
- ✅ Validation entreprises
- ✅ Validation praticiens (documents, diplômes)
- ✅ Gestion catégories contenus
- ✅ FAQ, pages globales
- ✅ Support N2
- ✅ Extraction KPI globale (toutes entreprises)
- ✅ Publication blog global

**Interdictions** :
- ❌ Contenu médical (notes, messages, journaux)

---

### **R3 - Admin Entreprise (RH)**

**Accès** :
- ✅ Création/activation employés
- ✅ Import CSV employés
- ✅ Fiche entreprise (logo, cover, contacts)
- ✅ Usage par employé (nombre + durée consultations)
- ✅ KPIs anonymisés au niveau entreprise
- ✅ Publication news internes (si activé)

**Interdictions** :
- ❌ Notes cliniques
- ❌ Messages chat
- ❌ Identité du praticien (optionnel mais recommandé)
- ❌ Contenu consultation
- ❌ Journal employé

**Ce que RH voit** :
```json
{
  "employeeId": "uuid",
  "employeeName": "Marc Dupont",
  "department": "Développement",
  "period": "2025-01",
  "consultationCount": 4,
  "totalDurationSeconds": 12000, // 200 minutes
  "lastConsultationDate": "2025-01-15" // optionnel
}
```

---

### **R4 - Praticien**

**Accès** :
- ✅ Profil public (bio, spécialités, langues)
- ✅ Agenda + disponibilités (récurrent + exceptions)
- ✅ Consultations (liste, détails)
- ✅ Salle Jitsi + chat
- ✅ Notes cliniques (chiffrées, uniquement les siennes)
- ✅ Compteur perso (nombre + durée + export CSV pour paiement)

**Interdictions** :
- ❌ Données autres praticiens
- ❌ Données RH de l'employé
- ❌ Journal employé

**Compteur praticien** :
```json
{
  "practitionerId": "uuid",
  "period": "2025-01",
  "consultationCount": 87,
  "totalDurationSeconds": 261000, // 4350 minutes = 72.5h
  "averageDurationMinutes": 50,
  "byCompany": [
    {
      "companyName": "TechCorp",
      "consultationCount": 45,
      "totalDurationSeconds": 135000
    }
  ]
}
```

---

### **R5 - Employé**

**Accès** :
- ✅ Recherche praticiens (filtres : spécialité, langue, disponibilité)
- ✅ Réservation RDV
- ✅ Salle consultation (Jitsi + chat)
- ✅ Journal personnel (chiffré)
- ✅ Historique RDV
- ✅ Ressources / Blog
- ✅ News entreprise

**Interdictions** :
- ❌ Données autres employés
- ❌ Données RH
- ❌ Notes cliniques du praticien

---

## 🛠️ 3. PÉRIMÈTRE FONCTIONNEL (MODULES)

### **Module A - Auth / Sécurité / Multi-tenant**

**Fonctionnalités** :
- Login + reset password
- MFA (optionnel V1, avec TOTP)
- Sessions JWT en cookie `httpOnly` (sécurité XSS)
- RBAC + contrôle d'accès strict
- Isolation multi-entreprise via `company_id`
- Row Level Security (RLS) PostgreSQL

**Détails techniques** :
- JWT access token (15 min)
- JWT refresh token (7 jours, rotation)
- Middleware tenant : `req.tenantId = user.companyId`
- RLS policies sur tables sensibles

---

### **Module B - Gestion Entreprises / Employés (RH)**

**Fonctionnalités** :
- Fiche entreprise :
  - Logo (carré)
  - Photo cover (paysage)
  - Contacts (email, téléphone)
  - Adresse
  - Domaines emails autorisés (ex: `@techcorp.com`)
- Import employés :
  - CSV (email, firstName, lastName, department, position)
  - Invitations par email
  - Statut : `pending` / `active` / `suspended`
- Activation compte employé :
  - Clic sur lien invitation
  - Définir mot de passe
  - Accepter consentements RGPD

**Détails techniques** :
- Table `companies` : logo_url, cover_url, domain_email, contact_email, etc.
- Table `company_members` (si séparé) ou `users.company_id` (simple)
- Import CSV : validation domaine email, création User + Employee
- Email template avec token (expires 7 jours)

---

### **Module C - Practitioners**

**Fonctionnalités** :
- Onboarding praticien :
  - Upload documents (diplômes, assurance pro, N° ADELI/RPPS)
  - Vérification par Admin HuntZen
  - Statut : `pending` / `verified` / `rejected`
- Profil praticien :
  - Bio, spécialités, langues, modes consultation (vidéo/audio/présentiel)
  - Photo, vidéo de présentation
  - Expérience, diplômes
- Agenda :
  - Créneaux récurrents (ex: Lundi 9h-17h, slots 50 min)
  - Exceptions (congés, jours fériés)
  - Buffer entre consultations (ex: 10 min)

**Détails techniques** :
- Table `practitioner_profiles` (user_id PK, specialties[], bio, languages[], is_verified)
- Table `practitioner_documents` (type, file_url, status)
- Table `availability_slots` (recurring + start_date/end_date)
- Table `availability_exceptions` (date, reason)

---

### **Module D - RDV (Booking)**

**Fonctionnalités** :
- Recherche praticien :
  - Filtres : spécialité, langue, disponibilité sous X jours
  - Tri : note, expérience, prochaine dispo
- Création RDV :
  - Choix praticien + créneau
  - Format : vidéo / audio / présentiel
  - Confirmation praticien (optionnel)
- Annulation / Replanification :
  - Politique : min 24h avant (configurable)
  - Notification employé + praticien
- Statuts consultation :
  - `scheduled` : Réservée
  - `confirmed` : Confirmée par praticien
  - `in_progress` : En cours
  - `completed` : Terminée
  - `cancelled` : Annulée
  - `no_show` : Absence non excusée

**Détails techniques** :
- Table `consultations` :
  ```sql
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  practitioner_id UUID NOT NULL,
  type VARCHAR(20), -- video, audio, in_person
  status VARCHAR(20),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT, -- calculé automatiquement
  jitsi_room VARCHAR(255),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
  ```
- Trigger DB : calcul `duration_seconds = ended_at - started_at` au `completed`
- Event-driven : `consultation.completed` → mise à jour compteurs

---

### **Module E - Salle de Consultation (Visio Jitsi)**

**Fonctionnalités** :
- Jitsi self-host via `docker-jitsi-meet`
- Room tokenisée (JWT Jitsi)
- UI simple : bouton "Rejoindre" / "Quitter"
- Support intégré (lien FAQ, assistance)

**Détails techniques** :
- Docker-jitsi-meet : docker-compose + reverse proxy Nginx + SSL
- JWT Jitsi :
  ```javascript
  {
    context: {
      user: { id, name, moderator: isPractitioner }
    },
    aud: 'jitsi',
    iss: process.env.JITSI_APP_ID,
    sub: process.env.JITSI_DOMAIN,
    room: 'huntzen-{consultationId}-{timestamp}',
    exp: scheduledAt + duration + 15min
  }
  ```
- API endpoint : `POST /jitsi/token` → retourne JWT + roomName
- Frontend : Jitsi External API (`external_api.js`)

---

### **Module F - Chat Sécurisé (Temps Réel)**

**Fonctionnalités** :
- WebSocket (Socket.IO via NestJS Gateway)
- Messages texte + pièces jointes (images, PDF)
- Chiffrement applicatif (AES-256-GCM)
- Historique persistant
- Indicateur "en train d'écrire"
- Politique rétention : configurable (ex: suppression après X jours)

**Détails techniques** :
- Gateway Socket.IO :
  ```typescript
  @WebSocketGateway(3001, { namespace: '/chat' })
  ```
- Événements :
  - `chat:join` (consultationId)
  - `chat:message` (content, attachmentUrl)
  - `chat:typing` (isTyping)
  - `chat:read` (messageId)
- Table `chat_messages` :
  ```sql
  id UUID,
  thread_id UUID, -- lié à consultation_id
  sender_id UUID,
  receiver_id UUID,
  content_encrypted TEXT,
  iv VARCHAR(32),
  auth_tag VARCHAR(32),
  created_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ
  ```
- Chiffrement :
  ```javascript
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = cipher.update(content, 'utf8', 'hex') + cipher.final('hex');
  const authTag = cipher.getAuthTag();
  ```

---

### **Module G - Notes Cliniques & Journal Employé**

#### **Notes Cliniques (Praticien)**

**Fonctionnalités** :
- Notes chiffrées (accessible uniquement par le praticien auteur)
- Éditeur riche (Markdown ou WYSIWYG)
- Lien à une consultation
- Indexation minimale (pas de recherche full-text sur contenu chiffré)

**Détails techniques** :
- Table `clinical_notes` :
  ```sql
  id UUID,
  consultation_id UUID UNIQUE, -- 1 note par consultation max
  practitioner_id UUID,
  patient_id UUID,
  content_encrypted TEXT,
  iv VARCHAR(32),
  auth_tag VARCHAR(32),
  created_at TIMESTAMPTZ
  ```
- RLS policy : `practitioner_id = current_user_id`

#### **Journal Employé**

**Fonctionnalités** :
- Journal personnel chiffré
- Mood tracking (1-5)
- Tags personnalisables
- Accessible uniquement par l'employé

**Détails techniques** :
- Table `employee_journals` :
  ```sql
  id UUID,
  employee_id UUID,
  content_encrypted TEXT,
  iv VARCHAR(32),
  auth_tag VARCHAR(32),
  mood_rating INT CHECK (mood_rating BETWEEN 1 AND 5),
  tags TEXT[],
  created_at TIMESTAMPTZ
  ```
- RLS policy : `employee_id = current_user_id`

---

### **Module H - Blog / News / Contenus**

#### **Blog Global**

**Fonctionnalités** :
- Admin HuntZen + Super Super Admin publient
- SEO (meta title, description, keywords)
- Slugs uniques
- Tags + catégories
- Estimation lecture (ex: "3 min")
- Vues comptabilisées

**Détails techniques** :
- Table `articles` :
  ```sql
  id UUID,
  scope ENUM('global', 'company'),
  company_id UUID NULL, -- si scope='company'
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  excerpt TEXT,
  content_html TEXT,
  author_id UUID,
  status ENUM('draft', 'published', 'archived'),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
  ```
- SEO : meta_title, meta_description, keywords
- Slug auto-généré : `slugify(title)` + vérification unicité

#### **News Internes**

**Fonctionnalités** :
- RH publie pour ses employés
- Notification in-app + email (optionnel)
- Ciblage par département (optionnel)

**Détails techniques** :
- Table `articles` avec `scope='company'` et `company_id`
- Filtrage : `WHERE scope='company' AND company_id = :companyId`

---

### **Module I - KPIs / Compteurs (LE CŒUR DU BESOIN)**

**Objectif** : Fournir des compteurs d'activité **sans jamais exposer le contenu médical**.

#### **Pour paiement praticien**

**Données visibles** :
- Total consultations (par période)
- Durée totale (en secondes ou minutes)
- Durée moyenne
- Répartition par entreprise (si multi-entreprises)

**Export** : CSV pour comptabilité

**Endpoint** : `GET /metrics/practitioners/:id?from=&to=`

**Exemple** :
```json
{
  "practitionerId": "uuid",
  "period": "2025-01",
  "consultationCount": 87,
  "totalDurationSeconds": 261000, // 72.5h
  "averageDurationMinutes": 50,
  "byCompany": [
    { "companyName": "TechCorp", "count": 45, "duration": 135000 }
  ]
}
```

#### **Pour RH (usage par employé)**

**Données visibles** :
- Nombre de consultations (par période)
- Durée totale (anonymisé, sans détails)

**Données CACHÉES** :
- Praticien consulté
- Spécialité
- Motif consultation
- Contenu chat/notes
- Dates exactes (seulement période agrégée)

**Endpoint** : `GET /metrics/employees/:id?from=&to=`

**Exemple** :
```json
{
  "employeeId": "uuid",
  "employeeName": "Marc Dupont",
  "department": "Développement",
  "period": "2025-01",
  "consultationCount": 4,
  "totalDurationSeconds": 12000 // 200 min
}
```

#### **Pour Admin (global)**

**Données visibles** :
- Toutes entreprises agrégées
- Ranking usage
- Qualité service (taux complétion, satisfaction)

**Endpoint** : `GET /metrics/global?from=&to=`

#### **Tables de compteurs**

```sql
-- Activité praticien (par jour)
CREATE TABLE practitioner_activity_daily (
  id UUID PRIMARY KEY,
  practitioner_id UUID NOT NULL,
  day DATE NOT NULL,
  consult_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  UNIQUE(practitioner_id, day)
);

-- Activité employé (par jour)
CREATE TABLE employee_activity_daily (
  id UUID PRIMARY KEY,
  employee_id UUID NOT NULL,
  company_id UUID NOT NULL,
  day DATE NOT NULL,
  consult_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  UNIQUE(employee_id, day)
);

-- Activité entreprise (par jour)
CREATE TABLE company_activity_daily (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  day DATE NOT NULL,
  consult_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  active_users_count INT DEFAULT 0,
  UNIQUE(company_id, day)
);
```

**Alimentation** :
- **Option 1** : Event-driven (à chaque `consultation.completed`)
- **Option 2** : Job nightly (CRON, plus simple au début)

---

## 📱 4. ÉCRANS (LISTE EXHAUSTIVE PAR RÔLE)

### **Public / Commun**

1. **Landing marketing**
   - Hero + Features + Témoignages + CTA
   - Section sécurité & confidentialité
2. **Page Sécurité & Confidentialité**
   - Chiffrement E2E
   - Secret médical
   - RGPD
   - Certifications
3. **Login / Reset Password**
   - Email + mot de passe
   - Lien "Mot de passe oublié"
   - 2FA (optionnel)
4. **Pages erreur**
   - 403 (Accès refusé)
   - 404 (Page non trouvée)
   - Maintenance

---

### **Employé (R5)**

1. **Dashboard "Safe Space"**
   - Prochains RDV
   - Ressources bien-être
   - News entreprise
   - Bouton "Urgence / Besoin d'aide"
2. **Trouver un praticien**
   - Recherche + filtres (spécialité, langue, disponibilité)
   - Liste résultats (avatar, nom, spécialité, note, bio courte)
3. **Profil praticien**
   - Bio complète, spécialités, langues
   - Expérience, diplômes
   - Vidéo présentation (optionnel)
   - Disponibilités (calendrier)
   - Bouton "Réserver"
4. **Booking (choix créneau)**
   - Calendrier avec slots disponibles
   - Format : vidéo / audio / présentiel
   - Confirmation
5. **Mes RDV**
   - Onglets : À venir / Passés
   - Détails RDV : date, heure, praticien, statut
   - Boutons : Rejoindre (si < 15 min) / Annuler
6. **Salle de consultation**
   - iFrame Jitsi
   - Sidebar chat
   - Bouton "Quitter"
7. **Journal personnel**
   - Éditeur texte
   - Mood picker (1-5)
   - Tags
   - Historique (liste)
8. **Ressources / Blog**
   - Articles bien-être
   - Filtres : catégorie, tags
   - Recherche
9. **Notifications**
   - Liste notifications
   - Badge compteur non lus
10. **Paramètres compte**
    - Profil (nom, email, avatar)
    - Sécurité (mot de passe, 2FA)
    - Préférences (langue, notifications)

---

### **Praticien (R4)**

1. **Dashboard praticien**
   - Statistiques :
     - Consultations ce mois
     - Heures prestées
     - Durée moyenne
     - Prochains RDV
   - Bouton "Exporter activité (CSV)"
2. **Mon agenda**
   - Vue calendrier (semaine/mois)
   - Créneaux récurrents (gestion)
   - Exceptions (congés, jours fériés)
3. **Consultations**
   - Liste : À venir / Passées
   - Détails consultation
   - Boutons : Confirmer / Annuler / Rejoindre
4. **Salle de consultation**
   - iFrame Jitsi
   - Sidebar chat
   - Bouton "Démarrer consultation" (sets `started_at`)
   - Bouton "Terminer consultation" (sets `ended_at` + calcul durée)
   - Bouton "Ajouter note clinique" (post-consultation)
5. **Notes cliniques**
   - Liste notes (par consultation)
   - Éditeur (Markdown ou WYSIWYG)
   - Sauvegarde chiffrée
6. **Profil public**
   - Édition bio, spécialités, langues
   - Upload avatar, vidéo
   - Diplômes, expérience
7. **Documents & Vérification**
   - Upload diplômes, assurance pro, N° ADELI
   - Statut validation Admin
8. **Export activité**
   - Sélection période (mois, trimestre, année)
   - Export CSV (nombre + durée + entreprise)

---

### **Admin RH Entreprise (R3)**

1. **Dashboard RH**
   - KPIs anonymisés :
     - Taux d'utilisation (% employés actifs)
     - Nb consultations ce mois
     - Durée moyenne
   - Graphiques (tendances)
2. **Fiche entreprise**
   - Logo (upload)
   - Cover (upload)
   - Infos contact (email, téléphone, adresse)
   - Domaines emails autorisés
3. **Employés**
   - Liste employés (nom, département, statut)
   - Boutons : Importer CSV / Créer employé
   - Détails employé :
     - Profil minimal
     - **Usage** : nb consultations + durée (par période)
     - ❌ **PAS** de contenu médical
4. **Usage par employé**
   - Tableau :
     - Nom, Département, Consultations (période), Durée totale
   - Filtres : département, période
   - Export CSV
5. **News internes**
   - Éditeur (titre, contenu, image)
   - Publication / Brouillon
   - Ciblage département (optionnel)
6. **Paramètres**
   - Domaines email autorisés
   - Règles anonymisation
   - Notifications
7. **Support / Tickets**
   - Créer ticket
   - Suivi tickets

---

### **Admin HuntZen (R2)**

1. **Dashboard global**
   - Entreprises actives
   - Praticiens actifs
   - Consultations ce mois
   - Taux de satisfaction global
2. **Entreprises**
   - Liste entreprises (nom, statut, date création)
   - Actions : Valider / Suspendre / Voir détails
   - Détails entreprise :
     - Infos complètes
     - Historique
     - Usage (nb consultations, durée)
3. **Praticiens**
   - Liste praticiens (nom, spécialité, statut)
   - Actions : Valider / Rejeter / Voir détails
   - Détails praticien :
     - Profil complet
     - Documents uploadés
     - Vérification (checkbox : documents OK)
     - Usage (nb consultations, durée)
4. **Contenus blog**
   - Liste articles (titre, statut, date publication)
   - Boutons : Créer article / Modifier / Supprimer
   - Éditeur article :
     - Titre, slug, excerpt, contenu (WYSIWYG)
     - Catégorie, tags
     - SEO (meta title, description, keywords)
     - Statut : brouillon / publié / programmé
5. **Modération**
   - Signalements
   - Contenus à modérer
6. **Exports & Rapports**
   - Export global (entreprises, praticiens, consultations)
   - Rapports personnalisés
7. **Support N2**
   - Tickets escaladés
   - Résolution / Transfert

---

### **Super Super Admin PSG (R1)**

1. **Monitoring infra**
   - CPU / RAM / Disk (graphiques temps réel)
   - Uptime API
   - Uptime PostgreSQL
   - Uptime Redis
   - Uptime Jitsi
2. **Logs sécurité**
   - Auth (login, logout, échecs)
   - Rate limit (IP bloquées)
   - Anomalies (détection patterns suspects)
3. **Backups & Restauration**
   - Liste backups (date, taille, statut)
   - Bouton "Restaurer"
   - Planification backups (CRON)
4. **Paramètres globaux**
   - Feature flags (activer/désactiver modules)
   - Variables config
5. **Gestion clés chiffrement**
   - KMS interne (Key Management System)
   - Rotation clés (planifié)
6. **Audit trail global**
   - Logs actions sensibles :
     - EMPLOYEE_IMPORTED
     - PRACTITIONER_APPROVED
     - CONSULTATION_COMPLETED
     - ARTICLE_PUBLISHED
   - Filtres : action, acteur, période
   - **Sans contenu médical**

---

## 🏗️ 5. ARCHITECTURE TECHNIQUE

### **Stack Officielle**

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - App Router (SSR/Server Components)                       │
│  - Tailwind + shadcn/ui                                     │
│  - i18n (FR/EN)                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS (Nginx reverse proxy)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (NestJS) - Port 3000                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API (OpenAPI/Swagger)                         │   │
│  │  - Auth, Tenancy, Users, Companies, Practitioners   │   │
│  │  - Booking, Consultations, Content, Metrics, Audit  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebSocket (Socket.IO) - Port 3001                  │   │
│  │  - Chat temps réel                                  │   │
│  │  - Notifications                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────┬───────────┬───────────┬──────────────┬──────────────┘
       │           │           │              │
       ▼           ▼           ▼              ▼
   ┌──────┐  ┌──────┐  ┌──────────┐  ┌────────────────┐
   │ PG   │  │Redis │  │  Jitsi   │  │  S3/MinIO      │
   │ SQL  │  │Cache │  │  Server  │  │  (Files)       │
   └──────┘  └──────┘  └──────────┘  └────────────────┘
```

---

### **Frontend (Next.js)**

**Version** : Next.js 14+ (App Router)

**Caractéristiques** :
- SSR (Server-Side Rendering)
- Server Components (réduction JS client)
- Caching maîtrisé (`fetch` + `revalidate`)
- i18n (internationalisation FR/EN)

**UI** :
- Tailwind CSS 4.x
- shadcn/ui (composants propres)
- Lucide React (icônes)
- Recharts (graphiques)

**Data Fetching** :
- Pages publiques : SSG/ISR + cache (blog, marketing)
- App privée : SSR + streaming (Server Components)
- API calls : `fetch` avec `next: { revalidate: 60 }`

**Performance** :
- Skeletons (loading states)
- Pagination (20 items/page)
- Virtualized lists (employés, messages)
- Lazy loading (images)
- Code splitting (automatic)

---

### **Backend (NestJS)**

**Version** : NestJS 10.x + TypeScript 5.x

**Modules** :
- `AuthModule` : Login, JWT, MFA
- `TenancyModule` : Multi-tenant (middleware)
- `UsersModule` : CRUD users
- `CompaniesModule` : CRUD companies
- `PractitionersModule` : CRUD practitioners + availability
- `BookingModule` : Consultations, scheduling
- `ConsultationsModule` : Start/end, duration, counters
- `ContentModule` : Blog, news
- `MetricsModule` : Compteurs (praticien, employé, entreprise)
- `AuditModule` : Logs, audit trail

**WebSocket** :
- Gateway Socket.IO (port 3001)
- Namespace `/chat`
- Authentification JWT sur connection

**Rate Limiting** :
- Throttler NestJS
- Login : 5 tentatives / 15 min
- API : 100 requêtes / 15 min (configurable)

**Validation** :
- class-validator (DTOs)
- class-transformer
- `whitelist: true` (supprime propriétés inconnues)

**Logging** :
- Winston (JSON structuré)
- Niveaux : error, warn, info, debug
- Rotation quotidienne

**Queue** :
- BullMQ + Redis
- Jobs : emails, agrégations metrics, exports

---

### **Base de Données (PostgreSQL)**

**Version** : PostgreSQL 15+

**Caractéristiques** :
- UUID partout (pas d'auto-increment)
- Row Level Security (RLS) activé
- Indexes optimisés
- Vues matérialisées (compteurs)

**Schéma** : Voir section 7

---

### **Cache & Queue (Redis)**

**Version** : Redis 7.x

**Usages** :
- Sessions JWT (optionnel, si JWT stateless suffisant)
- Rate limiting (compteurs)
- Cache API (résultats fréquents)
- Queue BullMQ (jobs async)

---

### **Visioconférence (Jitsi)**

**Déploiement** : Docker-jitsi-meet (self-hosted)

**Architecture** :
```
docker-compose.yml :
  - web (Nginx frontend)
  - prosody (XMPP server)
  - jicofo (Jitsi Conference Focus)
  - jvb (Jitsi Videobridge)
```

**Reverse Proxy** :
- Nginx avec SSL (Let's Encrypt)
- Domaine : `meet.huntzen.care`

**Authentification** :
- JWT Jitsi (app_id, secret, domain)
- Généré côté backend NestJS
- Expiré après durée consultation + 15 min

---

### **Stockage Fichiers**

**Options** :
- **Local** : Disk (dev/small prod)
- **Cloud** : MinIO (S3-compatible), Wasabi, AWS S3

**Chiffrement** :
- Fichiers sensibles (documents praticiens) chiffrés avant upload
- AES-256-GCM

**Types** :
- Avatars, covers
- Documents praticiens (diplômes, assurance)
- Pièces jointes chat (images, PDF)

---

## 🔑 6. CONVENTION IDS, SLUGS, ROUTES

### **IDs**

- **Format** : UUID v4 partout
- **Exemples** :
  - `user_id` : `f47ac10b-58cc-4372-a567-0e02b2c3d479`
  - `company_id` : `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
  - `consultation_id` : `12345678-1234-1234-1234-123456789012`

### **Multi-tenant**

- `company_id` obligatoire pour toutes tables tenant-scopées
- Tables concernées :
  - `users` (sauf Super Admin, Admin HuntZen)
  - `consultations`
  - `employee_activity_daily`
  - `company_activity_daily`
  - `articles` (si scope='company')

### **Slugs**

- **Articles** : slug unique global (ex: `comment-gerer-stress-travail`)
- **News** : slug unique par company (ex: `nouvelle-salle-sport`)
- Génération :
  ```javascript
  import slugify from 'slugify';
  
  const slug = slugify(title, { lower: true, strict: true });
  // Vérifier unicité, sinon ajouter -2, -3, etc.
  ```

### **Routes Frontend (Next.js)**

```
/                           → Landing marketing
/login                      → Login
/employee                   → Dashboard employé
/employee/booking           → Recherche praticien
/employee/booking/[id]      → Profil praticien + booking
/employee/consultations     → Mes RDV
/employee/consultations/[id] → Salle consultation
/employee/journal           → Journal personnel
/employee/resources         → Blog/Ressources
/practitioner               → Dashboard praticien
/practitioner/agenda        → Agenda
/practitioner/consultations → Liste consultations
/practitioner/consultations/[id] → Salle consultation
/practitioner/notes         → Notes cliniques
/rh                         → Dashboard RH
/rh/employees               → Liste employés
/rh/usage                   → Usage par employé
/admin                      → Dashboard Admin HuntZen
/admin/companies            → Liste entreprises
/admin/practitioners        → Liste praticiens
/admin/blog                 → Gestion blog
/super-admin                → Dashboard Super Admin
/super-admin/monitoring     → Monitoring infra
/super-admin/logs           → Logs sécurité
```

---

## 🗄️ 7. BASE DE DONNÉES (SCHÉMA COMPLET)

### **Tables Core**

#### **roles**
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL, -- 'SUPER_ADMIN', 'ADMIN_HUNTZEN', etc.
  label VARCHAR(100) NOT NULL,
  permissions_json JSONB, -- Liste permissions
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID REFERENCES roles(id),
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role_id ON users(role_id);
```

#### **companies**
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain_email VARCHAR(255), -- @techcorp.com
  logo_url VARCHAR(500),
  cover_url VARCHAR(500),
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'France',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_is_active ON companies(is_active);
```

---

### **Tables Practitioners**

#### **practitioner_profiles**
```sql
CREATE TABLE practitioner_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialties TEXT[], -- ['PSYCHOLOGUE_CLINICIEN', 'TCC']
  bio TEXT,
  languages TEXT[], -- ['fr', 'en', 'ar']
  city VARCHAR(100),
  video_url VARCHAR(500), -- Vidéo de présentation
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practitioner_profiles_specialties ON practitioner_profiles USING GIN(specialties);
CREATE INDEX idx_practitioner_profiles_verified ON practitioner_profiles(is_verified);
```

#### **practitioner_documents**
```sql
CREATE TABLE practitioner_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'diploma', 'insurance', 'adeli'
  file_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_practitioner_documents_practitioner_id ON practitioner_documents(practitioner_id);
```

---

### **Tables Booking & Consultations**

#### **availability_slots**
```sql
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME, -- '09:00'
  end_time TIME, -- '17:00'
  is_recurring BOOLEAN DEFAULT TRUE,
  start_date DATE, -- Pour slots ponctuels
  end_date DATE,
  slot_duration_minutes INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_slots_practitioner_id ON availability_slots(practitioner_id);
CREATE INDEX idx_availability_slots_day ON availability_slots(day_of_week);
```

#### **availability_exceptions**
```sql
CREATE TABLE availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255), -- 'Congé', 'Jour férié'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practitioner_id, date)
);

CREATE INDEX idx_availability_exceptions_practitioner_id ON availability_exceptions(practitioner_id);
CREATE INDEX idx_availability_exceptions_date ON availability_exceptions(date);
```

#### **consultations**
```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  practitioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20), -- 'video', 'audio', 'in_person'
  status VARCHAR(20), -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT, -- Calculé automatiquement via trigger
  jitsi_room VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_company_id ON consultations(company_id);
CREATE INDEX idx_consultations_employee_id ON consultations(employee_id);
CREATE INDEX idx_consultations_practitioner_id ON consultations(practitioner_id);
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);
CREATE INDEX idx_consultations_status ON consultations(status);
```

**Trigger : Calcul automatique `duration_seconds`**
```sql
CREATE OR REPLACE FUNCTION calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_duration_trigger
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
  EXECUTE FUNCTION calculate_duration();
```

---

### **Tables Compteurs (CŒUR DU SYSTÈME)**

#### **practitioner_activity_daily**
```sql
CREATE TABLE practitioner_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  consult_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(practitioner_id, day)
);

CREATE INDEX idx_practitioner_activity_practitioner_id ON practitioner_activity_daily(practitioner_id);
CREATE INDEX idx_practitioner_activity_day ON practitioner_activity_daily(day);
```

**Alimentation** : Job CRON ou event-driven après `consultation.completed`

**Exemple d'agrégation** :
```sql
INSERT INTO practitioner_activity_daily (practitioner_id, day, consult_count, total_duration_seconds)
SELECT
  practitioner_id,
  DATE(ended_at) AS day,
  COUNT(*) AS consult_count,
  SUM(duration_seconds) AS total_duration_seconds
FROM consultations
WHERE status = 'completed'
  AND ended_at >= CURRENT_DATE - INTERVAL '1 day'
  AND ended_at < CURRENT_DATE
GROUP BY practitioner_id, DATE(ended_at)
ON CONFLICT (practitioner_id, day) DO UPDATE
  SET consult_count = EXCLUDED.consult_count,
      total_duration_seconds = EXCLUDED.total_duration_seconds,
      updated_at = NOW();
```

#### **employee_activity_daily**
```sql
CREATE TABLE employee_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  consult_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, day)
);

CREATE INDEX idx_employee_activity_employee_id ON employee_activity_daily(employee_id);
CREATE INDEX idx_employee_activity_company_id ON employee_activity_daily(company_id);
CREATE INDEX idx_employee_activity_day ON employee_activity_daily(day);
```

#### **company_activity_daily**
```sql
CREATE TABLE company_activity_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  consult_count INT DEFAULT 0,
  total_duration_seconds INT DEFAULT 0,
  active_users_count INT DEFAULT 0, -- Nb employés actifs ce jour
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, day)
);

CREATE INDEX idx_company_activity_company_id ON company_activity_daily(company_id);
CREATE INDEX idx_company_activity_day ON company_activity_daily(day);
```

---

### **Tables Chat (Chiffré)**

#### **chat_threads**
```sql
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  user1_id UUID REFERENCES users(id),
  user2_id UUID REFERENCES users(id),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_threads_consultation_id ON chat_threads(consultation_id);
```

#### **chat_messages**
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content_encrypted TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL, -- Initialization Vector
  auth_tag VARCHAR(32) NOT NULL, -- GCM authentication tag
  attachment_url VARCHAR(500),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

---

### **Tables Notes & Journal (Chiffré)**

#### **clinical_notes**
```sql
CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  practitioner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES users(id),
  content_encrypted TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clinical_notes_practitioner_id ON clinical_notes(practitioner_id);
CREATE INDEX idx_clinical_notes_consultation_id ON clinical_notes(consultation_id);
```

**RLS Policy** :
```sql
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY practitioner_only ON clinical_notes
  USING (practitioner_id = current_setting('app.current_user_id')::UUID);
```

#### **employee_journals**
```sql
CREATE TABLE employee_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_encrypted TEXT NOT NULL,
  iv VARCHAR(32) NOT NULL,
  auth_tag VARCHAR(32) NOT NULL,
  mood_rating INT CHECK (mood_rating BETWEEN 1 AND 5),
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_journals_employee_id ON employee_journals(employee_id);
CREATE INDEX idx_employee_journals_created_at ON employee_journals(created_at);
```

**RLS Policy** :
```sql
ALTER TABLE employee_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY employee_only ON employee_journals
  USING (employee_id = current_setting('app.current_user_id')::UUID);
```

---

### **Tables Contenus**

#### **articles**
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope VARCHAR(20) DEFAULT 'global', -- 'global' ou 'company'
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content_html TEXT,
  author_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'archived'
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_scope ON articles(scope);
CREATE INDEX idx_articles_company_id ON articles(company_id);
CREATE INDEX idx_articles_status ON articles(status);
```

#### **article_views**
```sql
CREATE TABLE article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_views_article_id ON article_views(article_id);
```

---

### **Tables Audit & Sécurité**

#### **audit_logs**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  actor_role VARCHAR(50),
  action VARCHAR(50), -- 'EMPLOYEE_IMPORTED', 'PRACTITIONER_APPROVED', etc.
  entity VARCHAR(50), -- 'user', 'consultation', 'company'
  entity_id UUID,
  company_id UUID REFERENCES companies(id),
  ip VARCHAR(45),
  user_agent TEXT,
  meta_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_user_id ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### **security_events**
```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50), -- 'LOGIN_FAILED', 'LOGIN_LOCKED', 'TOKEN_REFRESH'
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  user_id UUID REFERENCES users(id),
  ip VARCHAR(45),
  meta_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
```

---

**FIN DU CAHIER DES CHARGES V1 - Suite dans le fichier 02 ⬇️**
