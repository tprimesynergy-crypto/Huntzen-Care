# 🔌 SPÉCIFICATIONS API COMPLÈTES - HUNTZEN CARE

## 📋 CONVENTIONS API

### **Base URL**
```
Production : https://api.huntzen.care
Development : http://localhost:3000
```

### **Format**
- **Protocole** : REST
- **Content-Type** : `application/json`
- **Authentification** : JWT Bearer Token dans header `Authorization`
- **Versioning** : `/api/v1/...` (futur)

### **Codes HTTP**
- `200 OK` : Succès (GET, PUT, PATCH)
- `201 Created` : Succès création (POST)
- `204 No Content` : Succès suppression (DELETE)
- `400 Bad Request` : Erreur validation
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Non autorisé (rôle)
- `404 Not Found` : Ressource introuvable
- `409 Conflict` : Conflit (doublon)
- `429 Too Many Requests` : Rate limit dépassé
- `500 Internal Server Error` : Erreur serveur

### **Format réponses**

**Succès** :
```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

**Erreur** :
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email déjà existant",
    "details": [
      {
        "field": "email",
        "message": "Email must be unique"
      }
    ]
  }
}
```

### **Pagination**
- Query params : `?page=1&limit=20`
- Défaut : `page=1`, `limit=20`
- Max : `limit=100`

### **Filtres**
- Query params : `?status=active&department=dev`
- Dates : `?from=2025-01-01&to=2025-01-31`

### **Tri**
- Query param : `?sort=created_at:desc`
- Valeurs : `asc` / `desc`

---

## 🔐 MODULE AUTH

### **POST /auth/register**

**Description** : Créer un compte utilisateur

**Body** :
```json
{
  "email": "marc.dupont@techcorp.com",
  "password": "StrongP@ssw0rd",
  "firstName": "Marc",
  "lastName": "Dupont",
  "role": "EMPLOYEE", // Optionnel, défaut EMPLOYEE
  "companyId": "uuid", // Optionnel si invitation
  "invitationToken": "token" // Si invité par RH
}
```

**Validation** :
- `email` : format email, unique
- `password` : min 8 chars, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial
- `firstName`, `lastName` : requis si EMPLOYEE/PRACTITIONER

**Response 201** :
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "marc.dupont@techcorp.com",
      "firstName": "Marc",
      "lastName": "Dupont",
      "role": "EMPLOYEE",
      "isActive": false,
      "emailVerified": false
    },
    "message": "Email de vérification envoyé"
  }
}
```

**Errors** :
- `409 Conflict` : Email déjà existant
- `400 Bad Request` : Validation failed
- `404 Not Found` : Invitation token invalide

---

### **POST /auth/login**

**Description** : Se connecter

**Body** :
```json
{
  "email": "marc.dupont@techcorp.com",
  "password": "StrongP@ssw0rd",
  "mfaCode": "123456" // Si 2FA activé
}
```

**Response 200** :
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "marc.dupont@techcorp.com",
      "role": "EMPLOYEE",
      "companyId": "uuid",
      "firstName": "Marc",
      "lastName": "Dupont"
    }
  }
}
```

**Errors** :
- `401 Unauthorized` : Email/password incorrects
- `403 Forbidden` : Compte inactif ou email non vérifié
- `429 Too Many Requests` : Trop de tentatives (rate limit)

---

### **POST /auth/refresh**

**Description** : Renouveler access token

**Body** :
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200** :
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // Nouveau (rotation)
  }
}
```

**Errors** :
- `401 Unauthorized` : Refresh token invalide ou expiré

---

### **POST /auth/logout**

**Description** : Se déconnecter

**Headers** : `Authorization: Bearer {accessToken}`

**Response 200** :
```json
{
  "message": "Déconnexion réussie"
}
```

---

### **POST /auth/forgot-password**

**Description** : Demander réinitialisation mot de passe

**Body** :
```json
{
  "email": "marc.dupont@techcorp.com"
}
```

**Response 200** :
```json
{
  "message": "Email envoyé si compte existe"
}
```

**Note** : Message identique même si email inexistant (sécurité)

---

### **POST /auth/reset-password**

**Description** : Réinitialiser mot de passe avec token

**Body** :
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewStrongP@ssw0rd"
}
```

**Response 200** :
```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Errors** :
- `400 Bad Request` : Token invalide ou expiré

---

### **GET /auth/me**

**Description** : Obtenir utilisateur courant

**Headers** : `Authorization: Bearer {accessToken}`

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "email": "marc.dupont@techcorp.com",
    "role": "EMPLOYEE",
    "companyId": "uuid",
    "firstName": "Marc",
    "lastName": "Dupont",
    "avatarUrl": "https://...",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2025-01-20T14:30:00Z"
  }
}
```

---

## 🏢 MODULE COMPANIES

### **POST /companies**

**Description** : Créer une entreprise

**Roles** : `ADMIN_HUNTZEN`, `SUPER_ADMIN`

**Body** :
```json
{
  "name": "TechCorp France",
  "domainEmail": "@techcorp.com",
  "contactEmail": "rh@techcorp.com",
  "phone": "+33 1 23 45 67 89",
  "address": "123 Avenue de la Grande Armée",
  "city": "Paris",
  "country": "France"
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "name": "TechCorp France",
    "domainEmail": "@techcorp.com",
    "isActive": false,
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

---

### **GET /companies/:id**

**Description** : Obtenir détails entreprise

**Roles** : `ADMIN_HUNTZEN`, `ADMIN_RH` (own company only)

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "name": "TechCorp France",
    "domainEmail": "@techcorp.com",
    "logoUrl": "https://...",
    "coverUrl": "https://...",
    "contactEmail": "rh@techcorp.com",
    "phone": "+33 1 23 45 67 89",
    "address": "123 Avenue de la Grande Armée",
    "city": "Paris",
    "country": "France",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-20T14:30:00Z"
  }
}
```

---

### **PATCH /companies/:id**

**Description** : Mettre à jour entreprise

**Roles** : `ADMIN_HUNTZEN`, `ADMIN_RH` (own company only)

**Body** (tous champs optionnels) :
```json
{
  "name": "TechCorp France SAS",
  "contactEmail": "contact@techcorp.com",
  "phone": "+33 1 23 45 67 99"
}
```

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "name": "TechCorp France SAS",
    "updatedAt": "2025-01-20T15:00:00Z"
  }
}
```

---

### **POST /companies/:id/employees/import**

**Description** : Importer employés via CSV

**Roles** : `ADMIN_RH`

**Body** (multipart/form-data) :
```
file: employees.csv

Format CSV :
email,firstName,lastName,department,position
marc.dupont@techcorp.com,Marc,Dupont,Développement,Chef de Projet
claire.martin@techcorp.com,Claire,Martin,Marketing,Responsable Communication
```

**Response 200** :
```json
{
  "data": {
    "success": 45,
    "failed": 3,
    "errors": [
      {
        "row": 12,
        "email": "invalid-email",
        "reason": "Format email invalide"
      },
      {
        "row": 24,
        "email": "existing@techcorp.com",
        "reason": "Email déjà existant"
      }
    ]
  }
}
```

---

### **GET /companies/:id/employees**

**Description** : Liste employés entreprise

**Roles** : `ADMIN_RH`

**Query** : `?department=dev&status=active&page=1&limit=20`

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "marc.dupont@techcorp.com",
      "firstName": "Marc",
      "lastName": "Dupont",
      "department": "Développement",
      "position": "Chef de Projet",
      "isActive": true,
      "emailVerified": true,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 85
  }
}
```

---

### **PATCH /companies/:id/employees/:userId/status**

**Description** : Activer/désactiver employé

**Roles** : `ADMIN_RH`

**Body** :
```json
{
  "isActive": false,
  "reason": "Départ de l'entreprise"
}
```

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "isActive": false,
    "updatedAt": "2025-01-20T15:30:00Z"
  }
}
```

---

## 👨‍⚕️ MODULE PRACTITIONERS

### **POST /practitioners**

**Description** : Créer profil praticien

**Roles** : `ADMIN_HUNTZEN`

**Body** :
```json
{
  "email": "dr.sophie.martin@huntzen.care",
  "password": "TempP@ssw0rd",
  "firstName": "Sophie",
  "lastName": "Martin",
  "specialties": ["PSYCHOLOGUE_CLINICIEN", "TCC"],
  "bio": "Psychologue clinicienne spécialisée en TCC...",
  "languages": ["fr", "en"],
  "city": "Paris"
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "email": "dr.sophie.martin@huntzen.care",
    "firstName": "Sophie",
    "lastName": "Martin",
    "isVerified": false,
    "createdAt": "2025-01-20T10:00:00Z"
  }
}
```

---

### **GET /practitioners**

**Description** : Rechercher praticiens

**Roles** : `EMPLOYEE`, `PUBLIC`

**Query** : 
```
?specialties=PSYCHOLOGUE_CLINICIEN,TCC
&languages=fr,en
&city=Paris
&available_within_days=7
&sort=rating:desc
&page=1
&limit=20
```

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Sophie",
      "lastName": "Martin",
      "specialties": ["PSYCHOLOGUE_CLINICIEN", "TCC"],
      "bio": "Psychologue clinicienne...",
      "languages": ["fr", "en"],
      "city": "Paris",
      "avatarUrl": "https://...",
      "videoUrl": "https://...",
      "isVerified": true,
      "averageRating": 4.8,
      "reviewCount": 24,
      "nextAvailableSlot": "2025-01-22T14:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

---

### **GET /practitioners/:id**

**Description** : Détails praticien

**Roles** : `EMPLOYEE`, `PUBLIC`

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "firstName": "Sophie",
    "lastName": "Martin",
    "specialties": ["PSYCHOLOGUE_CLINICIEN", "TCC"],
    "bio": "Psychologue clinicienne spécialisée en TCC et gestion du stress...",
    "languages": ["fr", "en"],
    "city": "Paris",
    "avatarUrl": "https://...",
    "videoUrl": "https://...",
    "isVerified": true,
    "verifiedAt": "2025-01-10T10:00:00Z",
    "averageRating": 4.8,
    "reviewCount": 24,
    "availability": {
      "recurring": [
        { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00" },
        { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00" }
      ],
      "nextSlots": [
        { "startTime": "2025-01-22T14:00:00Z", "endTime": "2025-01-22T14:50:00Z" },
        { "startTime": "2025-01-22T15:00:00Z", "endTime": "2025-01-22T15:50:00Z" }
      ]
    }
  }
}
```

---

### **PATCH /practitioners/:id**

**Description** : Mettre à jour profil

**Roles** : `PRACTITIONER` (self), `ADMIN_HUNTZEN`

**Body** (tous champs optionnels) :
```json
{
  "bio": "Nouvelle bio...",
  "languages": ["fr", "en", "ar"],
  "videoUrl": "https://..."
}
```

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "bio": "Nouvelle bio...",
    "updatedAt": "2025-01-20T15:00:00Z"
  }
}
```

---

### **POST /practitioners/:id/documents**

**Description** : Upload documents vérification

**Roles** : `PRACTITIONER` (self)

**Body** (multipart/form-data) :
```
file: diploma.pdf
type: diploma
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "type": "diploma",
    "fileUrl": "https://...",
    "status": "pending",
    "uploadedAt": "2025-01-20T15:30:00Z"
  }
}
```

---

### **POST /practitioners/:id/verify**

**Description** : Valider praticien

**Roles** : `ADMIN_HUNTZEN`

**Body** :
```json
{
  "isVerified": true,
  "documentsVerified": true,
  "notes": "Documents conformes, praticien validé"
}
```

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "isVerified": true,
    "verifiedAt": "2025-01-20T16:00:00Z"
  }
}
```

---

## 📅 MODULE BOOKING & CONSULTATIONS

### **GET /availability**

**Description** : Obtenir créneaux disponibles

**Query** : `?practitionerId=uuid&from=2025-01-20&to=2025-01-27`

**Response 200** :
```json
{
  "data": {
    "practitionerId": "uuid",
    "slots": [
      {
        "startTime": "2025-01-22T09:00:00Z",
        "endTime": "2025-01-22T09:50:00Z",
        "available": true
      },
      {
        "startTime": "2025-01-22T10:00:00Z",
        "endTime": "2025-01-22T10:50:00Z",
        "available": false // Déjà réservé
      }
    ]
  }
}
```

---

### **POST /consultations**

**Description** : Réserver consultation

**Roles** : `EMPLOYEE`

**Body** :
```json
{
  "practitionerId": "uuid",
  "scheduledAt": "2025-01-22T14:00:00Z",
  "type": "video", // video, audio, in_person
  "duration": 50 // minutes
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "practitionerId": "uuid",
    "employeeId": "uuid",
    "companyId": "uuid",
    "type": "video",
    "status": "scheduled",
    "scheduledAt": "2025-01-22T14:00:00Z",
    "duration": 50,
    "createdAt": "2025-01-20T16:30:00Z"
  }
}
```

**Errors** :
- `409 Conflict` : Créneau déjà réservé
- `400 Bad Request` : Hors disponibilités praticien

---

### **GET /consultations**

**Description** : Liste consultations

**Roles** : `EMPLOYEE`, `PRACTITIONER`, `ADMIN_RH`

**Query** : 
```
?status=scheduled,confirmed
&from=2025-01-01
&to=2025-01-31
&page=1
&limit=20
```

**Response 200** (EMPLOYEE) :
```json
{
  "data": [
    {
      "id": "uuid",
      "practitioner": {
        "id": "uuid",
        "firstName": "Sophie",
        "lastName": "Martin",
        "avatarUrl": "https://..."
      },
      "type": "video",
      "status": "scheduled",
      "scheduledAt": "2025-01-22T14:00:00Z",
      "duration": 50,
      "canJoin": false, // true si < 15 min avant
      "canCancel": true // false si < 24h
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 8
  }
}
```

**Response 200** (ADMIN_RH - VERSION ANONYMISÉE) :
```json
{
  "data": [
    {
      "id": "uuid",
      "employeeId": "uuid", // Identifiant uniquement
      "type": "video",
      "status": "completed",
      "scheduledAt": "2025-01-22T14:00:00Z",
      "durationSeconds": 3000, // 50 min
      "completedAt": "2025-01-22T14:50:00Z"
      // ❌ PAS de practitionerId, notes, contenu chat
    }
  ]
}
```

---

### **GET /consultations/:id**

**Description** : Détails consultation

**Roles** : `EMPLOYEE`, `PRACTITIONER` (participants only)

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "practitioner": {
      "id": "uuid",
      "firstName": "Sophie",
      "lastName": "Martin",
      "specialties": ["PSYCHOLOGUE_CLINICIEN"]
    },
    "employee": {
      "id": "uuid",
      "firstName": "Marc",
      "lastName": "Dupont"
    },
    "type": "video",
    "status": "scheduled",
    "scheduledAt": "2025-01-22T14:00:00Z",
    "duration": 50,
    "jitsiRoom": "huntzen-uuid-1234567890",
    "canJoin": false,
    "canCancel": true
  }
}
```

---

### **POST /consultations/:id/start**

**Description** : Démarrer consultation (sets `started_at`)

**Roles** : `PRACTITIONER`

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "status": "in_progress",
    "startedAt": "2025-01-22T14:02:00Z"
  }
}
```

---

### **POST /consultations/:id/end**

**Description** : Terminer consultation (sets `ended_at` + calcul durée)

**Roles** : `PRACTITIONER`

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "status": "completed",
    "startedAt": "2025-01-22T14:02:00Z",
    "endedAt": "2025-01-22T14:52:00Z",
    "durationSeconds": 3000 // 50 min
  }
}
```

**Note** : Trigger DB met à jour compteurs automatiquement

---

### **POST /consultations/:id/cancel**

**Description** : Annuler consultation

**Roles** : `EMPLOYEE`, `PRACTITIONER`

**Body** :
```json
{
  "reason": "Imprévu professionnel"
}
```

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancelledAt": "2025-01-20T17:00:00Z",
    "cancelledBy": "uuid",
    "cancelReason": "Imprévu professionnel"
  }
}
```

---

## 🎥 MODULE JITSI

### **POST /jitsi/token**

**Description** : Générer JWT Jitsi pour rejoindre room

**Roles** : `EMPLOYEE`, `PRACTITIONER` (participants consultation)

**Body** :
```json
{
  "consultationId": "uuid"
}
```

**Response 200** :
```json
{
  "data": {
    "roomName": "huntzen-uuid-1234567890",
    "jwt": "eyJhbGciOiJIUzI1NiIs...",
    "domain": "meet.huntzen.care",
    "expiresAt": "2025-01-22T15:05:00Z"
  }
}
```

**Errors** :
- `403 Forbidden` : Pas participant de la consultation
- `400 Bad Request` : Trop tôt (> 15 min avant)

---

### **GET /jitsi/config**

**Description** : Config publique Jitsi

**Public** (pas d'auth)

**Response 200** :
```json
{
  "data": {
    "domain": "meet.huntzen.care",
    "apiUrl": "https://meet.huntzen.care/external_api.js"
  }
}
```

---

## 💬 MODULE CHAT (WebSocket + REST)

### **WebSocket Events**

**Connexion** :
```typescript
import io from 'socket.io-client';

const socket = io('ws://localhost:3001/chat', {
  auth: { token: accessToken }
});
```

**Événements** :

#### **chat:join**
```typescript
socket.emit('chat:join', { consultationId: 'uuid' });

// Server response
socket.on('chat:history', (messages) => {
  // Array de messages déchiffrés
});
```

#### **chat:message**
```typescript
socket.emit('chat:message', {
  consultationId: 'uuid',
  content: 'Bonjour, comment allez-vous ?',
  attachmentUrl: null
});

// Server broadcast
socket.on('chat:message:received', (message) => {
  // Nouveau message
});
```

#### **chat:typing**
```typescript
socket.emit('chat:typing', {
  consultationId: 'uuid',
  isTyping: true
});

// Server broadcast
socket.on('chat:typing', ({ userId, isTyping }) => {
  // Afficher "Marc est en train d'écrire..."
});
```

#### **chat:read**
```typescript
socket.emit('chat:read', { messageId: 'uuid' });

// Server broadcast
socket.on('chat:message:read', ({ messageId, readAt }) => {
  // Marquer message comme lu
});
```

---

### **REST Endpoints (Fallback)**

#### **GET /chat/threads**

**Description** : Liste conversations

**Roles** : `EMPLOYEE`, `PRACTITIONER`

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "consultationId": "uuid",
      "participant": {
        "id": "uuid",
        "firstName": "Sophie",
        "lastName": "Martin",
        "avatarUrl": "https://..."
      },
      "lastMessageAt": "2025-01-22T14:45:00Z",
      "unreadCount": 2
    }
  ]
}
```

---

#### **GET /chat/threads/:id/messages**

**Description** : Historique messages

**Roles** : `EMPLOYEE`, `PRACTITIONER` (participants only)

**Query** : `?limit=50&cursor=lastMessageId`

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "senderId": "uuid",
      "senderName": "Marc Dupont",
      "content": "Bonjour, comment allez-vous ?", // Déchiffré
      "attachmentUrl": null,
      "readAt": "2025-01-22T14:46:00Z",
      "createdAt": "2025-01-22T14:45:00Z"
    }
  ],
  "meta": {
    "nextCursor": "uuid"
  }
}
```

---

#### **POST /chat/threads/:id/messages**

**Description** : Envoyer message (fallback REST)

**Roles** : `EMPLOYEE`, `PRACTITIONER`

**Body** :
```json
{
  "content": "Merci pour votre message",
  "attachmentUrl": "https://..." // Optionnel
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "content": "Merci pour votre message",
    "createdAt": "2025-01-22T14:47:00Z"
  }
}
```

---

## 📝 MODULE CLINICAL NOTES

### **POST /clinical-notes**

**Description** : Créer note clinique

**Roles** : `PRACTITIONER`

**Body** :
```json
{
  "consultationId": "uuid",
  "content": "Notes de la séance : patient présente des signes de..."
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "consultationId": "uuid",
    "createdAt": "2025-01-22T15:00:00Z"
  }
}
```

**Note** : `content` est chiffré avant stockage

---

### **GET /clinical-notes/consultation/:consultationId**

**Description** : Notes d'une consultation

**Roles** : `PRACTITIONER` (author only)

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "consultationId": "uuid",
      "content": "Notes de la séance...", // Déchiffré
      "createdAt": "2025-01-22T15:00:00Z",
      "updatedAt": "2025-01-22T15:00:00Z"
    }
  ]
}
```

---

### **PATCH /clinical-notes/:id**

**Description** : Modifier note

**Roles** : `PRACTITIONER` (author only)

**Body** :
```json
{
  "content": "Mise à jour des notes..."
}
```

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "updatedAt": "2025-01-22T15:30:00Z"
  }
}
```

---

## 📔 MODULE JOURNAL

### **POST /journal**

**Description** : Créer entrée journal

**Roles** : `EMPLOYEE`

**Body** :
```json
{
  "content": "Aujourd'hui j'ai ressenti...",
  "moodRating": 4,
  "tags": ["travail", "stress"]
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "moodRating": 4,
    "tags": ["travail", "stress"],
    "createdAt": "2025-01-22T18:00:00Z"
  }
}
```

---

### **GET /journal**

**Description** : Historique journal

**Roles** : `EMPLOYEE` (self only)

**Query** : `?from=2025-01-01&to=2025-01-31&page=1&limit=20`

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Aujourd'hui j'ai ressenti...", // Déchiffré
      "moodRating": 4,
      "tags": ["travail", "stress"],
      "createdAt": "2025-01-22T18:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

## 📊 MODULE METRICS (COMPTEURS)

### **GET /metrics/practitioners/:id**

**Description** : Statistiques praticien

**Roles** : `PRACTITIONER` (self), `ADMIN_HUNTZEN`

**Query** : `?from=2025-01-01&to=2025-01-31`

**Response 200** :
```json
{
  "data": {
    "practitionerId": "uuid",
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "consultationCount": 87,
    "totalDurationSeconds": 261000, // 72.5h
    "averageDurationMinutes": 50,
    "byCompany": [
      {
        "companyId": "uuid",
        "companyName": "TechCorp",
        "consultationCount": 45,
        "totalDurationSeconds": 135000
      }
    ]
  }
}
```

---

### **GET /metrics/practitioners/:id/export**

**Description** : Export CSV praticien

**Roles** : `PRACTITIONER` (self), `ADMIN_HUNTZEN`

**Query** : `?from=2025-01-01&to=2025-01-31&format=csv`

**Response 200** (CSV file) :
```csv
# RAPPORT ACTIVITÉ PRATICIEN
# Praticien: Dr. Sophie Martin
# Période: 2025-01
# Généré le: 2025-02-01

Date,Entreprise,Durée (min),Statut
2025-01-05,TechCorp,50,completed
2025-01-07,TechCorp,52,completed
...

TOTAL,87 consultations,4350 minutes
```

---

### **GET /metrics/employees/:id**

**Description** : Statistiques employé

**Roles** : `ADMIN_RH` (own company only), `ADMIN_HUNTZEN`

**Query** : `?from=2025-01-01&to=2025-01-31`

**Response 200** :
```json
{
  "data": {
    "employeeId": "uuid",
    "employeeName": "Marc Dupont",
    "department": "Développement",
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "consultationCount": 4,
    "totalDurationSeconds": 12000 // 200 min
    // ❌ PAS de practitionerId, specialties, content
  }
}
```

---

### **GET /metrics/companies/:id**

**Description** : Statistiques entreprise

**Roles** : `ADMIN_RH` (own company), `ADMIN_HUNTZEN`

**Query** : `?from=2025-01-01&to=2025-01-31`

**Response 200** :
```json
{
  "data": {
    "companyId": "uuid",
    "companyName": "TechCorp",
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "totalEmployees": 85,
    "activeEmployees": 68,
    "usageRate": 0.80, // 80%
    "consultationCount": 142,
    "totalDurationSeconds": 426000, // 118.5h
    "averageDurationMinutes": 50,
    "byDepartment": [
      {
        "department": "Développement",
        "employeeCount": 30,
        "activeCount": 24,
        "consultationCount": 48
      }
    ]
  }
}
```

---

### **GET /metrics/rh/company-summary**

**Description** : Résumé anonymisé pour RH

**Roles** : `ADMIN_RH`

**Query** : `?from=2025-01-01&to=2025-01-31`

**Response 200** :
```json
{
  "data": {
    "period": {
      "from": "2025-01-01",
      "to": "2025-01-31"
    },
    "totalEmployees": 85,
    "activeEmployees": 68,
    "usageRate": 0.80,
    "totalConsultations": 142,
    "totalDurationHours": 118.5,
    "averageDurationMinutes": 50,
    "topDepartments": [
      {
        "department": "Développement",
        "usageRate": 0.85,
        "consultationCount": 48
      }
    ]
  }
}
```

---

## 📰 MODULE ARTICLES

### **POST /articles**

**Description** : Créer article

**Roles** : `ADMIN_HUNTZEN`, `ADMIN_RH` (si scope='company')

**Body** :
```json
{
  "scope": "global", // global ou company
  "title": "Comment gérer le stress au travail",
  "slug": "comment-gerer-stress-travail",
  "excerpt": "Le stress au travail est un problème...",
  "contentHtml": "<h1>Comment gérer le stress</h1><p>...</p>",
  "status": "draft" // draft, published
}
```

**Response 201** :
```json
{
  "data": {
    "id": "uuid",
    "slug": "comment-gerer-stress-travail",
    "status": "draft",
    "createdAt": "2025-01-22T19:00:00Z"
  }
}
```

---

### **GET /articles**

**Description** : Liste articles

**Public** (pas d'auth pour scope=global)

**Query** : `?scope=global&status=published&page=1&limit=20`

**Response 200** :
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Comment gérer le stress au travail",
      "slug": "comment-gerer-stress-travail",
      "excerpt": "Le stress au travail...",
      "author": {
        "name": "Équipe HuntZen"
      },
      "publishedAt": "2025-01-20T10:00:00Z",
      "viewCount": 142
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 56
  }
}
```

---

### **GET /articles/:slug**

**Description** : Détails article

**Public**

**Response 200** :
```json
{
  "data": {
    "id": "uuid",
    "title": "Comment gérer le stress au travail",
    "slug": "comment-gerer-stress-travail",
    "excerpt": "Le stress au travail...",
    "contentHtml": "<h1>...</h1>",
    "author": {
      "name": "Équipe HuntZen"
    },
    "publishedAt": "2025-01-20T10:00:00Z",
    "viewCount": 143 // Incrémenté automatiquement
  }
}
```

---

**FIN DES SPÉCIFICATIONS API - Suite dans le fichier 03 ⬇️**
