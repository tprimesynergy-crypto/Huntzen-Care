# 🗄️ SCHÉMA BASE DE DONNÉES COMPLET - PRISMA

## 📋 FICHIER : `prisma/schema.prisma`

```prisma
// Générateur Prisma Client
generator client {
  provider = "prisma-client-js"
}

// Datasource PostgreSQL
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// 1. AUTHENTIFICATION & UTILISATEURS
// ============================================================

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  role            Role      @default(EMPLOYEE)
  isActive        Boolean   @default(true)
  emailVerified   Boolean   @default(false)
  emailVerifiedAt DateTime?
  
  // 2FA
  twoFactorEnabled Boolean  @default(false)
  twoFactorSecret  String?
  
  // Multi-tenant
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id], onDelete: SetNull)
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  // Relations
  employee        Employee?
  practitioner    Practitioner?
  refreshTokens   RefreshToken[]
  auditLogs       AuditLog[]
  notifications   Notification[]
  
  @@index([email])
  @@index([companyId])
  @@index([role])
  @@index([isActive])
  @@map("users")
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  @@index([token])
  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

enum Role {
  SUPER_ADMIN
  ADMIN_HUNTZEN
  ADMIN_RH
  PRACTITIONER
  EMPLOYEE
}

// ============================================================
// 2. ENTREPRISES (MULTI-TENANT)
// ============================================================

model Company {
  id              String       @id @default(uuid())
  name            String
  slug            String       @unique
  legalName       String?
  siret           String?      @unique
  
  // Domaines email autorisés
  emailDomains    String[]     // ex: ["@techcorp.com", "@techcorp.fr"]
  
  // Informations
  sector          String?
  size            CompanySize?
  address         String?
  postalCode      String?
  city            String?
  country         String       @default("France")
  
  // Branding
  logoUrl         String?
  coverUrl        String?
  primaryColor    String?      @default("#4A90E2")
  secondaryColor  String?      @default("#5BC0DE")
  
  // Contacts
  contactEmail    String?
  contactPhone    String?
  websiteUrl      String?
  
  // Paramètres onboarding
  autoApproveEmployees    Boolean @default(false)
  requireEmailVerification Boolean @default(true)
  allowInternalNews       Boolean @default(true)
  maxEmployees            Int?
  
  // Validation
  isActive        Boolean   @default(false)
  validatedAt     DateTime?
  validatedBy     String?   // Admin HuntZen userId
  
  // Facturation (optionnel, pour futur)
  billingEmail    String?
  billingAddress  String?
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  users           User[]
  employees       Employee[]
  consultations   Consultation[]
  news            News[]
  
  @@index([slug])
  @@index([isActive])
  @@index([validatedAt])
  @@map("companies")
}

enum CompanySize {
  SMALL       // 1-50
  MEDIUM      // 51-250
  LARGE       // 251-1000
  ENTERPRISE  // 1000+
}

// ============================================================
// 3. EMPLOYÉS
// ============================================================

model Employee {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Informations personnelles
  firstName       String
  lastName        String
  department      String?
  position        String?
  phoneNumber     String?
  
  // Profil social (Facebook/Instagram style)
  bio             String?   @db.Text
  location        String?
  birthDate       DateTime?
  avatarUrl       String?
  coverUrl        String?
  
  // Onboarding
  onboardingCompletedAt DateTime?
  consentGivenAt  DateTime?
  consentVersion  String?
  
  // Préférences
  preferredLanguage String @default("fr")
  timezone        String   @default("Europe/Paris")
  
  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  consultations   Consultation[]
  journalEntries  JournalEntry[]
  messages        Message[]     @relation("EmployeeMessages")
  
  @@index([companyId])
  @@index([userId])
  @@index([department])
  @@map("employees")
}

// ============================================================
// 4. PRATICIENS
// ============================================================

model Practitioner {
  id              String    @id @default(uuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Identité professionnelle
  firstName       String
  lastName        String
  title           String    // Dr., Mme., M.
  professionalId  String?   @unique // N° ADELI, RPPS, etc.
  
  // Spécialisation
  specialty       Specialty
  subSpecialties  String[]  // ex: ["TCC", "EMDR", "Thérapie familiale"]
  languages       String[]  // ex: ["fr", "en", "ar"]
  
  // Profil public (LinkedIn/Doctolib style)
  bio             String    @db.Text
  experience      Int?      // années d'expérience
  education       String?   @db.Text
  diplomas        String[]
  certifications  String[]
  
  // Médias
  avatarUrl       String?
  coverUrl        String?
  videoUrl        String?   // Vidéo de présentation
  
  // Formats proposés
  offersVideo     Boolean   @default(true)
  offersPhone     Boolean   @default(true)
  offersInPerson  Boolean   @default(false)
  inPersonAddress String?
  
  // Validation & Documents
  isValidated     Boolean   @default(false)
  validatedAt     DateTime?
  validatedBy     String?   // Admin HuntZen userId
  documentsVerified Boolean @default(false)
  documentUrls    String[]  // Diplômes, assurance pro, etc.
  
  // Paramètres consultation
  defaultDuration Int       @default(50) // minutes
  bufferTime      Int       @default(10) // minutes entre consultations
  timezone        String    @default("Europe/Paris")
  
  // Statistiques
  totalConsultations Int    @default(0)
  averageRating   Float?
  reviewCount     Int       @default(0)
  
  // Disponibilité
  isActive        Boolean   @default(true)
  isAcceptingNewClients Boolean @default(true)
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  availabilities  Availability[]
  consultations   Consultation[]
  messages        Message[]     @relation("PractitionerMessages")
  clinicalNotes   ClinicalNote[]
  reviews         PractitionerReview[]
  
  @@index([specialty])
  @@index([isValidated])
  @@index([isActive])
  @@index([isAcceptingNewClients])
  @@map("practitioners")
}

enum Specialty {
  PSYCHOLOGUE_CLINICIEN
  PSYCHOLOGUE_TRAVAIL
  PSYCHIATRE
  PSYCHOTHERAPEUTE
  NEUROPSYCHOLOGUE
  COACH_MENTAL
  SEXOLOGUE
  PSYCHANALYSTE
}

// ============================================================
// 5. AVIS PRATICIENS
// ============================================================

model PractitionerReview {
  id              String    @id @default(uuid())
  practitionerId  String
  practitioner    Practitioner @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  
  employeeId      String    // anonymisé côté frontend
  consultationId  String    @unique
  
  rating          Int       // 1-5
  comment         String?   @db.Text
  
  // Modération
  isPublished     Boolean   @default(false)
  moderatedAt     DateTime?
  moderatedBy     String?
  
  createdAt       DateTime  @default(now())
  
  @@index([practitionerId])
  @@index([rating])
  @@index([isPublished])
  @@map("practitioner_reviews")
}

// ============================================================
// 6. DISPONIBILITÉS
// ============================================================

model Availability {
  id              String    @id @default(uuid())
  practitionerId  String
  practitioner    Practitioner @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  
  // Type
  type            AvailabilityType @default(RECURRING)
  
  // Récurrent (chaque semaine)
  dayOfWeek       Int?      // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  startTime       String?   // "09:00"
  endTime         String?   // "17:00"
  
  // Exception (congé, jour férié)
  date            DateTime? // Date spécifique
  isAvailable     Boolean   @default(true) // false = congé
  
  // Durée des créneaux
  slotDuration    Int       @default(50) // minutes
  
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([practitionerId])
  @@index([dayOfWeek])
  @@index([date])
  @@index([type])
  @@map("availabilities")
}

enum AvailabilityType {
  RECURRING   // Récurrent (ex: tous les lundis 9h-17h)
  EXCEPTION   // Exception (ex: congé le 25 décembre)
}

// ============================================================
// 7. CONSULTATIONS (CŒUR DU SYSTÈME)
// ============================================================

model Consultation {
  id              String    @id @default(uuid())
  
  // Multi-tenant
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Participants
  employeeId      String
  employee        Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  practitionerId  String
  practitioner    Practitioner @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  
  // Planification
  scheduledAt     DateTime
  scheduledEndAt  DateTime  // calculé : scheduledAt + duration
  duration        Int       @default(50) // minutes prévues
  
  // Format
  format          ConsultationFormat
  
  // Statut
  status          ConsultationStatus @default(SCHEDULED)
  
  // Horodatage RÉEL (CRITIQUE pour compteurs)
  startedAt       DateTime?
  endedAt         DateTime?
  actualDuration  Int?      // minutes réelles (calculé)
  
  // Annulation
  cancelledAt     DateTime?
  cancelledBy     String?   // userId
  cancelReason    String?   @db.Text
  cancelledWithin24h Boolean? // Pénalité si annulation < 24h
  
  // Absence
  noShowAt        DateTime?
  noShowBy        String?   // "employee" ou "practitioner"
  
  // Salle Jitsi (pour vidéo)
  roomName        String?   @unique
  roomPassword    String?
  jitsiJwt        String?   @db.Text
  
  // Notes rapides (non cliniques)
  notes           String?   @db.Text
  
  // Facturation (pour compteurs)
  isBillable      Boolean   @default(true)
  billingStatus   BillingStatus @default(PENDING)
  billedAt        DateTime?
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  messages        Message[]
  clinicalNotes   ClinicalNote[]
  events          ConsultationEvent[]
  
  @@index([companyId])
  @@index([employeeId])
  @@index([practitionerId])
  @@index([scheduledAt])
  @@index([status])
  @@index([billingStatus])
  @@index([startedAt])
  @@index([endedAt])
  @@map("consultations")
}

enum ConsultationFormat {
  VIDEO
  AUDIO
  IN_PERSON
}

enum ConsultationStatus {
  SCHEDULED   // Planifiée
  CONFIRMED   // Confirmée par praticien
  IN_PROGRESS // En cours
  COMPLETED   // Terminée normalement
  CANCELLED   // Annulée
  NO_SHOW     // Absence non excusée
}

enum BillingStatus {
  PENDING     // En attente
  VALIDATED   // Validée (compte dans les compteurs)
  BILLED      // Facturée (praticien payé)
  DISPUTED    // Contestée
}

// ============================================================
// 8. ÉVÉNEMENTS CONSULTATION (AUDIT & COMPTEURS)
// ============================================================

model ConsultationEvent {
  id              String    @id @default(uuid())
  consultationId  String
  consultation    Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  
  eventType       ConsultationEventType
  actorId         String    // userId qui déclenche
  actorRole       Role
  
  timestamp       DateTime  @default(now())
  metadata        Json?     // données supplémentaires
  
  ipAddress       String?
  userAgent       String?   @db.Text
  
  @@index([consultationId])
  @@index([eventType])
  @@index([timestamp])
  @@index([actorId])
  @@map("consultation_events")
}

enum ConsultationEventType {
  CREATED         // Consultation créée
  SCHEDULED       // Planifiée
  CONFIRMED       // Confirmée par praticien
  CANCELLED       // Annulée
  ROOM_JOINED     // Quelqu'un entre dans la salle
  ROOM_LEFT       // Quelqu'un quitte la salle
  STARTED         // Début effectif (marqué par praticien)
  ENDED           // Fin effective (marqué par praticien)
  NO_SHOW         // Absence constatée
  REMINDER_SENT   // Rappel envoyé
}

// ============================================================
// 9. CHAT MESSAGES (CHIFFRÉ)
// ============================================================

model Message {
  id              String    @id @default(uuid())
  consultationId  String
  consultation    Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  
  senderId        String
  senderRole      Role      // EMPLOYEE ou PRACTITIONER
  
  // Contenu CHIFFRÉ (AES-256-GCM)
  encryptedContent String   @db.Text
  iv              String    // Initialization Vector
  authTag         String?   // GCM authentication tag
  
  // Métadonnées
  messageType     MessageType @default(TEXT)
  isRead          Boolean   @default(false)
  readAt          DateTime?
  
  // Fichier joint (optionnel)
  attachmentUrl   String?
  attachmentName  String?
  attachmentType  String?   // "image/png", "application/pdf", etc.
  attachmentSize  Int?      // bytes
  
  // Édition/Suppression
  isEdited        Boolean   @default(false)
  editedAt        DateTime?
  isDeleted       Boolean   @default(false)
  deletedAt       DateTime?
  
  createdAt       DateTime  @default(now())
  
  // Relations
  employee        Employee?     @relation("EmployeeMessages", fields: [senderId], references: [id])
  practitioner    Practitioner? @relation("PractitionerMessages", fields: [senderId], references: [id])
  
  @@index([consultationId])
  @@index([senderId])
  @@index([createdAt])
  @@index([isRead])
  @@map("messages")
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  AUDIO
  VIDEO
}

// ============================================================
// 10. NOTES CLINIQUES (CHIFFRÉES)
// ============================================================

model ClinicalNote {
  id              String    @id @default(uuid())
  consultationId  String
  consultation    Consultation @relation(fields: [consultationId], references: [id], onDelete: Cascade)
  
  practitionerId  String
  practitioner    Practitioner @relation(fields: [practitionerId], references: [id], onDelete: Cascade)
  
  // Contenu CHIFFRÉ (accessible UNIQUEMENT par le praticien)
  encryptedContent String   @db.Text
  iv              String
  authTag         String?
  
  // Métadonnées (non sensibles)
  noteType        NoteType  @default(SESSION_NOTE)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([consultationId])
  @@index([practitionerId])
  @@index([noteType])
  @@map("clinical_notes")
}

enum NoteType {
  SESSION_NOTE       // Note de séance
  INITIAL_ASSESSMENT // Bilan initial
  FOLLOW_UP          // Suivi
  PRESCRIPTION       // Ordonnance (si psychiatre)
  REFERRAL           // Orientation
}

// ============================================================
// 11. JOURNAL PERSONNEL (CHIFFRÉ)
// ============================================================

model JournalEntry {
  id              String    @id @default(uuid())
  employeeId      String
  employee        Employee  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  // Contenu CHIFFRÉ (accessible UNIQUEMENT par l'employé)
  encryptedContent String   @db.Text
  iv              String
  authTag         String?
  
  // Métadonnées (non sensibles)
  mood            Mood?
  tags            String[]
  
  // Analyse IA (optionnel, futur)
  sentimentScore  Float?    // -1 à 1
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([employeeId])
  @@index([createdAt])
  @@index([mood])
  @@map("journal_entries")
}

enum Mood {
  VERY_BAD
  BAD
  NEUTRAL
  GOOD
  VERY_GOOD
}

// ============================================================
// 12. BLOG & ARTICLES
// ============================================================

model Article {
  id              String    @id @default(uuid())
  
  // Contenu
  title           String
  slug            String    @unique
  excerpt         String    @db.Text
  content         String    @db.Text
  coverUrl        String?
  
  // SEO
  metaTitle       String?
  metaDescription String?
  keywords        String[]
  
  // Catégorisation
  category        ArticleCategory
  tags            String[]
  
  // Publication
  status          ArticleStatus @default(DRAFT)
  publishedAt     DateTime?
  scheduledFor    DateTime?
  
  // Auteur
  authorId        String
  authorRole      Role      // SUPER_ADMIN ou ADMIN_HUNTZEN
  authorName      String
  
  // Stats
  viewCount       Int       @default(0)
  shareCount      Int       @default(0)
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([slug])
  @@index([status])
  @@index([publishedAt])
  @@index([category])
  @@index([authorId])
  @@map("articles")
}

enum ArticleCategory {
  MENTAL_HEALTH
  STRESS_MANAGEMENT
  WORK_LIFE_BALANCE
  PRODUCTIVITY
  RELATIONSHIPS
  WELLBEING
  MINDFULNESS
  BURNOUT
  ANXIETY
  DEPRESSION
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
  SCHEDULED
}

// ============================================================
// 13. NEWS INTERNES ENTREPRISE
// ============================================================

model News {
  id              String    @id @default(uuid())
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  title           String
  content         String    @db.Text
  imageUrl        String?
  
  // Publication
  publishedAt     DateTime  @default(now())
  authorId        String    // Admin RH userId
  authorName      String
  
  // Ciblage (optionnel)
  targetDepartments String[] // vide = tous
  
  // Stats
  viewCount       Int       @default(0)
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([companyId])
  @@index([publishedAt])
  @@map("news")
}

// ============================================================
// 14. NOTIFICATIONS
// ============================================================

model Notification {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type            NotificationType
  title           String
  message         String    @db.Text
  
  // Lien
  linkUrl         String?
  linkLabel       String?
  
  // Métadonnées
  metadata        Json?
  
  // État
  isRead          Boolean   @default(false)
  readAt          DateTime?
  
  // Envoi email
  emailSent       Boolean   @default(false)
  emailSentAt     DateTime?
  
  createdAt       DateTime  @default(now())
  expiresAt       DateTime? // Notifications temporaires
  
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
  @@index([type])
  @@map("notifications")
}

enum NotificationType {
  CONSULTATION_CONFIRMED
  CONSULTATION_CANCELLED
  CONSULTATION_REMINDER_24H
  CONSULTATION_REMINDER_1H
  MESSAGE_RECEIVED
  NEWS_PUBLISHED
  SYSTEM
  ACCOUNT_ACTIVATED
  PRACTITIONER_VALIDATED
  COMPANY_VALIDATED
}

// ============================================================
// 15. AUDIT LOGS
// ============================================================

model AuditLog {
  id              String    @id @default(uuid())
  
  // Qui
  userId          String
  userRole        Role
  userEmail       String
  
  // Quoi
  action          AuditAction
  resource        String    // "consultation", "employee", etc.
  resourceId      String?
  
  // Contexte
  companyId       String?
  ipAddress       String?
  userAgent       String?   @db.Text
  
  // Détails
  details         Json?
  changesBefore   Json?     // État avant (pour UPDATE)
  changesAfter    Json?     // État après (pour UPDATE)
  
  // Sécurité
  isSensitive     Boolean   @default(false) // Données santé
  
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([resourceId])
  @@index([companyId])
  @@index([createdAt])
  @@index([isSensitive])
  @@map("audit_logs")
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
  IMPORT
  VALIDATE
  CANCEL
  ACTIVATE
  DEACTIVATE
  UPLOAD
  DOWNLOAD
}

// ============================================================
// 16. FICHIERS (STOCKAGE)
// ============================================================

model File {
  id              String    @id @default(uuid())
  
  // Propriétaire
  uploadedBy      String
  userRole        Role
  
  // Multi-tenant
  companyId       String?
  
  // Fichier
  filename        String
  originalName    String
  mimeType        String
  size            Int       // bytes
  path            String    // Chemin sur disque ou S3
  
  // Chiffrement (si sensible)
  isEncrypted     Boolean   @default(false)
  encryptionKey   String?   // Chiffré avec master key
  
  // Métadonnées
  fileType        FileType
  relatedResource String?   // "consultation", "employee", etc.
  relatedId       String?
  
  // Sécurité
  isPublic        Boolean   @default(false)
  allowedRoles    Role[]
  
  createdAt       DateTime  @default(now())
  expiresAt       DateTime? // Fichiers temporaires
  
  @@index([uploadedBy])
  @@index([companyId])
  @@index([fileType])
  @@index([relatedResource, relatedId])
  @@map("files")
}

enum FileType {
  AVATAR
  COVER
  DOCUMENT
  IMAGE
  VIDEO
  AUDIO
  ATTACHMENT
  CERTIFICATE
  DIPLOMA
}

// ============================================================
// 17. COMPTEURS PRÉ-CALCULÉS (VUE MATÉRIALISÉE)
// ============================================================

// Note: Ces vues peuvent être créées via migrations SQL
// ou implémentées comme requêtes Prisma

// Vue pour RH : Compteurs par employé
// CREATE MATERIALIZED VIEW employee_usage_stats AS
// SELECT 
//   e.id as employee_id,
//   e.company_id,
//   DATE_TRUNC('month', c.scheduled_at) as period,
//   COUNT(c.id) as consultation_count,
//   SUM(c.actual_duration) as total_duration_minutes
// FROM employees e
// LEFT JOIN consultations c ON c.employee_id = e.id
// WHERE c.status = 'COMPLETED' AND c.is_billable = true
// GROUP BY e.id, e.company_id, DATE_TRUNC('month', c.scheduled_at);

// Vue pour Admin : Compteurs par praticien
// CREATE MATERIALIZED VIEW practitioner_billing_stats AS
// SELECT 
//   p.id as practitioner_id,
//   DATE_TRUNC('month', c.scheduled_at) as period,
//   COUNT(c.id) as consultation_count,
//   SUM(c.actual_duration) as total_duration_minutes,
//   c.company_id
// FROM practitioners p
// LEFT JOIN consultations c ON c.practitioner_id = p.id
// WHERE c.status = 'COMPLETED' AND c.billing_status = 'VALIDATED'
// GROUP BY p.id, DATE_TRUNC('month', c.scheduled_at), c.company_id;

// ============================================================
// 18. EMAILS (QUEUE)
// ============================================================

model EmailQueue {
  id              String    @id @default(uuid())
  
  // Destinataire
  to              String
  cc              String[]
  bcc             String[]
  
  // Contenu
  subject         String
  htmlBody        String    @db.Text
  textBody        String?   @db.Text
  
  // Template
  templateName    String?
  templateData    Json?
  
  // Statut
  status          EmailStatus @default(PENDING)
  sentAt          DateTime?
  failedAt        DateTime?
  errorMessage    String?   @db.Text
  retryCount      Int       @default(0)
  maxRetries      Int       @default(3)
  
  // Priorité
  priority        EmailPriority @default(NORMAL)
  
  createdAt       DateTime  @default(now())
  scheduledFor    DateTime? // Envoi programmé
  
  @@index([status])
  @@index([scheduledFor])
  @@index([priority])
  @@map("email_queue")
}

enum EmailStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

enum EmailPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}
```

---

## 🔄 MIGRATIONS SUPPLÉMENTAIRES (SQL)

### **Row Level Security (RLS)**

```sql
-- Activer RLS sur toutes les tables sensibles
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Policy pour employees (isolation par company)
CREATE POLICY tenant_isolation ON employees
  USING (company_id = current_setting('app.current_tenant')::uuid);

-- Policy pour consultations
CREATE POLICY tenant_isolation ON consultations
  USING (company_id = current_setting('app.current_tenant')::uuid);

-- Policy pour messages (accès limité aux participants)
CREATE POLICY consultation_participants ON messages
  USING (
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = messages.consultation_id
      AND (c.employee_id = current_setting('app.current_user')::uuid
           OR c.practitioner_id = current_setting('app.current_user')::uuid)
    )
  );

-- Policy pour notes cliniques (praticien uniquement)
CREATE POLICY practitioner_only ON clinical_notes
  USING (practitioner_id = current_setting('app.current_user')::uuid);

-- Policy pour journal (employé uniquement)
CREATE POLICY employee_only ON journal_entries
  USING (employee_id = current_setting('app.current_user')::uuid);
```

### **Index de performance**

```sql
-- Index composites pour requêtes fréquentes
CREATE INDEX idx_consultations_employee_scheduled 
  ON consultations(employee_id, scheduled_at);

CREATE INDEX idx_consultations_practitioner_scheduled 
  ON consultations(practitioner_id, scheduled_at);

CREATE INDEX idx_consultations_company_period 
  ON consultations(company_id, scheduled_at) 
  WHERE status = 'COMPLETED';

CREATE INDEX idx_messages_consultation_created 
  ON messages(consultation_id, created_at);

-- Index pour recherche full-text (articles)
CREATE INDEX idx_articles_search 
  ON articles USING gin(to_tsvector('french', title || ' ' || content));

-- Index pour recherche praticiens
CREATE INDEX idx_practitioners_specialty_active 
  ON practitioners(specialty, is_active, is_accepting_new_clients);
```

### **Vues matérialisées**

```sql
-- Vue: Compteurs employés (pour RH)
CREATE MATERIALIZED VIEW employee_usage_stats AS
SELECT 
  e.id as employee_id,
  e.company_id,
  e.first_name,
  e.last_name,
  e.department,
  DATE_TRUNC('month', c.scheduled_at) as period,
  COUNT(c.id) as consultation_count,
  COALESCE(SUM(c.actual_duration), 0) as total_duration_minutes,
  MAX(c.scheduled_at) as last_consultation_date
FROM employees e
LEFT JOIN consultations c ON c.employee_id = e.id
  AND c.status = 'COMPLETED'
  AND c.is_billable = true
GROUP BY e.id, e.company_id, e.first_name, e.last_name, e.department, DATE_TRUNC('month', c.scheduled_at);

CREATE UNIQUE INDEX ON employee_usage_stats(employee_id, period);

-- Refresh automatique (cron job ou trigger)
CREATE OR REPLACE FUNCTION refresh_employee_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY employee_usage_stats;
END;
$$ LANGUAGE plpgsql;

-- Vue: Compteurs praticiens (pour Admin)
CREATE MATERIALIZED VIEW practitioner_billing_stats AS
SELECT 
  p.id as practitioner_id,
  p.first_name,
  p.last_name,
  p.specialty,
  c.company_id,
  DATE_TRUNC('month', c.scheduled_at) as period,
  COUNT(c.id) as consultation_count,
  COALESCE(SUM(c.actual_duration), 0) as total_duration_minutes,
  AVG(c.actual_duration) as avg_duration_minutes
FROM practitioners p
LEFT JOIN consultations c ON c.practitioner_id = p.id
  AND c.status = 'COMPLETED'
  AND c.billing_status IN ('VALIDATED', 'BILLED')
GROUP BY p.id, p.first_name, p.last_name, p.specialty, c.company_id, DATE_TRUNC('month', c.scheduled_at);

CREATE UNIQUE INDEX ON practitioner_billing_stats(practitioner_id, company_id, period);

-- Refresh automatique
CREATE OR REPLACE FUNCTION refresh_practitioner_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY practitioner_billing_stats;
END;
$$ LANGUAGE plpgsql;
```

### **Triggers pour audit automatique**

```sql
-- Trigger: Audit automatique des consultations
CREATE OR REPLACE FUNCTION audit_consultation_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      user_id,
      user_role,
      user_email,
      action,
      resource,
      resource_id,
      company_id,
      changes_before,
      changes_after,
      is_sensitive
    ) VALUES (
      current_setting('app.current_user')::uuid,
      current_setting('app.current_role')::text::role,
      current_setting('app.current_email')::text,
      'UPDATE',
      'consultation',
      NEW.id,
      NEW.company_id,
      row_to_json(OLD.*),
      row_to_json(NEW.*),
      true
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_audit_trigger
  AFTER UPDATE ON consultations
  FOR EACH ROW
  EXECUTE FUNCTION audit_consultation_changes();

-- Trigger: Calcul automatique durée réelle
CREATE OR REPLACE FUNCTION calculate_actual_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.actual_duration := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER consultation_duration_trigger
  BEFORE UPDATE ON consultations
  FOR EACH ROW
  WHEN (NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL)
  EXECUTE FUNCTION calculate_actual_duration();
```

---

## 📝 SEEDS (DONNÉES DE TEST)

### **Fichier : `prisma/seeds/seed.ts`**

```typescript
import { PrismaClient, Role, Specialty, CompanySize } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
  // 1. Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@primesynergy.com' },
    update: {},
    create: {
      email: 'admin@primesynergy.com',
      passwordHash: await bcrypt.hash('SuperAdmin2025!', 10),
      role: Role.SUPER_ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Super Admin created');
  
  // 2. Admin HuntZen
  const adminHuntzen = await prisma.user.upsert({
    where: { email: 'admin@huntzen.care' },
    update: {},
    create: {
      email: 'admin@huntzen.care',
      passwordHash: await bcrypt.hash('HuntZen2025!', 10),
      role: Role.ADMIN_HUNTZEN,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Admin HuntZen created');
  
  // 3. Entreprise exemple
  const company = await prisma.company.upsert({
    where: { slug: 'techcorp-france' },
    update: {},
    create: {
      name: 'TechCorp France',
      slug: 'techcorp-france',
      legalName: 'TechCorp France SAS',
      siret: '12345678900012',
      emailDomains: ['@techcorp.com', '@techcorp.fr'],
      sector: 'Technologies',
      size: CompanySize.MEDIUM,
      address: '123 Avenue de la Grande Armée',
      postalCode: '75017',
      city: 'Paris',
      country: 'France',
      contactEmail: 'rh@techcorp.com',
      contactPhone: '+33 1 23 45 67 89',
      websiteUrl: 'https://techcorp.com',
      autoApproveEmployees: false,
      isActive: true,
      validatedAt: new Date(),
      validatedBy: adminHuntzen.id,
    },
  });
  console.log('✅ Company created');
  
  // 4. Admin RH
  const adminRhUser = await prisma.user.upsert({
    where: { email: 'claire.rousseau@techcorp.com' },
    update: {},
    create: {
      email: 'claire.rousseau@techcorp.com',
      passwordHash: await bcrypt.hash('AdminRH2025!', 10),
      role: Role.ADMIN_RH,
      companyId: company.id,
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Admin RH created');
  
  // 5. Praticien exemple
  const practitionerUser = await prisma.user.upsert({
    where: { email: 'dr.sophie.martin@huntzen.care' },
    update: {},
    create: {
      email: 'dr.sophie.martin@huntzen.care',
      passwordHash: await bcrypt.hash('Praticien2025!', 10),
      role: Role.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
  });
  
  const practitioner = await prisma.practitioner.upsert({
    where: { userId: practitionerUser.id },
    update: {},
    create: {
      userId: practitionerUser.id,
      firstName: 'Sophie',
      lastName: 'Martin',
      title: 'Dr.',
      professionalId: 'ADELI123456789',
      specialty: Specialty.PSYCHOLOGUE_CLINICIEN,
      subSpecialties: ['TCC', 'EMDR', 'Gestion du stress'],
      languages: ['fr', 'en'],
      bio: 'Psychologue clinicienne spécialisée en santé mentale au travail...',
      experience: 12,
      education: 'Master 2 Psychologie Clinique, Université Paris-Descartes',
      diplomas: ['Master 2 Psychologie', 'DU Psychotraumatologie'],
      certifications: ['Praticienne EMDR certifiée', 'Formation TCC'],
      offersVideo: true,
      offersPhone: true,
      defaultDuration: 50,
      isValidated: true,
      validatedAt: new Date(),
      validatedBy: adminHuntzen.id,
      documentsVerified: true,
      isActive: true,
      isAcceptingNewClients: true,
    },
  });
  console.log('✅ Practitioner created');
  
  // 6. Employé exemple
  const employeeUser = await prisma.user.upsert({
    where: { email: 'marc.dupont@techcorp.com' },
    update: {},
    create: {
      email: 'marc.dupont@techcorp.com',
      passwordHash: await bcrypt.hash('Employee2025!', 10),
      role: Role.EMPLOYEE,
      companyId: company.id,
      isActive: true,
      emailVerified: true,
    },
  });
  
  const employee = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      userId: employeeUser.id,
      companyId: company.id,
      firstName: 'Marc',
      lastName: 'Dupont',
      department: 'Développement',
      position: 'Chef de Projet',
      phoneNumber: '+33 6 12 34 56 78',
      bio: 'Chef de projet passionné par la tech...',
      onboardingCompletedAt: new Date(),
      consentGivenAt: new Date(),
      consentVersion: '1.0',
    },
  });
  console.log('✅ Employee created');
  
  // 7. Disponibilités praticien (exemple)
  const availabilities = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Lundi
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Mardi
    { dayOfWeek: 3, startTime: '09:00', endTime: '12:00' }, // Mercredi matin
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Jeudi
    { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }, // Vendredi
  ];
  
  for (const avail of availabilities) {
    await prisma.availability.create({
      data: {
        practitionerId: practitioner.id,
        type: 'RECURRING',
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        slotDuration: 50,
        isActive: true,
      },
    });
  }
  console.log('✅ Availabilities created');
  
  // 8. Article de blog exemple
  await prisma.article.create({
    data: {
      title: 'Comment gérer le stress au travail',
      slug: 'comment-gerer-stress-travail',
      excerpt: 'Le stress au travail est un problème croissant...',
      content: '# Comment gérer le stress au travail\n\nLe stress...',
      coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773',
      category: 'STRESS_MANAGEMENT',
      tags: ['stress', 'travail', 'bien-être'],
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: adminHuntzen.id,
      authorRole: Role.ADMIN_HUNTZEN,
      authorName: 'Équipe HuntZen',
      metaTitle: 'Comment gérer le stress au travail efficacement',
      metaDescription: 'Découvrez des techniques éprouvées pour gérer votre stress professionnel',
      keywords: ['stress', 'travail', 'gestion', 'bien-être'],
    },
  });
  console.log('✅ Article created');
  
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🚀 COMMANDES PRISMA

```bash
# Générer client Prisma
npx prisma generate

# Créer migration
npx prisma migrate dev --name init

# Reset database (dev uniquement)
npx prisma migrate reset

# Seed database
npx prisma db seed

# Prisma Studio (GUI)
npx prisma studio

# Push schema sans migration (dev)
npx prisma db push

# Pull schema depuis DB existante
npx prisma db pull

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

---

**FIN DU SCHÉMA DATABASE - Suite dans le fichier 03 ⬇️**
