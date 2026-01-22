# 🧠 HuntZen Care - Plateforme SaaS de Santé Mentale en Entreprise

## 📋 Vue d'ensemble

HuntZen Care est une plateforme SaaS complète de **Mental Health as a Service (MHaaS)** permettant aux entreprises d'offrir un accès confidentiel et sécurisé à des professionnels de santé mentale.

## ✨ Fonctionnalités Implémentées (Phase 0 - MVP Frontend)

### 🎨 Design System
- **Palette de couleurs HuntZen** : Bleu apaisant (#4A90E2), turquoise (#5BC0DE), vert succès (#5CB85C)
- **Sidebar Dark Navy** (#2C3E50) - Design professionnel et zen
- **Background clair** (#F5F7FA) - Apaisant et moderne
- **Composants UI** : Basé sur Radix UI + Tailwind CSS v4

### 🧭 Navigation & Layout
- **Sidebar fixe** avec navigation principale
- **TopBar** avec recherche globale et notifications
- **Responsive design** (prêt pour mobile/tablette)
- **7 sections principales** :
  1. Tableau de Bord
  2. Mes Rendez-vous
  3. Trouver un Praticien
  4. Messages
  5. Mon Journal
  6. Actualités Bien-être
  7. Paramètres

### 🏠 Tableau de Bord Employé
- **Vue d'ensemble personnalisée** avec message de bienvenue
- **4 cartes statistiques** :
  - Prochaine séance
  - Messages non lus
  - Entrées journal
  - Progression humeur
- **Liste des rendez-vous à venir** avec détails praticien
- **Actions rapides** (boutons d'accès rapide)
- **Fil d'actualités bien-être**
- **Bannière impact social** (30% des revenus reversés)

### 👨‍⚕️ Recherche de Praticiens
- **Filtres avancés** :
  - Recherche par nom
  - Spécialité
  - Ville
- **Cartes praticiens** avec :
  - Avatar
  - Rating et nombre d'avis
  - Années d'expérience
  - Langues parlées
  - Types de consultation (Visio, Téléphone, Présentiel)
  - Prochaine disponibilité
- **Bouton "Prendre RDV"** direct

### 📅 Mes Rendez-vous
- **Onglets "À venir" / "Passées"**
- **Pour les RDV à venir** :
  - Statut (Confirmé)
  - Date, heure, type de consultation
  - Bouton "Rejoindre" (actif 10min avant)
  - Actions : Message, Reprogrammer, Annuler
- **Pour les RDV passés** :
  - Bouton "Évaluer" si non noté
  - Historique complet
  - Bouton "Reprendre RDV"

### 📓 Mon Journal Personnel
- **Statistiques** : Nombre d'entrées, humeur moyenne, jours consécutifs
- **Sélecteur d'humeur visuel** (5 niveaux avec emoji)
- **Éditeur de notes** :
  - Titre optionnel
  - Contenu libre
  - Tags personnalisés
- **Affichage chronologique** des entrées
- **Notice de confidentialité** : Chiffrement strict
- **Actions** : Modifier, Supprimer

### 💬 Messages
- **Interface de chat moderne** :
  - Liste des conversations avec statut en ligne
  - Messages non lus (badges)
  - Zone de conversation en temps réel
  - Indicateur "Chiffrement de bout en bout"
- **Fonctionnalités** :
  - Recherche dans les conversations
  - Pièces jointes (icône)
  - Timestamps

### 📰 Actualités Bien-être
- **Article mis en avant** (Featured) avec grande image
- **Grille d'articles** (responsive)
- **Catégories** :
  - Tout
  - Santé Mentale
  - Bien-être
  - Mes favoris
- **Système de bookmarks** (favoris)
- **Infos par article** :
  - Temps de lecture
  - Catégorie
  - Date de publication
  - Auteur

### 🚨 Module d'Urgence (Non négociable)
- **Bouton rouge toujours visible** dans la sidebar
- **Modal d'urgence** avec :
  - Message rassurant
  - Liste de numéros d'urgence :
    - SAMU (15)
    - 112 (Urgences Europe)
    - SOS Amitié
    - 3114 (Prévention Suicide)
    - Urgences Psychiatriques
  - Boutons "Appeler" direct
  - Lien vers chat SOS Amitié
  - Message de soutien

## 🛠️ Stack Technique

### Frontend
- **React 18.3.1** + **TypeScript**
- **Vite** (build tool ultra-rapide)
- **Tailwind CSS v4** (design system)
- **Radix UI** (composants accessibles)
- **Lucide React** (icônes)
- **Motion** (animations)

### Composants UI Disponibles
✅ Button, Card, Input, Textarea  
✅ Select, Tabs, Dialog, Modal  
✅ Avatar, Badge, Tooltip  
✅ Accordion, Alert, Progress  
✅ Calendar, Popover, Scroll Area  

## 📁 Structure du Projet

```
/src
  /app
    /components
      /layout
        - Sidebar.tsx          # Navigation principale
        - TopBar.tsx           # Barre supérieure
        - EmergencyModal.tsx   # Modal d'urgence
      /employee
        - EmployeeDashboard.tsx    # Dashboard principal
        - FindPractitioner.tsx     # Recherche praticiens
        - MyAppointments.tsx       # Gestion RDV
        - MyJournal.tsx            # Journal personnel
        - Messages.tsx             # Chat sécurisé
        - News.tsx                 # Actualités bien-être
      /ui
        - (tous les composants Radix UI)
    - App.tsx                  # Point d'entrée principal
  /styles
    - theme.css                # Variables CSS HuntZen
    - tailwind.css
    - index.css
```

## 🎨 Palette de Couleurs

```css
--primary: #4A90E2      /* Bleu HuntZen */
--secondary: #5BC0DE    /* Turquoise/Cyan */
--success: #5CB85C      /* Vert succès */
--warning: #F39C12      /* Orange attention */
--destructive: #E74C3C  /* Rouge erreur */
--background: #F5F7FA   /* Fond clair */
--sidebar: #2C3E50      /* Navy sidebar */
```

## 🚀 Prochaines Étapes (Phases suivantes)

### Phase 1 : Backend & Authentification
- [ ] Connection Supabase
- [ ] Système d'authentification multi-rôles (5 rôles)
- [ ] Tables PostgreSQL + RLS
- [ ] Chiffrement données sensibles

### Phase 2 : Fonctionnalités Backend
- [ ] API REST avec NestJS
- [ ] Système de réservation en temps réel
- [ ] Intégration Jitsi (visioconférence)
- [ ] Chat en temps réel (Socket.io)
- [ ] Notifications (email + push)

### Phase 3 : Dashboards autres rôles
- [ ] Dashboard Admin HuntZen
- [ ] Dashboard Admin RH (données anonymisées)
- [ ] Dashboard Praticien
- [ ] Dashboard Super Admin (Prime Synergy)

### Phase 4 : Sécurité & Conformité
- [ ] Chiffrement AES-256-GCM
- [ ] RGPD complet
- [ ] Audit logs
- [ ] Plan de Reprise d'Activité (PRA)
- [ ] Certification HDS

## 📊 KPIs Objectifs

- ⬇️ **Absentéisme** : -30% à -40%
- ⬆️ **Engagement** : +25%
- ⬆️ **Productivité** : +20%
- 💙 **Impact social** : 30% des revenus reversés

## 🔐 Principes de Sécurité

1. **Confidentialité absolue** : RH n'a JAMAIS accès aux données médicales
2. **Chiffrement de bout en bout** : Notes, messages, journal
3. **Anonymisation RH** : Seuil minimum 10 employés pour stats
4. **Secret médical** : Respect strict du cadre légal
5. **RGPD compliant** : Droit à l'oubli, export données

## 🎯 Personas Utilisateurs

### Marc (Employé)
- Age : 32 ans
- Poste : Chef de projet
- Besoin : Gérer stress au travail
- Parcours implémenté : ✅ Complet

### Dr. Sophie Martin (Praticienne)
- Spécialité : Psychologue clinicienne
- Dashboard : 🚧 À implémenter (Phase 3)

### Claire (Admin RH)
- Entreprise : 250 employés
- Dashboard : 🚧 À implémenter (Phase 3)

## 📞 Support & Contact

- **Email support** : support@huntzen.com
- **Documentation** : En cours de rédaction
- **Urgences** : Bouton rouge dans l'app

## 🌟 Impact Social

**30% des revenus** sont reversés à des associations de santé mentale :
- SOS Amitié
- Fondation Pierre Deniker
- Psycom
- Union Nationale de Familles et Amis de personnes malades

---

**Version** : 0.1.0 (Phase 0 - MVP Frontend)  
**Dernière mise à jour** : Janvier 2025  
**Développé par** : Prime Synergy Group  
**Pour** : HuntZen Care
