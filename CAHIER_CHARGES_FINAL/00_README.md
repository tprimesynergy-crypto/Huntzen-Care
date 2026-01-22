# 📚 DOCUMENTATION COMPLÈTE HUNTZEN CARE

## 🎯 OBJECTIF

Cette documentation constitue le **Cahier des Charges complet et définitif** pour le développement de la plateforme **HuntZen Care** - MHaaS (Mental Health as a Service).

**Version** : 1.0  
**Date** : Janvier 2025  
**Rédaction** : Prime Synergy Group (AMOA)  
**Client** : HuntZen  

---

## 📁 STRUCTURE DE LA DOCUMENTATION

### **01_CDC_HUNTZEN_CARE_V1.md** (OBLIGATOIRE - Lire en premier)

**Contenu** :
- ⚠️ Principes non négociables (multi-tenant, secret médical, pas de prix)
- Vision produit
- Rôles (RBAC) détaillés (5 rôles)
- Périmètre fonctionnel (9 modules)
- Écrans exhaustifs (par rôle)
- Architecture technique (Next.js + NestJS + PostgreSQL + Redis + Jitsi)
- Conventions (IDs, slugs, routes)
- **Base de données complète** (schéma SQL avec 18 tables)
- Sécurité & performance

**Pages** : ~80 pages  
**Utilisation** : Document de référence principal. À lire AVANT de commencer.

---

### **02_SPECIFICATIONS_API_COMPLETE.md** (DÉVELOPPEMENT)

**Contenu** :
- Conventions API (REST + WebSocket)
- **100+ endpoints détaillés** :
  - Auth (8 endpoints)
  - Companies (6 endpoints)
  - Practitioners (8 endpoints)
  - Booking & Consultations (10 endpoints)
  - Jitsi (2 endpoints)
  - Chat WebSocket + REST (6 endpoints + 4 events)
  - Clinical Notes (4 endpoints)
  - Journal (4 endpoints)
  - Metrics / Compteurs (6 endpoints) ⭐
  - Articles / Blog (4 endpoints)
- Exemples requêtes/réponses JSON
- Codes HTTP + gestion erreurs
- Pagination, filtres, tri

**Pages** : ~60 pages  
**Utilisation** : Contrat API entre frontend et backend. À utiliser pendant le dev.

---

### **03_AMOA_PLAN_LIVRAISON.md** (GESTION PROJET)

**Contenu** :
- Gouvernance projet (MOA, AMOA, MOE)
- **14 livrables AMOA** détaillés
- **Phasage en 4 phases + 10 sprints** (19 semaines)
  - Phase 0 : Cadrage (2 semaines)
  - Phase 1 : MVP (8 semaines)
  - Phase 2 : Sécurité (4 semaines)
  - Phase 3 : Contenus (4 semaines)
  - Phase 4 : Déploiement (1 semaine)
- Backlog produit (MoSCoW)
- **10 critères de recette** (tests d'acceptation)
- Risques & mitigation
- Métriques de succès (KPIs)
- Checklist finale avant Go-Live

**Pages** : ~50 pages  
**Utilisation** : Pilotage projet, planning, recette.

---

## 🚀 COMMENT UTILISER CETTE DOCUMENTATION

### **Pour le Product Owner / MOA**

**Étape 1** : Lire `01_CDC_HUNTZEN_CARE_V1.md` (2-3h)
- Valider vision produit
- Valider principes non négociables
- Valider écrans par rôle

**Étape 2** : Lire `03_AMOA_PLAN_LIVRAISON.md` (1h)
- Valider planning (19 semaines)
- Valider livrables
- Valider critères de recette

**Étape 3** : Réunion de lancement
- Présenter cahier des charges à l'équipe
- Valider backlog Sprint 1
- Lancer développement

---

### **Pour le Tech Lead**

**Étape 1** : Lire `01_CDC_HUNTZEN_CARE_V1.md` - Section 5 (Architecture) + Section 7 (DB)
- Valider stack technique
- Valider schéma DB
- Identifier dépendances techniques

**Étape 2** : Lire `02_SPECIFICATIONS_API_COMPLETE.md` en entier
- Valider contrats API
- Créer spec OpenAPI/Swagger
- Préparer repo backend (NestJS)

**Étape 3** : Setup projet
- Créer repos GitHub (frontend + backend)
- Initialiser Next.js + NestJS
- Configurer Prisma avec schéma DB
- Setup CI/CD (GitHub Actions)

---

### **Pour les Développeurs Backend**

**Étape 1** : Lire `01_CDC_HUNTZEN_CARE_V1.md` - Section 7 (Base de données)
- Comprendre modèle de données
- Copier schéma Prisma
- Créer migrations initiales

**Étape 2** : Lire `02_SPECIFICATIONS_API_COMPLETE.md`
- Module par module, implémenter endpoints
- Respecter contrats API (request/response)
- Écrire tests unitaires (Jest)

**Étape 3** : Développement sprint par sprint
- Suivre `03_AMOA_PLAN_LIVRAISON.md` pour ordre de dev
- Sprint 1 : Auth + Companies
- Sprint 2 : Practitioners + Booking
- Sprint 3 : Consultations + Jitsi
- Sprint 4 : Compteurs ⭐

---

### **Pour les Développeurs Frontend**

**Étape 1** : Lire `01_CDC_HUNTZEN_CARE_V1.md` - Section 4 (Écrans)
- Liste exhaustive des 40+ écrans
- Wireframes (à créer dans Figma)
- Composants à développer

**Étape 2** : Lire `02_SPECIFICATIONS_API_COMPLETE.md`
- Créer services API (axios/fetch)
- Typage TypeScript (interfaces)
- Gestion états (Zustand/Context)

**Étape 3** : Développement par rôle
- Employé (10 écrans)
- Praticien (8 écrans)
- Admin RH (7 écrans)
- Admin HuntZen (7 écrans)
- Super Admin (6 écrans)

---

### **Pour le QA / Testeur**

**Étape 1** : Lire `03_AMOA_PLAN_LIVRAISON.md` - Section 5 (Critères de recette)
- 10 critères détaillés
- Créer scénarios de test (Excel)
- Préparer jeux de données

**Étape 2** : Tests par sprint
- Sprint 1 : Auth + RBAC
- Sprint 2 : Booking
- Sprint 3 : Consultations + Jitsi
- Sprint 4 : Compteurs (CRITIQUE ⭐)

**Étape 3** : Recette finale
- Grille de recette complète
- Tests E2E (Playwright)
- PV de recette signé

---

### **Pour le DevOps**

**Étape 1** : Lire `01_CDC_HUNTZEN_CARE_V1.md` - Section 5 (Architecture)
- Stack : Next.js + NestJS + PostgreSQL + Redis + Jitsi
- Hébergement : VPS Hostinger
- Docker-compose production

**Étape 2** : Setup infrastructure
- Docker : `docker-compose.yml` (backend + frontend + PostgreSQL + Redis + Jitsi)
- Nginx : reverse proxy + SSL (Let's Encrypt)
- CI/CD : GitHub Actions (build + deploy)
- Monitoring : Grafana + Prometheus

**Étape 3** : Exploitation
- Backups quotidiens (PostgreSQL)
- Monitoring uptime (API + Jitsi + DB)
- Alertes (Slack/PagerDuty)
- PRA (Plan Reprise Activité)

---

## ⚠️ PRINCIPES NON NÉGOCIABLES (RAPPEL)

### **1. Multi-tenant**
- La plateforme doit supporter **10+ entreprises**
- Isolation stricte des données par `company_id`
- Row Level Security (RLS) PostgreSQL OBLIGATOIRE

### **2. Secret médical absolu**
- ❌ RH ne voit JAMAIS : notes, messages, contenu consultation, identité praticien
- ✅ RH voit UNIQUEMENT : nombre consultations + durée (anonymisé)

### **3. Pas de prix / Paiement hors plateforme**
- ❌ AUCUN tarif/prix dans le produit
- ✅ La plateforme fournit des **compteurs d'activité** pour payer les praticiens

### **4. Compteurs fiables (CŒUR DU SYSTÈME)**
- Nombre de consultations (par praticien, par employé, par entreprise)
- Durée totale (calculée automatiquement via trigger DB)
- Temps par période (jour, semaine, mois)
- Export CSV pour comptabilité

---

## 📊 CHIFFRES CLÉS DU PROJET

### **Fonctionnel**
- **5 rôles** (Super Admin, Admin HuntZen, Admin RH, Praticien, Employé)
- **9 modules** (Auth, Companies, Practitioners, Booking, Consultations, Chat, Notes, Metrics, Content)
- **40+ écrans** (10 Employé, 8 Praticien, 7 RH, 7 Admin HuntZen, 6 Super Admin)
- **80+ User Stories**

### **Technique**
- **100+ endpoints REST**
- **20+ événements WebSocket**
- **18 tables** (PostgreSQL)
- **15 000+ lignes** de code backend (estimé)
- **10 000+ lignes** de code frontend (estimé)

### **Planning**
- **19 semaines** (4.5 mois)
- **10 sprints**
- **4 phases** (Cadrage, MVP, Sécurité, Contenus)

### **Équipe recommandée**
- 1 Product Owner
- 1 AMOA
- 1 Tech Lead
- 2 Dev Backend (NestJS)
- 2 Dev Frontend (Next.js)
- 1 DevOps
- 1 QA

### **Budget estimé**
- **150-200k€** (selon localisation équipe)

---

## 🔑 POINTS CRITIQUES À VALIDER AVANT DE DÉMARRER

### **1. Décision Technique**
- [ ] Stack validée : Next.js + NestJS + PostgreSQL + Redis + Jitsi ✅
- [ ] Hébergement : VPS Hostinger (capacité suffisante ?)
- [ ] Jitsi self-hosted : ressources serveur OK ? (RAM, CPU)
- [ ] Chiffrement : clé master sécurisée (KMS)

### **2. Décision Juridique**
- [ ] Consentements RGPD : formulaires validés par juriste ?
- [ ] CGU/CGV : rédigées et conformes ?
- [ ] Politique confidentialité : validée ?
- [ ] Secret médical : procédures conformes (ordre des médecins, CNIL) ?

### **3. Décision Fonctionnelle**
- [ ] RH voit identité praticien ? (recommandé : NON)
- [ ] Niveau anonymisation RH : par employé ou par département ?
- [ ] 2FA obligatoire ? (recommandé : optionnel pour MVP)
- [ ] Langue : FR uniquement ou FR+EN ?

### **4. Décision Business**
- [ ] Modèle paiement praticien validé (hors plateforme) ✅
- [ ] Tarification entreprise : forfait ou par employé ?
- [ ] Entreprise pilote identifiée ? (pour UAT)
- [ ] Objectif 10+ entreprises : délai ? (6 mois, 12 mois ?)

---

## 📞 CONTACTS PROJET

**Sponsor** : HuntZen  
**Email** : [à compléter]  
**Téléphone** : [à compléter]

**AMOA (Prime Synergy Group)** :  
**Email** : [à compléter]  
**Téléphone** : [à compléter]

**Tech Lead** :  
**Email** : [à compléter]  
**Téléphone** : [à compléter]

---

## 📆 PROCHAINES ÉTAPES

### **Semaine 1-2 (Cadrage)**
1. Réunion de lancement (2h)
   - Présentation cahier des charges
   - Q&A équipe
   - Validation planning
2. Setup repos GitHub
3. Setup Figma (Design System)
4. Setup Jira/Trello (backlog)

### **Semaine 3 (Démarrage Sprint 1)**
1. Daily standup (15 min/jour)
2. Développement :
   - Backend : Auth module (Register, Login, JWT)
   - Frontend : Layout + Login page
   - DB : Migrations initiales
3. Démo fin sprint (vendredi)

---

## ✅ CHECKLIST VALIDATION CAHIER DES CHARGES

- [ ] Product Owner a lu et validé `01_CDC_HUNTZEN_CARE_V1.md`
- [ ] Tech Lead a lu et validé section Architecture + DB
- [ ] Dev Backend ont lu `02_SPECIFICATIONS_API_COMPLETE.md`
- [ ] Dev Frontend ont lu section Écrans (CDC)
- [ ] QA a lu critères de recette
- [ ] DevOps a validé infrastructure
- [ ] Juriste a validé conformité RGPD
- [ ] Budget validé (150-200k€)
- [ ] Planning validé (19 semaines)
- [ ] Équipe constituée (7 personnes)

**Si toutes les cases sont cochées : 🚀 GO POUR LE DÉVELOPPEMENT !**

---

## 📚 RESSOURCES COMPLÉMENTAIRES

### **Documentation Technique**
- Next.js : https://nextjs.org/docs
- NestJS : https://docs.nestjs.com/
- Prisma : https://www.prisma.io/docs/
- Jitsi : https://jitsi.github.io/handbook/docs/intro

### **Conformité**
- RGPD : https://www.cnil.fr/
- Secret médical : https://www.conseil-national.medecin.fr/
- HDS (Hébergement Données Santé) : https://esante.gouv.fr/

### **Outils Recommandés**
- Figma (design) : https://www.figma.com/
- GitHub (code) : https://github.com/
- Jira (gestion projet) : https://www.atlassian.com/software/jira
- Sentry (monitoring erreurs) : https://sentry.io/
- Grafana (monitoring infra) : https://grafana.com/

---

## 🎉 MESSAGE FINAL

**Cette documentation constitue une base solide et complète pour développer HuntZen Care de A à Z.**

**Tout est documenté** :
- ✅ Vision produit claire
- ✅ Architecture validée
- ✅ API spécifiée (100+ endpoints)
- ✅ Base de données définie (18 tables)
- ✅ Planning détaillé (19 semaines)
- ✅ Critères de recette (10 tests)
- ✅ Risques identifiés + mitigation

**L'équipe de développement a maintenant tout ce qu'il faut pour démarrer sereinement !** 🚀

**Bonne chance et excellent développement !** 💙

---

**Version** : 1.0  
**Date de publication** : Janvier 2025  
**Rédigé par** : Prime Synergy Group (AMOA)  
**Pour** : HuntZen  
**Statut** : ✅ Validé pour développement
