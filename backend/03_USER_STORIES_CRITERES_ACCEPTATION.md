# 📖 USER STORIES + CRITÈRES D'ACCEPTATION

## 🎯 ORGANISATION PAR SPRINT

---

## 🚀 SPRINT 1 : FONDATIONS & AUTHENTIFICATION

### **US-1.1 : En tant qu'utilisateur, je veux créer un compte**

**Contexte** : Création de compte avec email/mot de passe

**Critères d'acceptation** :
- ✅ Email unique validé (format email)
- ✅ Mot de passe fort : min 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
- ✅ Hash bcrypt (rounds: 10)
- ✅ Email de vérification envoyé
- ✅ Compte inactif tant que email non vérifié
- ✅ Token de vérification expire après 24h
- ✅ Rôle assigné selon contexte (EMPLOYEE par défaut)
- ✅ Multi-tenant : `companyId` assigné si invitation entreprise

**Endpoint** :
```
POST /api/auth/register
Body: { email, password, invitationToken? }
Response: { user: {...}, message: "Email de vérification envoyé" }
```

**Tests** :
- Email déjà existant → 409 Conflict
- Mot de passe faible → 400 Bad Request
- Format email invalide → 400 Bad Request
- Invitation token invalide → 404 Not Found

---

### **US-1.2 : En tant qu'utilisateur, je veux me connecter**

**Contexte** : Login avec email/mot de passe + JWT

**Critères d'acceptation** :
- ✅ Vérification email + mot de passe
- ✅ Compte actif requis
- ✅ Email vérifié requis
- ✅ Génération access token (15min) + refresh token (7 jours)
- ✅ Refresh token stocké en BDD (hasheté)
- ✅ Audit log créé (LOGIN action)
- ✅ `lastLoginAt` mis à jour
- ✅ Rate limiting : max 5 tentatives / 15 min par IP

**Endpoint** :
```
POST /api/auth/login
Body: { email, password }
Response: { 
  accessToken, 
  refreshToken,
  user: { id, email, role, companyId }
}
```

**Tests** :
- Email inexistant → 401 Unauthorized
- Mot de passe incorrect → 401 Unauthorized
- Compte inactif → 403 Forbidden
- Email non vérifié → 403 Forbidden + message spécifique
- Rate limiting dépassé → 429 Too Many Requests

---

### **US-1.3 : En tant qu'utilisateur, je veux rafraîchir mon token**

**Contexte** : Renouveler l'access token avec le refresh token

**Critères d'acceptation** :
- ✅ Refresh token valide requis
- ✅ Token non expiré
- ✅ Token existe en BDD
- ✅ Génération nouveau access token (15min)
- ✅ Rotation refresh token (nouveau refresh token généré)
- ✅ Ancien refresh token invalidé

**Endpoint** :
```
POST /api/auth/refresh
Body: { refreshToken }
Response: { accessToken, refreshToken }
```

**Tests** :
- Refresh token expiré → 401 Unauthorized
- Refresh token invalide → 401 Unauthorized
- Refresh token déjà utilisé (rotation) → 401 Unauthorized

---

### **US-1.4 : En tant qu'utilisateur, je veux me déconnecter**

**Contexte** : Logout + invalidation tokens

**Critères d'acceptation** :
- ✅ Refresh token supprimé de BDD
- ✅ Audit log créé (LOGOUT action)
- ✅ Access token reste valide jusqu'à expiration (côté client doit le supprimer)
- ✅ Optionnel : Blacklist access token si logout immédiat requis

**Endpoint** :
```
POST /api/auth/logout
Headers: Authorization: Bearer {accessToken}
Response: { message: "Déconnexion réussie" }
```

---

### **US-1.5 : En tant qu'utilisateur, je veux réinitialiser mon mot de passe**

**Contexte** : Mot de passe oublié

**Critères d'acceptation** :
- ✅ Email envoyé avec lien de réinitialisation
- ✅ Token unique généré (expire après 1h)
- ✅ Lien : `https://app.huntzen.care/reset-password?token={token}`
- ✅ Nouveau mot de passe validé (mêmes règles que register)
- ✅ Tous les refresh tokens invalidés après réinit
- ✅ Email de confirmation envoyé après réinitialisation
- ✅ Rate limiting : max 3 demandes / heure par email

**Endpoints** :
```
POST /api/auth/forgot-password
Body: { email }
Response: { message: "Email envoyé si compte existe" }

POST /api/auth/reset-password
Body: { token, newPassword }
Response: { message: "Mot de passe réinitialisé" }
```

---

## 🏢 SPRINT 2 : ENTREPRISES & EMPLOYÉS

### **US-2.1 : En tant qu'Admin HuntZen, je veux créer une entreprise**

**Contexte** : Onboarding nouvelle entreprise

**Critères d'acceptation** :
- ✅ Création fiche entreprise (nom, secteur, taille, contacts)
- ✅ Slug unique généré depuis nom
- ✅ `emailDomains` définis pour auto-validation employés
- ✅ Logo + cover uploadables (optionnel)
- ✅ Statut initial : `isActive: false` (en attente validation)
- ✅ Email de bienvenue envoyé à `contactEmail`
- ✅ Audit log créé

**Endpoint** :
```
POST /api/companies
Role: ADMIN_HUNTZEN
Body: { name, legalName, siret, emailDomains[], sector, size, contactEmail, ... }
Response: { company: {...} }
```

**Tests** :
- Slug déjà existant → générer slug-2, slug-3, etc.
- SIRET déjà existant → 409 Conflict
- emailDomains vide → 400 Bad Request

---

### **US-2.2 : En tant qu'Admin HuntZen, je veux valider une entreprise**

**Contexte** : Activation entreprise après vérification documents

**Critères d'acceptation** :
- ✅ Mise à jour `isActive: true`
- ✅ `validatedAt` renseigné
- ✅ `validatedBy` = userId admin
- ✅ Email de confirmation envoyé à Admin RH
- ✅ Accès plateforme activé pour l'entreprise
- ✅ Audit log créé

**Endpoint** :
```
PUT /api/companies/:id/validate
Role: ADMIN_HUNTZEN
Response: { company: {...}, message: "Entreprise validée" }
```

---

### **US-2.3 : En tant qu'Admin RH, je veux inviter des employés**

**Contexte** : Import employés par CSV ou création manuelle

**Critères d'acceptation** :
- ✅ CSV accepté avec colonnes : email, firstName, lastName, department, position
- ✅ Validation email (format + domaine autorisé)
- ✅ Création comptes User + Employee
- ✅ Génération token d'invitation (expire 7 jours)
- ✅ Email d'invitation envoyé avec lien activation
- ✅ Statut initial : `isActive: false`
- ✅ Audit log pour chaque employé créé
- ✅ Rapport d'import : succès + échecs

**Endpoints** :
```
POST /api/employees/import
Role: ADMIN_RH
Body: FormData (CSV file)
Response: { 
  success: 45, 
  failed: 3, 
  errors: [{row: 12, email: "...", reason: "..."}] 
}

POST /api/employees
Role: ADMIN_RH
Body: { email, firstName, lastName, department, position }
Response: { employee: {...}, invitationSent: true }
```

**Tests** :
- Email hors domaine autorisé → refusé
- Email déjà existant → skip ou mise à jour
- CSV mal formaté → 400 Bad Request avec détails

---

### **US-2.4 : En tant qu'employé invité, je veux activer mon compte**

**Contexte** : Premier login après invitation

**Critères d'acceptation** :
- ✅ Clic sur lien d'invitation → page création mot de passe
- ✅ Token validé (non expiré, non utilisé)
- ✅ Mot de passe défini (règles de sécurité)
- ✅ Compte activé (`isActive: true`)
- ✅ Email vérifié automatiquement
- ✅ Onboarding montré (consentement RGPD, présentation plateforme)
- ✅ Redirect vers dashboard employé

**Endpoint** :
```
POST /api/employees/activate
Body: { token, password }
Response: { message: "Compte activé", accessToken, refreshToken }
```

---

### **US-2.5 : En tant qu'Admin RH, je veux voir les statistiques employés**

**Contexte** : Dashboard RH avec compteurs anonymisés

**Critères d'acceptation** :
- ✅ Vue liste employés avec : nom, département, statut (actif/inactif)
- ✅ Compteurs PAR EMPLOYÉ : nb consultations + durée totale (par période)
- ✅ **JAMAIS afficher** : praticien consulté, spécialité, motifs, dates exactes
- ✅ Filtres : département, période (mois, trimestre, année)
- ✅ Export CSV avec données anonymisées
- ✅ Notice RGPD bien visible : "Données agrégées uniquement, seuil min. 10 employés"

**Endpoint** :
```
GET /api/employees
Role: ADMIN_RH
Query: ?department=Dev&period=2025-01
Response: {
  employees: [
    {
      id, firstName, lastName, department, position,
      isActive, onboardingCompleted,
      stats: {
        period: "2025-01",
        consultationCount: 4,
        totalDurationMinutes: 200
      }
    }
  ]
}

GET /api/reports/employee-usage
Role: ADMIN_RH
Query: ?period=2025-01&format=csv
Response: CSV file
```

---

## 👨‍⚕️ SPRINT 3 : PRATICIENS & DISPONIBILITÉS

### **US-3.1 : En tant qu'Admin HuntZen, je veux valider un praticien**

**Contexte** : Onboarding praticien avec vérification documents

**Critères d'acceptation** :
- ✅ Praticien créé avec statut `isValidated: false`
- ✅ Documents uploadés : diplômes, assurance pro, N° ADELI/RPPS
- ✅ Admin vérifie documents
- ✅ Validation : `isValidated: true`, `validatedAt`, `documentsVerified: true`
- ✅ Email de confirmation envoyé au praticien
- ✅ Praticien visible dans recherche employés
- ✅ Audit log créé

**Endpoint** :
```
POST /api/practitioners/:id/validate
Role: ADMIN_HUNTZEN
Body: { validated: true, notes: "Documents conformes" }
Response: { practitioner: {...}, message: "Praticien validé" }
```

---

### **US-3.2 : En tant que praticien, je veux gérer mes disponibilités**

**Contexte** : Définir horaires récurrents + exceptions

**Critères d'acceptation** :
- ✅ Disponibilités récurrentes : jour de semaine + plage horaire
- ✅ Durée créneaux personnalisable (défaut 50 min)
- ✅ Buffer entre consultations (défaut 10 min)
- ✅ Exceptions : congés, jours fériés (marquer date comme indisponible)
- ✅ Modification/suppression disponibilités
- ✅ Génération automatique slots disponibles (côté API)

**Endpoints** :
```
POST /api/availability
Role: PRACTITIONER
Body: { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", slotDuration: 50 }
Response: { availability: {...} }

GET /api/availability/slots
Role: PRACTITIONER (ou EMPLOYEE pour recherche)
Query: ?practitionerId=xxx&date=2025-01-20
Response: {
  slots: [
    { startTime: "09:00", endTime: "09:50", available: true },
    { startTime: "10:00", endTime: "10:50", available: false }, // déjà réservé
    ...
  ]
}

POST /api/availability/exception
Role: PRACTITIONER
Body: { date: "2025-12-25", isAvailable: false, reason: "Noël" }
Response: { exception: {...} }
```

---

### **US-3.3 : En tant qu'employé, je veux rechercher un praticien**

**Contexte** : Recherche avec filtres

**Critères d'acceptation** :
- ✅ Recherche par : spécialité, langue, format (vidéo/audio/présentiel)
- ✅ Filtres : disponible sous X jours, accepte nouveaux clients
- ✅ Tri : pertinence, note moyenne, expérience
- ✅ Résultats paginés (20 par page)
- ✅ Affichage : avatar, nom, spécialité, langues, note, bio courte
- ✅ Clic → profil détaillé

**Endpoint** :
```
GET /api/practitioners/search
Role: EMPLOYEE
Query: ?specialty=PSYCHOLOGUE_CLINICIEN&language=fr&offersVideo=true&page=1&limit=20
Response: {
  practitioners: [...],
  total: 45,
  page: 1,
  pages: 3
}
```

---

## 📅 SPRINT 4 : CONSULTATIONS & RÉSERVATIONS

### **US-4.1 : En tant qu'employé, je veux réserver une consultation**

**Contexte** : Booking d'un créneau disponible

**Critères d'acceptation** :
- ✅ Sélection praticien + créneau (date + heure)
- ✅ Format choisi : vidéo / audio
- ✅ Vérification disponibilité (slot encore libre)
- ✅ Création consultation avec statut `SCHEDULED`
- ✅ Événement créé : `SCHEDULED`
- ✅ Notifications envoyées :
  - Email employé : confirmation + lien iCal
  - Email praticien : nouvelle demande
  - Notification in-app pour les deux
- ✅ Génération nom salle Jitsi (si vidéo) : `huntzen-{consultationId}-{timestamp}`
- ✅ Politique d'annulation affichée (24h avant)

**Endpoint** :
```
POST /api/consultations
Role: EMPLOYEE
Body: {
  practitionerId: "uuid",
  scheduledAt: "2025-01-20T14:00:00Z",
  duration: 50,
  format: "VIDEO"
}
Response: {
  consultation: {...},
  message: "Consultation réservée"
}
```

**Tests** :
- Créneau déjà réservé → 409 Conflict
- Hors disponibilités praticien → 400 Bad Request
- Date passée → 400 Bad Request

---

### **US-4.2 : En tant que praticien, je veux confirmer une consultation**

**Contexte** : Validation de la demande

**Critères d'acceptation** :
- ✅ Consultation statut `SCHEDULED` → `CONFIRMED`
- ✅ Événement créé : `CONFIRMED`
- ✅ Email + notification envoyés à l'employé
- ✅ Consultation ajoutée à l'agenda praticien

**Endpoint** :
```
PUT /api/consultations/:id/confirm
Role: PRACTITIONER
Response: { consultation: {...}, message: "Consultation confirmée" }
```

---

### **US-4.3 : En tant qu'utilisateur, je veux annuler une consultation**

**Contexte** : Annulation avant consultation

**Critères d'acceptation** :
- ✅ Annulation possible jusqu'à 24h avant (configurable)
- ✅ Si < 24h : message d'avertissement + confirmation requise
- ✅ Statut → `CANCELLED`
- ✅ `cancelledAt`, `cancelledBy`, `cancelReason` renseignés
- ✅ Événement créé : `CANCELLED`
- ✅ Notifications envoyées aux deux parties
- ✅ Slot redevient disponible pour réservation

**Endpoint** :
```
PUT /api/consultations/:id/cancel
Role: EMPLOYEE | PRACTITIONER
Body: { reason: "Imprévu professionnel" }
Response: { message: "Consultation annulée" }
```

**Tests** :
- Annulation après 24h → warning mais autorisé
- Consultation déjà terminée → 400 Bad Request
- Consultation déjà annulée → 400 Bad Request

---

### **US-4.4 : En tant qu'utilisateur, je veux rejoindre la salle de consultation**

**Contexte** : Accès à la visio Jitsi ou appel audio

**Critères d'acceptation** :
- ✅ Accès possible 15 min avant l'heure prévue
- ✅ **Vidéo** : Génération JWT Jitsi avec permissions
  - Praticien = modérateur
  - Employé = participant
- ✅ JWT expire après durée consultation + 15 min (buffer)
- ✅ Événement créé : `ROOM_JOINED` (horodaté)
- ✅ **Audio** : Signaling WebRTC via Socket.IO
- ✅ Indicateur "en ligne" affiché pour l'autre partie
- ✅ Bouton "Quitter" → événement `ROOM_LEFT`

**Endpoint** :
```
GET /api/consultations/:id/room
Role: EMPLOYEE | PRACTITIONER (participant consultation)
Response: {
  roomName: "huntzen-uuid-timestamp",
  jwt: "eyJhbGciOiJIUzI1NiIs...",
  domain: "meet.huntzen.care",
  format: "VIDEO" | "AUDIO"
}
```

**Tests** :
- Accès avant 15 min → 403 Forbidden
- Consultation annulée → 404 Not Found
- Utilisateur non participant → 403 Forbidden

---

### **US-4.5 : En tant que praticien, je veux démarrer/terminer la consultation**

**Contexte** : Horodatage précis pour compteurs

**Critères d'acceptation** :
- ✅ **Démarrer** : Bouton visible dès que praticien rejoint
  - Statut → `IN_PROGRESS`
  - `startedAt` = timestamp
  - Événement `STARTED` créé
- ✅ **Terminer** : Bouton visible pendant consultation
  - Statut → `COMPLETED`
  - `endedAt` = timestamp
  - `actualDuration` calculé automatiquement (trigger DB)
  - Événement `ENDED` créé
  - `billingStatus` → `VALIDATED` (compte dans compteurs)
- ✅ CTA post-consultation :
  - Praticien : "Ajouter notes cliniques"
  - Employé : "Réserver prochaine séance" + "Noter le praticien"

**Endpoints** :
```
PUT /api/consultations/:id/start
Role: PRACTITIONER
Response: { consultation: {...}, message: "Consultation démarrée" }

PUT /api/consultations/:id/end
Role: PRACTITIONER
Response: { 
  consultation: {...}, 
  actualDuration: 52,
  message: "Consultation terminée" 
}
```

---

## 💬 SPRINT 5 : CHAT TEMPS RÉEL

### **US-5.1 : En tant que participant, je veux envoyer un message**

**Contexte** : Chat pendant/après consultation

**Critères d'acceptation** :
- ✅ Message texte + optionnel fichier joint (image, PDF)
- ✅ Contenu chiffré AES-256-GCM avant sauvegarde
- ✅ Message envoyé via WebSocket (Socket.IO)
- ✅ Message sauvegardé en BDD (historique)
- ✅ Message reçu en temps réel par l'autre partie (si en ligne)
- ✅ Notification si destinataire hors ligne
- ✅ Indicateur "envoyé / lu" (timestamp `readAt`)

**WebSocket Event** :
```typescript
socket.emit('chat:message', {
  consultationId: "uuid",
  content: "Bonjour, comment allez-vous ?",
  attachmentUrl: null
});

socket.on('chat:message:received', (message) => {
  // Afficher message
});
```

**REST Fallback** :
```
POST /api/chat/:consultationId/messages
Role: EMPLOYEE | PRACTITIONER
Body: { content: "...", attachmentUrl: "..." }
Response: { message: {...} }
```

---

### **US-5.2 : En tant que participant, je veux voir l'historique des messages**

**Contexte** : Chargement historique au join de la room

**Critères d'acceptation** :
- ✅ Messages triés par `createdAt` (ASC)
- ✅ Déchiffrement côté backend avant envoi au client
- ✅ Pagination : 50 messages par requête
- ✅ Scroll infini pour charger plus anciens
- ✅ Métadonnées affichées : heure, statut lu/non lu

**Endpoint** :
```
GET /api/chat/:consultationId/messages
Role: EMPLOYEE | PRACTITIONER
Query: ?limit=50&cursor=lastMessageId
Response: {
  messages: [...],
  nextCursor: "uuid" | null
}
```

---

### **US-5.3 : En tant que participant, je veux voir l'indicateur "en train d'écrire"**

**Contexte** : UX temps réel

**Critères d'acceptation** :
- ✅ Événement envoyé quand utilisateur tape (debounce 500ms)
- ✅ Événement stop quand utilisateur arrête de taper (timeout 3s)
- ✅ Affichage "Marc est en train d'écrire..." pour l'autre partie
- ✅ Pas de sauvegarde en BDD (événement éphémère)

**WebSocket Event** :
```typescript
socket.emit('chat:typing', {
  consultationId: "uuid",
  isTyping: true
});

socket.on('chat:typing', ({ userId, isTyping }) => {
  // Afficher indicateur
});
```

---

## 📝 SPRINT 6 : NOTES CLINIQUES & JOURNAL

### **US-6.1 : En tant que praticien, je veux ajouter des notes cliniques**

**Contexte** : Notes confidentielles post-consultation

**Critères d'acceptation** :
- ✅ Accessible uniquement par le praticien auteur
- ✅ Contenu chiffré E2E (AES-256-GCM)
- ✅ Clé de chiffrement unique par note
- ✅ Notes liées à une consultation
- ✅ Édition/suppression possibles
- ✅ **JAMAIS accessible** par RH, Admin, ou employé
- ✅ Audit log créé (sans contenu)

**Endpoints** :
```
POST /api/clinical-notes
Role: PRACTITIONER
Body: { consultationId: "uuid", content: "Notes cliniques..." }
Response: { note: { id, consultationId, createdAt } }

GET /api/clinical-notes/consultation/:consultationId
Role: PRACTITIONER (author only)
Response: { notes: [...] }

PUT /api/clinical-notes/:id
Role: PRACTITIONER (author only)
Body: { content: "Mise à jour..." }
Response: { note: {...} }
```

**Tests** :
- Employé tente accès → 403 Forbidden
- Autre praticien tente accès → 403 Forbidden
- Admin tente accès → 403 Forbidden

---

### **US-6.2 : En tant qu'employé, je veux tenir un journal personnel**

**Contexte** : Journal bien-être privé

**Critères d'acceptation** :
- ✅ Entrées texte chiffrées E2E
- ✅ Sélection mood optionnel (1-5)
- ✅ Tags personnalisables (ex: "travail", "famille", "stress")
- ✅ Édition/suppression possibles
- ✅ **JAMAIS accessible** par praticien, RH, ou Admin
- ✅ Export personnel (PDF/TXT)

**Endpoints** :
```
POST /api/journal
Role: EMPLOYEE
Body: { content: "Aujourd'hui j'ai ressenti...", mood: "GOOD", tags: ["travail"] }
Response: { entry: {...} }

GET /api/journal
Role: EMPLOYEE
Query: ?startDate=2025-01-01&endDate=2025-01-31
Response: { entries: [...] }

DELETE /api/journal/:id
Role: EMPLOYEE
Response: { message: "Entrée supprimée" }
```

---

## 📊 SPRINT 7 : COMPTEURS & EXPORTS

### **US-7.1 : En tant que praticien, je veux voir mes statistiques**

**Contexte** : Dashboard praticien + export paie

**Critères d'acceptation** :
- ✅ Vue mois en cours :
  - Nb consultations réalisées
  - Total heures (calculé depuis `actualDuration`)
  - Durée moyenne
- ✅ Filtre période (mois, trimestre, année)
- ✅ Détail par entreprise (si multi-entreprises)
- ✅ Export CSV :
  - Colonnes : Date, Entreprise, Durée, Statut
  - **PAS DE** : nom employé, motif, notes
- ✅ Bouton "Exporter pour paie"

**Endpoints** :
```
GET /api/reports/practitioner-stats
Role: PRACTITIONER
Query: ?period=2025-01
Response: {
  period: "2025-01",
  consultationCount: 87,
  totalDurationMinutes: 4350,
  avgDurationMinutes: 50,
  byCompany: [
    { companyName: "TechCorp", count: 45, duration: 2250 },
    { companyName: "StartupXYZ", count: 42, duration: 2100 }
  ]
}

GET /api/reports/practitioner-export-csv
Role: PRACTITIONER
Query: ?period=2025-01&format=csv
Response: CSV file
```

---

### **US-7.2 : En tant qu'Admin RH, je veux exporter les compteurs employés**

**Contexte** : Rapport mensuel pour direction

**Critères d'acceptation** :
- ✅ Export CSV avec :
  - Nom employé (ou ID anonymisé)
  - Département
  - Nb consultations période
  - Total durée période
- ✅ **PAS DE** : praticien, spécialité, dates exactes, motifs
- ✅ Notice RGPD dans le fichier (en-tête)
- ✅ Filtres : département, période
- ✅ Audit log créé (action EXPORT)

**Endpoint** :
```
GET /api/reports/export-employee-usage
Role: ADMIN_RH
Query: ?period=2025-01&department=Dev&format=csv
Response: CSV file with header:
"# RAPPORT ANONYMISÉ - Conformité RGPD
# Période: 2025-01
# Entreprise: TechCorp France
# Généré le: 2025-02-01

Employé,Département,Consultations,Durée (min)
Marc Dupont,Développement,4,200
..."
```

---

## 📰 SPRINT 8 : BLOG & NEWS

### **US-8.1 : En tant qu'Admin HuntZen, je veux publier un article**

**Contexte** : Blog public SEO

**Critères d'acceptation** :
- ✅ Éditeur rich text (Markdown ou WYSIWYG)
- ✅ Upload cover image
- ✅ Catégories + tags
- ✅ Meta SEO (title, description, keywords)
- ✅ Statuts : brouillon / publié / programmé / archivé
- ✅ Slug unique généré depuis titre
- ✅ Publication immédiate ou programmée
- ✅ Prévisualisation avant publication

**Endpoints** :
```
POST /api/articles
Role: ADMIN_HUNTZEN
Body: {
  title: "Comment gérer le stress",
  slug: "comment-gerer-stress",
  excerpt: "Le stress au travail...",
  content: "# Comment gérer le stress\n\n...",
  category: "STRESS_MANAGEMENT",
  tags: ["stress", "bien-être"],
  status: "PUBLISHED",
  coverUrl: "...",
  metaTitle: "...",
  metaDescription: "..."
}
Response: { article: {...} }

GET /api/articles
Query: ?status=PUBLISHED&category=STRESS_MANAGEMENT&page=1
Response: { articles: [...], total, pages }

GET /api/articles/:slug
Response: { article: {...} }
// Incrémente viewCount

PUT /api/articles/:id
Role: ADMIN_HUNTZEN
Body: { ... }
Response: { article: {...} }
```

---

### **US-8.2 : En tant qu'Admin RH, je veux publier une news interne**

**Contexte** : Communication entreprise

**Critères d'acceptation** :
- ✅ Titre + contenu (texte + image optionnelle)
- ✅ Publication immédiate
- ✅ Visible uniquement par employés de l'entreprise
- ✅ Notification in-app + email optionnel
- ✅ Ciblage par département (optionnel)

**Endpoints** :
```
POST /api/news
Role: ADMIN_RH
Body: {
  title: "Nouvelle salle de sport disponible",
  content: "Nous sommes heureux d'annoncer...",
  imageUrl: "...",
  targetDepartments: ["Dev", "Marketing"] // vide = tous
}
Response: { news: {...} }

GET /api/news/company
Role: EMPLOYEE
Response: { news: [...] }
```

---

## 🔔 SPRINT 9 : NOTIFICATIONS

### **US-9.1 : En tant qu'utilisateur, je veux recevoir des notifications**

**Contexte** : Notifications in-app + email

**Critères d'acceptation** :
- ✅ Types :
  - Consultation confirmée
  - Consultation annulée
  - Rappel 24h avant
  - Rappel 1h avant
  - Nouveau message chat
  - News publiée
- ✅ Badge compteur non lus (topbar)
- ✅ Panneau notifications (dropdown)
- ✅ Clic → redirect vers ressource liée
- ✅ Marquer comme lu (individuel ou tout)
- ✅ Email optionnel (paramètres utilisateur)

**Endpoints** :
```
GET /api/notifications
Query: ?unread=true&limit=20
Response: { notifications: [...], unreadCount: 5 }

PUT /api/notifications/:id/read
Response: { message: "Marquée comme lue" }

PUT /api/notifications/read-all
Response: { message: "Toutes marquées comme lues" }
```

**WebSocket** :
```typescript
socket.on('notification:new', (notification) => {
  // Afficher toast + incrémenter badge
});
```

---

## 🔍 SPRINT 10 : RECHERCHE & FILTRES AVANCÉS

### **US-10.1 : En tant qu'employé, je veux filtrer les praticiens**

**Contexte** : Recherche avec filtres multiples

**Critères d'acceptation** :
- ✅ Filtres :
  - Spécialité (dropdown)
  - Sous-spécialités (multi-select)
  - Langues (multi-select)
  - Format consultation (checkbox vidéo/audio/présentiel)
  - Disponible sous X jours (slider)
  - Note minimum (slider 1-5)
  - Accepte nouveaux clients (toggle)
- ✅ Tri :
  - Pertinence (défaut)
  - Note décroissante
  - Expérience décroissante
  - Prochaine disponibilité
- ✅ Résultats paginés (20 par page)
- ✅ URL query params conservés (partage lien)

**Endpoint** :
```
GET /api/practitioners/search
Query: ?specialty=PSYCHOLOGUE_CLINICIEN&subSpecialties=TCC,EMDR&languages=fr,en&offersVideo=true&availableWithin=7&minRating=4&acceptingNew=true&sort=rating&page=1
Response: {
  practitioners: [...],
  total: 12,
  page: 1,
  pages: 1,
  appliedFilters: {...}
}
```

---

## 🏆 SPRINT 11 : AVIS & ÉVALUATIONS

### **US-11.1 : En tant qu'employé, je veux noter un praticien**

**Contexte** : Avis après consultation

**Critères d'acceptation** :
- ✅ Possible uniquement si consultation `COMPLETED`
- ✅ Note 1-5 étoiles obligatoire
- ✅ Commentaire optionnel (max 500 caractères)
- ✅ Anonymisé côté frontend (prénom + initiale)
- ✅ Modération par Admin avant publication
- ✅ Un seul avis par consultation
- ✅ Calcul moyenne automatique (`averageRating` praticien)

**Endpoints** :
```
POST /api/practitioners/:id/reviews
Role: EMPLOYEE
Body: {
  consultationId: "uuid",
  rating: 5,
  comment: "Excellent praticien, très à l'écoute"
}
Response: { review: {...}, message: "Avis soumis pour modération" }

GET /api/practitioners/:id/reviews
Query: ?published=true&page=1
Response: { reviews: [...], averageRating: 4.8, total: 24 }
```

---

## 🔐 SPRINT 12 : SÉCURITÉ & RGPD

### **US-12.1 : En tant qu'utilisateur, je veux activer la 2FA**

**Contexte** : Authentification à deux facteurs

**Critères d'acceptation** :
- ✅ Génération secret TOTP (speakeasy)
- ✅ QR code affiché (scan avec Google Authenticator, Authy, etc.)
- ✅ Vérification code 6 chiffres pour activation
- ✅ Codes de secours générés (10 codes à usage unique)
- ✅ 2FA requis au login si activé
- ✅ Désactivation possible (avec mot de passe + code 2FA)

**Endpoints** :
```
POST /api/auth/2fa/setup
Response: { 
  secret: "base32secret",
  qrCodeUrl: "data:image/png;base64,...",
  backupCodes: ["123456", "789012", ...]
}

POST /api/auth/2fa/verify
Body: { code: "123456" }
Response: { message: "2FA activée", twoFactorEnabled: true }

POST /api/auth/2fa/disable
Body: { password: "...", code: "123456" }
Response: { message: "2FA désactivée" }
```

---

### **US-12.2 : En tant qu'employé, je veux exercer mes droits RGPD**

**Contexte** : Droits d'accès, portabilité, oubli

**Critères d'acceptation** :
- ✅ **Droit d'accès** : Export données personnelles (JSON)
- ✅ **Droit à la portabilité** : Export format lisible (PDF + JSON)
- ✅ **Droit d'opposition** : Désactivation compte (sans suppression immédiate)
- ✅ **Droit à l'oubli** : Suppression compte + données
  - Consultation historique → anonymisée (employé remplacé par "Utilisateur supprimé")
  - Notes cliniques → conservées (obligation légale 20 ans)
  - Journal personnel → supprimé immédiatement
  - Messages → anonymisés
- ✅ Demande confirmée par email
- ✅ Délai légal : 30 jours (automatisé si possible)
- ✅ Audit log créé

**Endpoints** :
```
GET /api/users/me/export
Response: JSON file with all user data

POST /api/users/me/delete-request
Body: { password: "...", reason: "..." }
Response: { 
  message: "Demande enregistrée, suppression dans 30 jours",
  cancellableUntil: "2025-02-20T00:00:00Z"
}

POST /api/users/me/delete-request/cancel
Response: { message: "Suppression annulée" }
```

---

## 📈 SPRINT 13 : MONITORING & ADMIN

### **US-13.1 : En tant que Super Admin, je veux voir le health check**

**Contexte** : Monitoring infrastructure

**Critères d'acceptation** :
- ✅ Statut API : online/offline
- ✅ Statut PostgreSQL : latence, connections actives
- ✅ Statut Redis : latence, mémoire utilisée
- ✅ Statut Jitsi : ping, version
- ✅ Disk space : utilisation disque
- ✅ CPU / RAM : utilisation serveur
- ✅ Uptime API
- ✅ Last backup : date + statut

**Endpoint** :
```
GET /api/super-admin/health
Role: SUPER_ADMIN
Response: {
  status: "healthy",
  timestamp: "2025-01-20T14:30:00Z",
  uptime: 864000, // secondes
  services: {
    api: { status: "up", latency: 12 },
    postgres: { status: "up", latency: 5, connections: 12 },
    redis: { status: "up", latency: 1, memoryUsed: "45MB" },
    jitsi: { status: "up", ping: 8, version: "2.0.8719" }
  },
  server: {
    cpuUsage: "25%",
    memoryUsage: "60%",
    diskUsage: "42%"
  },
  lastBackup: "2025-01-20T02:00:00Z"
}
```

---

### **US-13.2 : En tant que Super Admin, je veux consulter les audit logs**

**Contexte** : Traçabilité actions sensibles

**Critères d'acceptation** :
- ✅ Filtres :
  - Action (CREATE, UPDATE, DELETE, LOGIN, EXPORT, etc.)
  - Resource (consultation, employee, company, etc.)
  - User (userId, email, role)
  - Company
  - Date range
- ✅ Recherche full-text (userId, email, resourceId)
- ✅ Pagination (50 logs par page)
- ✅ Tri chronologique (desc par défaut)
- ✅ Détails affichés : qui, quoi, quand, où (IP), changements (diff)

**Endpoint** :
```
GET /api/super-admin/audit-logs
Role: SUPER_ADMIN
Query: ?action=UPDATE&resource=consultation&userId=xxx&startDate=2025-01-01&endDate=2025-01-31&page=1
Response: {
  logs: [
    {
      id, timestamp, userId, userEmail, userRole,
      action, resource, resourceId, companyId,
      ipAddress, userAgent,
      changesBefore: {...},
      changesAfter: {...}
    }
  ],
  total, page, pages
}
```

---

**FIN DES USER STORIES - Total : 40 US**

---

## ✅ CHECKLIST GLOBALE (MVP)

### **Authentification** (6/6)
- [x] Register
- [x] Login
- [x] Refresh token
- [x] Logout
- [x] Forgot/Reset password
- [x] Email verification

### **Entreprises** (5/5)
- [x] Create company (Admin HuntZen)
- [x] Validate company
- [x] Update company (Admin RH)
- [x] Upload logo/cover
- [x] View company stats

### **Employés** (5/5)
- [x] Import CSV
- [x] Create employee
- [x] Activate account
- [x] View employee list
- [x] Export usage stats

### **Praticiens** (5/5)
- [x] Create practitioner
- [x] Validate practitioner
- [x] Update profile
- [x] Manage availability
- [x] Search practitioners

### **Consultations** (8/8)
- [x] Book consultation
- [x] Confirm consultation
- [x] Cancel consultation
- [x] Join room (video/audio)
- [x] Start consultation
- [x] End consultation
- [x] No-show
- [x] View history

### **Chat** (4/4)
- [x] Send message (text + file)
- [x] Receive message (real-time)
- [x] View history
- [x] Typing indicator

### **Notes & Journal** (4/4)
- [x] Create clinical note (encrypted)
- [x] View clinical notes
- [x] Create journal entry (encrypted)
- [x] View journal entries

### **Compteurs & Reports** (4/4)
- [x] Practitioner stats
- [x] Practitioner billing export
- [x] Employee usage stats
- [x] Employee usage export (CSV)

### **Blog & News** (4/4)
- [x] Create article
- [x] Publish article
- [x] Create internal news
- [x] View articles/news

### **Notifications** (3/3)
- [x] In-app notifications
- [x] Email notifications
- [x] Mark as read

### **Sécurité & RGPD** (3/3)
- [x] 2FA setup
- [x] Data export (RGPD)
- [x] Account deletion (RGPD)

### **Admin & Monitoring** (2/2)
- [x] Health check
- [x] Audit logs

**TOTAL : 53 fonctionnalités MVP** ✅

