# 🎯 GUIDE FINAL POUR CURSOR - HUNTZEN CARE

## 📋 RÉSUMÉ EXÉCUTIF

**Vous avez maintenant TOUT pour développer HuntZen Care de A à Z.**

---

## ✅ CE QUI EST LIVRÉ

### **1. Documentation Complète**
- ✅ **00_README.md** : Guide d'utilisation de la documentation
- ✅ **01_CDC_HUNTZEN_CARE_V1.md** : Cahier des charges (80 pages)
- ✅ **02_SPECIFICATIONS_API_COMPLETE.md** : 100+ endpoints REST (60 pages)
- ✅ **03_AMOA_PLAN_LIVRAISON.md** : Planning 19 semaines (50 pages)
- ✅ **05_RAPPORT_COMPLET_CURSOR.md** : Rapport master (structure repo complète)
- ✅ **06_BACKEND_NESTJS_CODE_COMPLET.md** : Code backend (RBAC, guards, controllers, services)
- ✅ **07_SQL_COMPLET_TRIGGERS.sql** : Schéma SQL avec triggers automatiques
- ✅ **08_GUIDE_FINAL_CURSOR.md** : Ce fichier (instructions finales)

---

## 🚀 COMMENT UTILISER CETTE DOCUMENTATION AVEC CURSOR

### **Approche Recommandée : Développement Par Sprints**

#### **SPRINT 0 : Setup Projet (1 jour)**

**À faire** :
1. Créer monorepo pnpm
2. Initialiser Next.js + NestJS
3. Copier structure depuis `/CAHIER_CHARGES_FINAL/05_RAPPORT_COMPLET_CURSOR.md` (Section 3)
4. Setup PostgreSQL + Redis (Docker)

**Prompts Cursor** :
```
1. "Crée un monorepo pnpm avec workspaces pour Next.js (web) et NestJS (api)"

2. "Initialise Next.js 14 dans apps/web avec App Router et Tailwind"

3. "Initialise NestJS 10 dans apps/api avec TypeScript"

4. "Copie la structure de fichiers exacte depuis le cahier des charges (Section 3 du fichier 05)"
```

---

#### **SPRINT 1 : Auth + RBAC (2 jours)**

**Fichiers sources** :
- `/CAHIER_CHARGES_FINAL/06_BACKEND_NESTJS_CODE_COMPLET.md` (Section 2 + 4)
- `/CAHIER_CHARGES_FINAL/05_RAPPORT_COMPLET_CURSOR.md` (Section 4 : RBAC complet)

**À implémenter** :
1. Enums rôles (`roles.enum.ts`)
2. Permissions (`permissions.ts`)
3. Matrice RBAC (`rbac.matrix.ts`)
4. Service RBAC (`rbac.service.ts`)
5. Decorators (`@Roles`, `@Perms`)
6. Guards (JWT, Roles, Perms, CompanyScope, NoMedical)
7. Auth Controller + Service
8. JWT Strategy

**Prompts Cursor** :
```
1. "Crée le fichier apps/api/src/auth/rbac/roles.enum.ts avec les 5 rôles selon le cahier des charges"

2. "Crée le fichier apps/api/src/auth/rbac/permissions.ts avec TOUTES les permissions listées"

3. "Crée le fichier apps/api/src/auth/rbac/rbac.matrix.ts avec la matrice COMPLÈTE (copie depuis fichier 05)"

4. "Crée le service RbacService avec méthodes hasPermission, hasAll, hasAny, getPermissions"

5. "Crée les decorators @Roles et @Perms selon fichier 05"

6. "Crée tous les guards : JwtAuthGuard, RolesGuard, PermsGuard, CompanyScopeGuard, NoMedicalForAdminsGuard (code complet dans fichier 05)"

7. "Crée AuthModule, AuthController, AuthService avec register/login/logout/refresh (code dans fichier 06 section 2.2 et 2.3)"

8. "Crée JwtStrategy pour Passport (fichier 06)"
```

---

#### **SPRINT 2 : Base de Données (1 jour)**

**Fichier source** :
- `/CAHIER_CHARGES_FINAL/07_SQL_COMPLET_TRIGGERS.sql`

**À faire** :
1. Exécuter schema.sql complet
2. Vérifier triggers
3. Tester insertion/update consultation
4. Vérifier agrégations automatiques

**Prompts Cursor** :
```
1. "Exécute le fichier 07_SQL_COMPLET_TRIGGERS.sql dans PostgreSQL"

2. "Crée un fichier seed.sql pour insérer des données de test :
   - 1 entreprise
   - 1 Admin RH
   - 3 employés
   - 2 praticiens
   - 5 créneaux disponibilité
   - 10 consultations (2 completed pour tester trigger)"

3. "Teste le trigger : insère une consultation avec status=scheduled, puis UPDATE status='completed' avec started_at et ended_at, vérifie que duration_seconds est calculé et que les 3 tables d'agrégation sont mises à jour"
```

---

#### **SPRINT 3 : Module Consultations (2 jours)**

**Fichier source** :
- `/CAHIER_CHARGES_FINAL/06_BACKEND_NESTJS_CODE_COMPLET.md` (Section 4)

**À implémenter** :
1. ConsultationsModule
2. ConsultationsController (create, findMy, findOne, start, end, cancel)
3. ConsultationsService
4. DTOs (CreateConsultationDto, etc.)

**Prompts Cursor** :
```
1. "Crée ConsultationsModule dans apps/api/src/modules/consultations/ avec imports PrismaModule, RbacModule"

2. "Crée ConsultationsController selon fichier 06 section 4.1 (code COMPLET)"

3. "Crée ConsultationsService selon fichier 06 section 4.2 (code COMPLET avec méthodes create, findByUser, findOne, start, end, cancel)"

4. "Crée CreateConsultationDto avec validation class-validator :
   - companyId: UUID required
   - practitionerId: UUID required
   - scheduledAt: DateTime required
   - type: enum ('video', 'audio', 'in_person') required
   - duration: number optionnel (défaut 50)"
```

**Test critique** :
```
1. POST /consultations (créer)
2. POST /consultations/:id/start (démarrer)
3. POST /consultations/:id/end (terminer)
4. Vérifier que duration_seconds est calculé
5. Vérifier que practitioner_activity_daily est mis à jour
6. Vérifier que employee_activity_daily est mis à jour
7. Vérifier que company_activity_daily est mis à jour
```

---

#### **SPRINT 4 : Module Metrics (Compteurs) ⭐ (2 jours)**

**Fichier source** :
- `/CAHIER_CHARGES_FINAL/06_BACKEND_NESTJS_CODE_COMPLET.md` (Section 6)

**À implémenter** :
1. MetricsModule
2. MetricsController (praticien, employé, entreprise)
3. MetricsService avec requêtes SQL agrégées
4. Export CSV

**Prompts Cursor** :
```
1. "Crée MetricsModule dans apps/api/src/modules/metrics/"

2. "Crée MetricsController selon fichier 06 section 6.1 (code COMPLET) avec endpoints :
   - GET /metrics/practitioners/:id
   - GET /metrics/practitioners/:id/export
   - GET /metrics/employees/:id
   - GET /metrics/companies/:id
   - GET /metrics/companies/:id/export"

3. "Crée MetricsService selon fichier 06 section 6.2 (code COMPLET) avec méthodes :
   - getPractitionerMetrics (requête SQL sur practitioner_activity_daily)
   - getEmployeeMetrics (requête SQL sur employee_activity_daily)
   - getCompanyMetrics (requête SQL sur company_activity_daily)
   - exportPractitionerCSV (génération CSV)
   - exportCompanyCSV (génération CSV)"
```

**Test critique** :
```
1. Créer 10 consultations completed pour un praticien
2. GET /metrics/practitioners/:id?from=2025-01-01&to=2025-01-31
3. Vérifier :
   - consultations: 10
   - totalDurationSeconds: correct
   - averageDurationMinutes: correct
4. GET /metrics/practitioners/:id/export?from=2025-01-01&to=2025-01-31
5. Vérifier format CSV avec header + lignes + total
```

---

#### **SPRINT 5 : Module Medical (Protégé) ⚠️ (1 jour)**

**Fichier source** :
- `/CAHIER_CHARGES_FINAL/06_BACKEND_NESTJS_CODE_COMPLET.md` (Section 5)

**À implémenter** :
1. MedicalModule
2. MedicalController (notes cliniques + journal)
3. MedicalService avec EncryptionService
4. Guard NoMedicalForAdminsGuard

**Prompts Cursor** :
```
1. "Crée EncryptionService dans apps/api/src/security/encryption.service.ts selon fichier 06 section 8.1 (AES-256-GCM)"

2. "Crée MedicalModule dans apps/api/src/modules/medical/"

3. "Crée MedicalController selon fichier 06 section 5.1 avec :
   - @UseGuards(JwtAuthGuard, NoMedicalForAdminsGuard, PermsGuard)
   - POST /medical/clinical-notes
   - GET /medical/clinical-notes/:consultationId
   - POST /medical/journal
   - GET /medical/journal"

4. "Crée MedicalService avec méthodes :
   - createClinicalNote (chiffrement avant insert)
   - getClinicalNote (déchiffrement après select)
   - createJournalEntry (chiffrement avant insert)
   - getJournal (déchiffrement après select)"
```

**Test critique** :
```
1. Praticien : POST /medical/clinical-notes avec content "Patient présente..."
2. Vérifier en DB : content_encrypted est BYTEA, iv et auth_tag présents
3. Praticien : GET /medical/clinical-notes/:consultationId
4. Vérifier : content déchiffré = "Patient présente..."
5. RH : GET /medical/clinical-notes/:consultationId
6. Vérifier : 403 Forbidden (NoMedicalForAdminsGuard)
```

---

#### **SPRINT 6 : Chat WebSocket (2 jours)**

**Fichier source** :
- `/CAHIER_CHARGES_FINAL/06_BACKEND_NESTJS_CODE_COMPLET.md` (Section 7)

**À implémenter** :
1. ChatModule
2. ChatGateway (WebSocket)
3. ChatService
4. Events : chat:join, chat:message, chat:typing

**Prompts Cursor** :
```
1. "Crée ChatModule dans apps/api/src/modules/chat/"

2. "Crée ChatGateway selon fichier 06 section 7 (code COMPLET WebSocket) avec :
   - @WebSocketGateway(3001, { namespace: '/chat' })
   - handleConnection, handleDisconnect
   - @SubscribeMessage('chat:join')
   - @SubscribeMessage('chat:message')
   - @SubscribeMessage('chat:typing')"

3. "Crée ChatService avec méthodes :
   - getMessages (déchiffrement)
   - saveMessage (chiffrement avant insert)
   - hasAccess (vérification participant)"
```

---

## 🎯 RÈGLES CRITIQUES À RESPECTER

### **1. Secret Médical** ⚠️

```typescript
// ❌ INTERDIT
@Get("clinical-notes/:id")
@Roles(Role.R3_COMPANY_RH) // RH ne peut PAS accéder
getClinicalNote() {}

// ✅ CORRECT
@Get("clinical-notes/:id")
@UseGuards(JwtAuthGuard, NoMedicalForAdminsGuard, PermsGuard)
@Perms(Perm.CLINICAL_NOTES_OWN_READ)
getClinicalNote() {}
```

### **2. Multi-Tenant**

```typescript
// ❌ INTERDIT
async findAll() {
  return this.prisma.employee.findMany(); // Toutes entreprises !
}

// ✅ CORRECT
async findAll(companyId: string) {
  return this.prisma.employee.findMany({
    where: { companyId }
  });
}
```

### **3. Compteurs (Duration)**

```typescript
// ❌ INTERDIT : Calculer durée en frontend
duration = endTime - startTime;

// ✅ CORRECT : Trigger DB calcule automatiquement
await this.prisma.consultation.update({
  where: { id },
  data: {
    status: "completed",
    endedAt: new Date()
  }
  // duration_seconds calculé par trigger
});
```

---

## 📊 CHECKLIST FINALE AVANT GO-LIVE

### **Backend**
- [ ] Tous les guards testés (JWT, Roles, Perms, CompanyScope, NoMedical)
- [ ] RLS PostgreSQL activé sur tables médicales
- [ ] Trigger consultation fonctionne (duration + agrégations)
- [ ] Chiffrement E2E testé (notes + journal + messages)
- [ ] Rate limiting actif
- [ ] Audit logs enregistrés
- [ ] Swagger/OpenAPI généré

### **Frontend**
- [ ] Middleware RBAC fonctionnel
- [ ] Redirect par rôle correct
- [ ] Menus dynamiques par rôle
- [ ] Pas de fuites UI (RH ne voit pas liens médicaux)

### **Sécurité**
- [ ] RH teste accès notes → 403 Forbidden ✅
- [ ] Employé A teste accès journal employé B → 403 Forbidden ✅
- [ ] Trigger duration testé 20 fois → OK ✅
- [ ] Export CSV praticien testé → Format valide ✅

### **Performance**
- [ ] Vues matérialisées rafraîchies (daily CRON)
- [ ] Redis cache actif
- [ ] Pagination partout (max 100 items)
- [ ] Index DB créés

---

## 💡 ASTUCES CURSOR

### **Pour générer un module complet** :
```
"Crée le module Consultations complet avec :
- Module dans apps/api/src/modules/consultations/consultations.module.ts
- Controller avec tous les endpoints (create, findMy, findOne, start, end, cancel)
- Service avec toutes les méthodes
- DTOs avec validation class-validator
- Guards : JwtAuthGuard, PermsGuard
- Permissions : BOOKING_CREATE, CONSULTATIONS_MY_READ, etc.

Code complet selon fichier 06_BACKEND_NESTJS_CODE_COMPLET.md section 4."
```

### **Pour débugger un guard** :
```
"Le guard NoMedicalForAdminsGuard ne fonctionne pas. Voici le code actuel :
[copier code]

Erreur observée : RH peut accéder à /medical/clinical-notes/:id

Analyse le code, identifie le problème et corrige-le."
```

### **Pour tester** :
```
"Génère un fichier test E2E Supertest pour tester :
1. POST /consultations (création)
2. POST /consultations/:id/start
3. POST /consultations/:id/end
4. Vérifier que duration_seconds > 0
5. Vérifier que practitioner_activity_daily contient 1 ligne

Code selon NestJS best practices."
```

---

## 🎉 FÉLICITATIONS !

**Vous avez maintenant :**
- ✅ Documentation complète (200+ pages)
- ✅ Code backend complet (RBAC, guards, modules, services)
- ✅ SQL avec triggers automatiques
- ✅ Règles métier claires
- ✅ Checklist de validation

**Le projet est prêt à être développé de A à Z !** 🚀

---

## 📞 SUPPORT

**Questions fréquentes** :

**Q : Le trigger ne met pas à jour les compteurs ?**  
R : Vérifier que `status` passe bien de `in_progress` à `completed` et que `started_at` et `ended_at` sont renseignés.

**Q : RH peut accéder aux notes cliniques ?**  
R : Vérifier que `NoMedicalForAdminsGuard` est bien appliqué sur le controller et que le rôle est bien R3_COMPANY_RH dans le JWT.

**Q : Compteurs praticien incorrects ?**  
R : Vérifier la requête SQL dans `MetricsService.getPractitionerMetrics`, tester avec `psql` directement.

---

**BONNE CHANCE ET EXCELLENT DÉVELOPPEMENT !** 💙🚀
