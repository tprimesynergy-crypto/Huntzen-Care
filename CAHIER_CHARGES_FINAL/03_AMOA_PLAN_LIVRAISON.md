# 📊 AMOA + PLAN DE LIVRAISON - HUNTZEN CARE

## 🎯 1. GOUVERNANCE PROJET

### **Parties Prenantes**

**Sponsor** : HuntZen (Porteur du projet)

**MOA (Maîtrise d'Ouvrage)** : HuntZen
- Décisions produit
- Validation fonctionnelle
- Budget & planning

**AMOA (Assistance MOA)** : Prime Synergy Group
- Cadrage besoin
- Backlog & priorisation
- Recette fonctionnelle
- Risques & conformité
- Documentation

**MOE (Maîtrise d'Œuvre)** : Équipe Dev PSG
- Architecture technique
- Développement
- Tests techniques
- Déploiement

---

### **Comité Projet**

**Fréquence** : Hebdomadaire (1h)

**Participants** :
- Product Owner (HuntZen)
- AMOA (PSG)
- Tech Lead (PSG)
- Lead Frontend (PSG)
- Lead Backend (PSG)

**Ordre du jour** :
1. Avancement sprint (burndown)
2. Risques & blocages
3. Décisions produit (arbitrages)
4. Validation User Stories
5. Planning prochain sprint

---

## 📋 2. LIVRABLES AMOA

### **Phase Cadrage (Semaine 1-2)**

#### **Livrable 1 : Vision & Périmètre**
- ✅ Document vision produit
- ✅ Principes non négociables
- ✅ Rôles (RBAC) détaillés
- ✅ Modules fonctionnels
- ✅ Écrans par rôle
- **Format** : Document Word + PDF
- **Validation** : Sponsor HuntZen

#### **Livrable 2 : Architecture Technique**
- ✅ Stack technique validée
- ✅ Schéma architecture (diagrammes)
- ✅ Base de données (ERD + DDL)
- ✅ Conventions (IDs, slugs, routes)
- ✅ Sécurité & performance
- **Format** : Document technique + Diagrams
- **Validation** : Tech Lead + MOA

#### **Livrable 3 : Spécifications API**
- ✅ Contrats REST (100+ endpoints)
- ✅ WebSocket events
- ✅ Authentification & RBAC
- ✅ Exemples requêtes/réponses
- **Format** : OpenAPI/Swagger + PDF
- **Validation** : Tech Lead + MOA

---

### **Phase Conception (Semaine 3-4)**

#### **Livrable 4 : Backlog Produit**
- ✅ User Stories (80+ US)
- ✅ Critères d'acceptation
- ✅ Priorités (MoSCoW)
- ✅ Estimation (story points)
- ✅ Dépendances
- **Format** : Excel + Jira/Trello
- **Validation** : MOA + AMOA

#### **Livrable 5 : Wireframes & Design System**
- ✅ Wireframes basse fidélité (40+ écrans)
- ✅ Design System Figma :
  - Tokens (couleurs, typo, spacing)
  - Composants (Button, Card, Input, etc.)
  - Layout (sidebar, topbar, grids)
- ✅ Prototype interactif (parcours clés)
- **Format** : Figma + PDF
- **Validation** : MOA

#### **Livrable 6 : Plan de Tests**
- ✅ Tests unitaires (Jest)
- ✅ Tests intégration (Supertest)
- ✅ Tests E2E (Playwright)
- ✅ Tests sécurité (OWASP)
- ✅ Tests charge (k6)
- **Format** : Document Excel
- **Validation** : Tech Lead

---

### **Phase Développement (Semaine 5-16)**

#### **Livrable 7 : Code Source**
- ✅ Frontend Next.js (repo GitHub)
- ✅ Backend NestJS (repo GitHub)
- ✅ CI/CD (GitHub Actions)
- ✅ Documentation code (JSDoc, TSDoc)
- **Format** : GitHub repos
- **Validation** : Pull Requests

#### **Livrable 8 : Documentation Technique**
- ✅ README (installation, déploiement)
- ✅ API Reference (Swagger/Redoc)
- ✅ Architecture Decision Records (ADR)
- ✅ Troubleshooting
- **Format** : Markdown + GitBook
- **Validation** : Tech Lead

---

### **Phase Recette (Semaine 17-18)**

#### **Livrable 9 : Plan de Recette**
- ✅ Scénarios de test (par US)
- ✅ Jeux de données
- ✅ Grille de recette (pass/fail)
- **Format** : Excel + Jira
- **Validation** : AMOA + MOA

#### **Livrable 10 : PV de Recette**
- ✅ Résultats tests (OK/KO)
- ✅ Anomalies détectées
- ✅ Plan de correction
- ✅ Validation fonctionnelle
- **Format** : PDF signé
- **Validation** : MOA (acceptation formelle)

---

### **Phase Déploiement (Semaine 19)**

#### **Livrable 11 : Plan d'Exploitation**
- ✅ Procédures déploiement
- ✅ Monitoring (dashboards Grafana)
- ✅ Backups automatisés
- ✅ PRA (Plan Reprise Activité)
- ✅ Procédures incidents
- **Format** : Document Word + Runbooks
- **Validation** : Super Admin (PSG)

#### **Livrable 12 : Formation**
- ✅ Manuel utilisateur (par rôle)
- ✅ Vidéos tutoriels (5-10 min)
- ✅ FAQ
- ✅ Support chat
- **Format** : PDF + Vidéos + Intercom
- **Validation** : MOA

---

### **Phase Conformité (Transverse)**

#### **Livrable 13 : Dossier RGPD**
- ✅ Registre traitements
- ✅ DPIA (si nécessaire)
- ✅ Politique confidentialité
- ✅ CGU/CGV
- ✅ Procédures droits utilisateurs
- **Format** : Document Word + PDF
- **Validation** : Juriste + AMOA

#### **Livrable 14 : Dossier Sécurité**
- ✅ Analyse risques (EBIOS, ISO 27001)
- ✅ Tests intrusion (pentest)
- ✅ Chiffrement E2E (preuves)
- ✅ Audit code (OWASP)
- ✅ Certifications (HDS si santé)
- **Format** : Document technique + Rapports audits
- **Validation** : RSSI

---

## 🗓️ 3. PHASAGE & PLANNING

### **Phase 0 : Cadrage (2 semaines)**
**Objectif** : Valider vision + architecture

**Livrables** :
- Vision & Périmètre
- Architecture Technique
- Spécifications API

**Jalons** :
- J+7 : Validation Vision (Comité)
- J+14 : Validation Architecture (Comité)

---

### **Phase 1 : MVP "Usage Réel" (8 semaines)**

**Objectif** : Livrer un produit utilisable pour 1 entreprise pilote

#### **Sprint 1 (Semaine 1-2) : Fondations**

**US à développer** :
- US-1.1 : Auth (Register, Login, Logout)
- US-1.2 : RBAC (5 rôles)
- US-1.3 : JWT + Refresh tokens
- US-1.4 : Reset password
- US-2.1 : CRUD Companies
- US-2.2 : CRUD Employees

**Livrables** :
- Backend : Auth module + Companies module
- Frontend : Login + Dashboard vide (par rôle)
- DB : Tables users, roles, companies

**Démo** : Login fonctionne + routing par rôle

---

#### **Sprint 2 (Semaine 3-4) : Praticiens & Booking**

**US à développer** :
- US-3.1 : CRUD Practitioners
- US-3.2 : Validation praticiens (Admin HuntZen)
- US-3.3 : Gestion disponibilités (récurrent + exceptions)
- US-4.1 : Recherche praticiens (filtres)
- US-4.2 : Création RDV (booking)

**Livrables** :
- Backend : Practitioners module + Booking module
- Frontend : Recherche praticiens + Booking
- DB : Tables practitioner_profiles, availability_slots, consultations

**Démo** : Employé peut chercher praticien + réserver RDV

---

#### **Sprint 3 (Semaine 5-6) : Consultations + Jitsi**

**US à développer** :
- US-5.1 : Liste RDV (employé + praticien)
- US-5.2 : Annulation RDV
- US-5.3 : Start/End consultation (horodatage)
- US-5.4 : Jitsi room (génération JWT + iframe)
- US-5.5 : Calcul durée automatique (trigger DB)

**Livrables** :
- Backend : Jitsi service + Consultation lifecycle
- Frontend : Liste RDV + Salle Jitsi
- Infra : Docker-jitsi-meet (dev)

**Démo** : Consultation vidéo fonctionne + durée calculée

---

#### **Sprint 4 (Semaine 7-8) : Compteurs (CŒUR DU BESOIN)**

**US à développer** :
- US-6.1 : Compteurs praticien (agrégation daily)
- US-6.2 : Export CSV praticien
- US-6.3 : Compteurs employé (anonymisé RH)
- US-6.4 : Compteurs entreprise (dashboard RH)
- US-6.5 : Job CRON (alimentation compteurs)

**Livrables** :
- Backend : Metrics module + CRON job
- Frontend : Dashboard praticien + Dashboard RH
- DB : Tables practitioner_activity_daily, employee_activity_daily

**Démo** : 
- Praticien voit compteur activité + export CSV
- RH voit usage employés (anonymisé)

---

**🎯 Fin MVP (Semaine 8) : Recette Interne**

**Critères de validation** :
- ✅ Employé peut réserver + faire consultation vidéo
- ✅ Praticien peut gérer agenda + consultations + voir compteur
- ✅ RH peut activer employés + voir usage (anonymisé)
- ✅ Admin HuntZen peut valider entreprises/praticiens
- ✅ Compteurs fiables (nombre + durée)
- ✅ Export CSV praticien fonctionnel
- ✅ Secret médical respecté (RH ne voit pas contenu)

---

### **Phase 2 : Sécurité Avancée (4 semaines)**

#### **Sprint 5 (Semaine 9-10) : Chiffrement & Chat**

**US à développer** :
- US-7.1 : Chiffrement AES-256-GCM (service)
- US-7.2 : Notes cliniques (chiffrées)
- US-7.3 : Journal employé (chiffré)
- US-7.4 : Chat temps réel (WebSocket)
- US-7.5 : Messages chiffrés (E2E)

**Livrables** :
- Backend : Encryption service + Chat Gateway
- Frontend : Chat sidebar + Journal
- DB : Tables clinical_notes, employee_journals, chat_messages

**Démo** : Chat fonctionne + notes/journal chiffrés

---

#### **Sprint 6 (Semaine 11-12) : RLS & Audit**

**US à développer** :
- US-8.1 : RLS PostgreSQL (activation + policies)
- US-8.2 : Audit logs (actions sensibles)
- US-8.3 : Rate limiting (brute force)
- US-8.4 : Tests sécurité (OWASP)

**Livrables** :
- DB : RLS activé (notes, journals, messages)
- Backend : Audit module + Rate limiting
- Tests : Pentest basique

**Démo** : 
- RLS empêche accès non autorisé
- Audit logs enregistrés
- Rate limiting fonctionne

---

**🔒 Fin Phase Sécurité (Semaine 12) : Audit Sécurité**

**Critères de validation** :
- ✅ Chiffrement E2E validé (notes + journal + messages)
- ✅ RLS testé (employé A ne voit pas données employé B)
- ✅ Audit logs complets
- ✅ Rate limiting actif
- ✅ Tests OWASP passés (Top 10)

---

### **Phase 3 : Contenus & Polish (4 semaines)**

#### **Sprint 7 (Semaine 13-14) : Blog & News**

**US à développer** :
- US-9.1 : CRUD Articles (Admin HuntZen)
- US-9.2 : SEO (meta, slugs, sitemap)
- US-9.3 : News internes (RH)
- US-9.4 : Notifications in-app

**Livrables** :
- Backend : Content module + Notifications
- Frontend : Blog + News + Notifications dropdown
- DB : Tables articles, notifications

**Démo** : Blog publié + News internes + Notifications

---

#### **Sprint 8 (Semaine 15-16) : UX Polish & Performance**

**US à développer** :
- US-10.1 : Skeletons (loading states)
- US-10.2 : Pagination optimisée
- US-10.3 : Caching Next.js (ISR)
- US-10.4 : Monitoring (Grafana)

**Livrables** :
- Frontend : UX améliorée (skeletons, animations)
- Backend : Monitoring Prometheus + Grafana
- Performance : Lighthouse > 90

**Démo** : Interface fluide + monitoring opérationnel

---

**✨ Fin Phase Contenus (Semaine 16) : UAT (User Acceptance Testing)**

**Critères de validation** :
- ✅ Blog fonctionnel + SEO
- ✅ News internes publiées
- ✅ Notifications temps réel
- ✅ Performance optimisée
- ✅ Monitoring actif

---

### **Phase 4 : Déploiement & Formation (2 semaines)**

#### **Sprint 9 (Semaine 17-18) : Déploiement Production**

**Tâches** :
- Configuration VPS (Hostinger)
- Docker-compose production
- Nginx reverse proxy + SSL
- PostgreSQL production (backups)
- Redis production
- Jitsi production
- CI/CD GitHub Actions
- Monitoring (Grafana + Sentry)

**Livrables** :
- Infra production opérationnelle
- CI/CD actif
- Backups automatisés
- Documentation exploitation

---

#### **Sprint 10 (Semaine 19) : Formation & Go-Live**

**Tâches** :
- Formation utilisateurs (vidéos)
- Manuel utilisateur (PDF)
- FAQ
- Support chat (Intercom)
- Onboarding entreprise pilote
- Go-Live 🚀

**Livrables** :
- Manuels utilisateurs (par rôle)
- Vidéos tutoriels (10 vidéos)
- FAQ (50 questions)
- Support opérationnel

---

**🎉 Go-Live (Fin Semaine 19)**

---

## 📊 4. BACKLOG PRODUIT (PRIORISATION)

### **Méthode MoSCoW**

**Must Have (MVP)** :
- Auth + RBAC
- Multi-tenant
- Entreprises + Employés
- Praticiens + Disponibilités
- Booking + Consultations
- Jitsi (vidéo)
- Compteurs (praticien + employé)
- Export CSV praticien

**Should Have (Phase 2)** :
- Chiffrement E2E (notes + journal + chat)
- Chat temps réel
- RLS PostgreSQL
- Audit logs
- Rate limiting

**Could Have (Phase 3)** :
- Blog global
- News internes
- Notifications in-app
- Monitoring avancé

**Won't Have (V2)** :
- 2FA (optionnel V1)
- Appels audio (WebRTC)
- Avis praticiens
- Paiement in-app (jamais)

---

## ✅ 5. CRITÈRES DE RECETTE

### **Critère 1 : Secret Médical**

**Scénario** :
1. Connexion en tant qu'Admin RH
2. Aller sur "Usage employés"
3. Cliquer sur un employé
4. **Vérifier** :
   - ✅ On voit : nombre consultations + durée totale
   - ❌ On NE voit PAS : notes, messages, praticien, motif

**Résultat attendu** : ✅ Pass (RH ne peut pas accéder au contenu médical)

---

### **Critère 2 : Compteur Praticien**

**Scénario** :
1. Praticien fait 3 consultations :
   - Consultation 1 : start 14:00, end 14:50 (50 min)
   - Consultation 2 : start 15:00, end 15:48 (48 min)
   - Consultation 3 : start 16:00, end 16:55 (55 min)
2. Aller sur Dashboard Praticien
3. **Vérifier** :
   - Consultations ce mois : 3
   - Durée totale : 153 min (2h33)
   - Durée moyenne : 51 min

**Résultat attendu** : ✅ Pass (compteurs exacts)

---

### **Critère 3 : Calcul Durée Automatique**

**Scénario** :
1. Praticien démarre consultation (POST /consultations/:id/start)
2. `started_at` enregistré : 2025-01-22T14:02:00Z
3. Praticien termine consultation (POST /consultations/:id/end)
4. `ended_at` enregistré : 2025-01-22T14:52:00Z
5. **Vérifier** :
   - `duration_seconds` = 3000 (50 min)
   - Trigger DB a calculé automatiquement

**Résultat attendu** : ✅ Pass (durée calculée par trigger)

---

### **Critère 4 : Export CSV Praticien**

**Scénario** :
1. Connexion praticien
2. Aller sur Dashboard → "Exporter activité"
3. Sélection période : 2025-01
4. Cliquer "Exporter CSV"
5. **Vérifier fichier CSV** :
   - Header : Date, Entreprise, Durée (min), Statut
   - Lignes : Toutes consultations de janvier
   - Total : Nb consultations + Durée totale
   - ❌ PAS de : nom employé, motif, notes

**Résultat attendu** : ✅ Pass (CSV valide pour paiement)

---

### **Critère 5 : Chiffrement E2E**

**Scénario** :
1. Praticien crée note clinique : "Patient présente..."
2. Vérifier en DB :
   - `content_encrypted` : texte chiffré (illisible)
   - `iv` : présent (32 caractères hex)
   - `auth_tag` : présent (32 caractères hex)
3. Récupérer note via API GET /clinical-notes/:id
4. **Vérifier** :
   - `content` : texte déchiffré "Patient présente..."

**Résultat attendu** : ✅ Pass (chiffrement/déchiffrement OK)

---

### **Critère 6 : RLS PostgreSQL**

**Scénario** :
1. Employé A (id: uuid-A) se connecte
2. Créer entrée journal : "Aujourd'hui..."
3. Employé B (id: uuid-B) se connecte
4. Tenter GET /journal (devrait retourner uniquement journal de B)
5. Tenter GET /journal/:id-A (devrait retourner 403 Forbidden)

**Résultat attendu** : ✅ Pass (RLS empêche accès inter-employés)

---

### **Critère 7 : Jitsi Room**

**Scénario** :
1. Employé réserve consultation vidéo
2. 10 min avant heure prévue, bouton "Rejoindre" actif
3. Cliquer "Rejoindre"
4. POST /jitsi/token → retourne JWT + roomName
5. iFrame Jitsi charge avec JWT
6. **Vérifier** :
   - Vidéo/audio fonctionnels
   - Praticien = modérateur (peut mute/kick)
   - Employé = participant

**Résultat attendu** : ✅ Pass (Jitsi opérationnel)

---

### **Critère 8 : Chat Temps Réel**

**Scénario** :
1. Employé et Praticien dans même consultation
2. Employé envoie message : "Bonjour"
3. **Vérifier côté Praticien** :
   - Message reçu immédiatement (WebSocket)
   - Affiché dans chat
4. Praticien répond : "Bonjour Marc"
5. **Vérifier côté Employé** :
   - Message reçu immédiatement

**Résultat attendu** : ✅ Pass (Chat temps réel OK)

---

### **Critère 9 : Rate Limiting**

**Scénario** :
1. Tenter login avec mauvais password 6 fois de suite
2. **Vérifier** :
   - Tentatives 1-5 : 401 Unauthorized
   - Tentative 6 : 429 Too Many Requests
   - Message : "Trop de tentatives, réessayez dans 15 min"
3. Attendre 15 min
4. Retenter login avec bon password
5. **Vérifier** : ✅ Login réussi

**Résultat attendu** : ✅ Pass (Rate limiting actif)

---

### **Critère 10 : Audit Logs**

**Scénario** :
1. Admin HuntZen valide un praticien
2. Aller sur /super-admin/audit-logs
3. **Vérifier présence log** :
   - Action : PRACTITIONER_APPROVED
   - Actor : Admin HuntZen (userId)
   - Entity : practitioner (practitionerId)
   - Timestamp : date/heure
   - IP : adresse IP

**Résultat attendu** : ✅ Pass (Audit log enregistré)

---

## 🚨 6. RISQUES & MITIGATION

### **Risque 1 : RH tente d'accéder au contenu médical**

**Probabilité** : Moyenne  
**Impact** : Critique (violation secret médical)

**Mitigation** :
- RLS PostgreSQL (barrière DB)
- Guards NestJS (barrière API)
- Tests automatisés (E2E)
- Audit logs (traçabilité)

**Plan B** : Si violation détectée → alerte Super Admin + suspension compte RH

---

### **Risque 2 : Compteurs incorrects (impact paie praticien)**

**Probabilité** : Faible (si trigger DB bien testé)  
**Impact** : Critique (praticien sous-payé/sur-payé)

**Mitigation** :
- Trigger DB testé unitairement
- Validation manuelle (échantillon)
- Logs détaillés (consultation events)
- Export CSV double-check (praticien peut vérifier)

**Plan B** : Ajout validation praticien (praticien valide ses heures avant export)

---

### **Risque 3 : Jitsi indisponible (consultation impossible)**

**Probabilité** : Faible  
**Impact** : Majeur (blocage service)

**Mitigation** :
- Monitoring uptime Jitsi (alertes)
- Healthcheck toutes les 5 min
- Fallback : appel audio (WebRTC sans Jitsi)

**Plan B** : Si Jitsi down > 30 min → notification employés + report consultations

---

### **Risque 4 : Fuite données chiffrées (clé compromise)**

**Probabilité** : Très faible  
**Impact** : Critique (secret médical)

**Mitigation** :
- Clé chiffrement en KMS (jamais en DB)
- Rotation clé mensuelle
- Accès restreint (Super Admin uniquement)
- Audit accès clé (logs)

**Plan B** : Si fuite détectée → rotation immédiate clé + re-chiffrement données

---

### **Risque 5 : Performance dégradée (trop d'utilisateurs)**

**Probabilité** : Moyenne (si succès produit)  
**Impact** : Majeur (expérience utilisateur)

**Mitigation** :
- Caching Redis (sessions, résultats fréquents)
- Vues matérialisées (compteurs pré-calculés)
- Pagination stricte (max 100 items)
- Tests charge (k6, 1000 users concurrents)

**Plan B** : Scaling horizontal (ajout serveurs NestJS)

---

## 📈 7. MÉTRIQUES DE SUCCÈS

### **KPI Produit (après 3 mois)**

- **Taux d'adoption** : > 60% employés actifs (ont réservé au moins 1 RDV)
- **Satisfaction utilisateurs** : > 4.5/5 (NPS > 50)
- **Taux de complétion RDV** : > 90% (peu d'annulations/no-show)
- **Temps moyen booking** : < 3 min (recherche praticien → confirmation)

---

### **KPI Technique**

- **Uptime API** : > 99.5%
- **Uptime Jitsi** : > 99%
- **Temps réponse API** : < 200ms (P95)
- **Erreurs 5xx** : < 0.1%
- **Performance Lighthouse** : > 90 (Performance, Accessibility, Best Practices, SEO)

---

### **KPI Sécurité**

- **Incidents sécurité** : 0 (violation secret médical)
- **Tentatives intrusion bloquées** : 100% (rate limiting actif)
- **Audits OWASP** : 0 vulnérabilités critiques/hautes
- **Backups réussis** : 100% (quotidien)

---

### **KPI Business**

- **Nb entreprises actives** : 10+ (objectif 6 mois)
- **Nb praticiens actifs** : 50+
- **Nb consultations/mois** : 500+ (50 praticiens × 10 consult/mois)
- **Coût acquisition client (CAC)** : < 500€ / entreprise

---

## ✅ 8. CHECKLIST FINALE AVANT GO-LIVE

### **Fonctionnel**
- [ ] Tous parcours utilisateurs testés (E2E)
- [ ] Grille de recette validée (PV signé)
- [ ] Manuels utilisateurs rédigés
- [ ] Vidéos tutoriels enregistrées
- [ ] FAQ complétée (50+ questions)

### **Technique**
- [ ] Tests OWASP passés (0 vulnérabilités critiques)
- [ ] Tests charge réussis (1000 users concurrents)
- [ ] Performance Lighthouse > 90
- [ ] CI/CD opérationnel (GitHub Actions)
- [ ] Monitoring actif (Grafana + Sentry)

### **Sécurité**
- [ ] Chiffrement E2E validé
- [ ] RLS PostgreSQL activé + testé
- [ ] Audit logs opérationnels
- [ ] Rate limiting actif
- [ ] Clés chiffrement en KMS (jamais en code)

### **Infrastructure**
- [ ] VPS production configuré
- [ ] Docker-compose production testé
- [ ] Nginx + SSL (Let's Encrypt)
- [ ] PostgreSQL backups automatisés (quotidien)
- [ ] Redis réplication (master/slave)
- [ ] Jitsi production opérationnel

### **Conformité**
- [ ] Dossier RGPD complet
- [ ] Politique confidentialité publiée
- [ ] CGU/CGV validées (juriste)
- [ ] Consentements utilisateurs enregistrés
- [ ] Procédures DSAR (droits utilisateurs) testées

### **Support**
- [ ] Support chat configuré (Intercom)
- [ ] Runbooks incidents rédigés
- [ ] Astreinte définie (24/7 si nécessaire)
- [ ] Escalade définie (N1 → N2 → CTO)

---

## 🎉 9. JALONS & VALIDATIONS

**Jalon 1 (Fin Semaine 2)** : Cadrage validé  
→ **Validation** : Comité Projet

**Jalon 2 (Fin Semaine 8)** : MVP livré  
→ **Validation** : Recette interne (AMOA + MOA)

**Jalon 3 (Fin Semaine 12)** : Sécurité validée  
→ **Validation** : Audit sécurité (pentest)

**Jalon 4 (Fin Semaine 16)** : Produit complet  
→ **Validation** : UAT (User Acceptance Testing)

**Jalon 5 (Fin Semaine 19)** : Go-Live 🚀  
→ **Validation** : PV de recette signé + mise en production

---

**FIN DU PLAN AMOA & LIVRAISON**

**Durée totale** : 19 semaines (~4.5 mois)  
**Équipe recommandée** :
- 1 Product Owner
- 1 AMOA
- 1 Tech Lead
- 2 Dev Backend (NestJS)
- 2 Dev Frontend (Next.js)
- 1 DevOps
- 1 QA

**Budget estimé** : 150-200k€ (selon localisation équipe)
