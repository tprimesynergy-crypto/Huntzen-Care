# 🎨 HUNTZEN CARE - GUIDE COMPLET D'UTILISATION

## ✅ **FICHIERS CRÉÉS**

### **1. Design System** ✨
- ✅ `styles/globals.css` - Design system complet (couleurs, composants, animations)
- ✅ `tailwind.config.js` - Configuration Tailwind avec thème custom

### **2. Layouts** 📐
- ✅ `components/layout/EmployeeLayout.tsx` - Layout employé avec sidebar responsive

### **3. Pages** 📄
- ✅ `app/employee/page.tsx` - Dashboard employé complet et fonctionnel

---

## 🎯 **CARACTÉRISTIQUES IMPLÉMENTÉES**

### **Design System** 🎨

#### **Couleurs**
```css
--primary: Indigo (#4F46E5) - Principal
--secondary: Emerald (#10B981) - Secondaire
--accent: Amber (#F59E0B) - Accent
--success: Green - Succès
--error: Red - Erreur
```

#### **Composants UI**
- ✅ Boutons (primary, secondary, outline, ghost)
- ✅ Cards (avec hover effects)
- ✅ Inputs (avec validation)
- ✅ Badges (statuts)
- ✅ Alerts (success, warning, error, info)
- ✅ Modals (avec overlay animé)
- ✅ Dropdowns (avec animations)

#### **Animations**
- ✅ Slide (right, left, top, bottom)
- ✅ Fade in
- ✅ Zoom in
- ✅ Pulse
- ✅ Bounce
- ✅ Hover lift

### **Layout Employé** 📱

#### **Sidebar**
- ✅ Logo HuntZen
- ✅ Navigation (Dashboard, RDV, Séances, Journal, Chat, Ressources)
- ✅ Profil utilisateur
- ✅ Paramètres
- ✅ Déconnexion
- ✅ **Responsive** (mobile menu avec overlay)

#### **Topbar**
- ✅ Bouton menu mobile
- ✅ Barre de recherche (desktop)
- ✅ **Notifications avec dropdown**
- ✅ Bouton urgence
- ✅ **Adaptation automatique mobile/desktop**

#### **Notifications**
- ✅ Badge compteur (non lues)
- ✅ Dropdown animé
- ✅ Liste notifications
- ✅ Statut lu/non lu
- ✅ Bouton "Tout marquer comme lu"

### **Dashboard Employé** 🏠

#### **Header Zen**
- ✅ Message personnalisé ("Bonjour Marc 👋")
- ✅ **Mood selector** (Comment vous sentez-vous ?)
- ✅ Gradient zen
- ✅ Effets visuels (blur circles)

#### **Stats Cards**
- ✅ Consultations ce mois
- ✅ Temps total
- ✅ Articles lus
- ✅ Prochain RDV
- ✅ **Icons colorées**
- ✅ **Hover effects**

#### **Prochain RDV**
- ✅ Carte praticien avec avatar
- ✅ Badge statut (confirmé)
- ✅ Date et heure
- ✅ Type consultation (vidéo)
- ✅ **Boutons actions** (Rejoindre, Replanifier)

#### **Actions Rapides**
- ✅ 4 boutons colorés
- ✅ Icons (Calendar, Video, Book, Heart)
- ✅ Hover effects
- ✅ **Responsive grid**

#### **Ressources**
- ✅ 3 cartes articles
- ✅ Images Unsplash
- ✅ Badges catégories
- ✅ Durée lecture
- ✅ **Hover scale effect**

#### **Sidebar Activité**
- ✅ 3 séances ce mois
- ✅ 5 entrées journal
- ✅ 8 articles lus
- ✅ Icons colorées
- ✅ Backgrounds distincts

#### **Carte Urgence**
- ✅ Design rouge/orange
- ✅ Icon 🆘
- ✅ Bouton "Appeler maintenant"
- ✅ Numéro urgence (3114)

---

## 📱 **RESPONSIVE DESIGN**

### **Breakpoints**
```css
Mobile   : 320px - 640px
Tablet   : 768px - 1024px
Desktop  : 1280px - 1920px
Large    : 2560px+
```

### **Adaptation Automatique**

#### **Sidebar**
- **Mobile** : Cachée par défaut, overlay au clic menu
- **Desktop** : Toujours visible (64px = 256px)

#### **Topbar**
- **Mobile** : Bouton menu + notifications + urgence
- **Desktop** : + Barre de recherche

#### **Stats Grid**
- **Mobile** : 1 colonne
- **Tablet** : 2 colonnes
- **Desktop** : 4 colonnes

#### **Actions Rapides**
- **Mobile** : 2 colonnes
- **Desktop** : 4 colonnes

#### **Ressources**
- **Mobile** : 1 colonne
- **Tablet** : 2 colonnes
- **Desktop** : 3 colonnes

---

## 🎨 **COMMENT UTILISER LES COMPOSANTS**

### **Boutons**
```tsx
<button className="btn-primary">
  Primary Button
</button>

<button className="btn-secondary">
  Secondary Button
</button>

<button className="btn-outline">
  Outline Button
</button>

<button className="btn-ghost">
  Ghost Button
</button>

// Tailles
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary">Default</button>
<button className="btn-primary btn-lg">Large</button>
```

### **Cards**
```tsx
<div className="card">
  <div className="card-header">
    <h2>Titre</h2>
  </div>
  <div className="card-body">
    Contenu
  </div>
  <div className="card-footer">
    Actions
  </div>
</div>

// Avec hover
<div className="card card-hover">
  ...
</div>
```

### **Inputs**
```tsx
<div>
  <label className="label">Email</label>
  <input
    type="email"
    className="input"
    placeholder="votre@email.com"
  />
</div>

// Avec icon
<div className="input-group">
  <div className="input-icon">
    <Icon />
  </div>
  <input className="input input-with-icon" />
</div>

// Erreur
<input className="input input-error" />
<p className="text-sm text-error mt-1">Message erreur</p>
```

### **Badges**
```tsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-error">Error</span>
```

### **Alerts**
```tsx
<div className="alert alert-success">
  Opération réussie !
</div>

<div className="alert alert-error">
  Une erreur est survenue.
</div>
```

---

## 🚀 **PROCHAINES ÉTAPES**

### **Layouts à créer** (même structure)
- ✅ EmployeeLayout
- ⏳ PractitionerLayout (avec compteurs)
- ⏳ RHLayout (avec analytics)
- ⏳ AdminLayout (avec gouvernance)
- ⏳ SuperAdminLayout (avec monitoring)

### **Pages à créer**

#### **Employé**
- ⏳ `/employee/find-practitioner` - Recherche praticiens
- ⏳ `/employee/appointments` - Liste RDV
- ⏳ `/employee/sessions/[id]` - Salle Jitsi + Chat
- ⏳ `/employee/journal` - Journal intime
- ⏳ `/employee/chat` - Chat
- ⏳ `/employee/resources` - Blog

#### **Praticien**
- ⏳ `/practitioner/dashboard` - Dashboard avec compteurs
- ⏳ `/practitioner/agenda` - Calendrier
- ⏳ `/practitioner/consultations` - Liste consultations
- ⏳ `/practitioner/sessions/[id]` - Salle + Chat
- ⏳ `/practitioner/notes/[id]` - Notes cliniques
- ⏳ `/practitioner/usage` - Compteurs + Export CSV

#### **RH**
- ⏳ `/rh/dashboard` - KPIs anonymisés
- ⏳ `/rh/employees` - Gestion employés
- ⏳ `/rh/import` - Import CSV
- ⏳ `/rh/metrics` - Métriques usage

#### **Admin**
- ⏳ `/admin/dashboard` - Gouvernance
- ⏳ `/admin/companies` - Entreprises
- ⏳ `/admin/practitioners` - Praticiens

#### **Super Admin**
- ⏳ `/super-admin/monitoring` - Monitoring
- ⏳ `/super-admin/logs` - Logs sécurité

### **Composants fonctionnels à créer**
- ⏳ JitsiRoom - Intégration Jitsi
- ⏳ ChatPanel - Chat temps réel
- ⏳ Calendar - Calendrier interactif
- ⏳ FileUpload - Upload fichiers
- ⏳ NotificationToast - Toast notifications
- ⏳ SearchBar - Recherche avancée
- ⏳ DataTable - Tableaux de données
- ⏳ Charts - Graphiques (Recharts)

---

## 💡 **ASTUCES DESIGN**

### **Couleurs par Rôle**
```
Employé     : Indigo (zen, calme)
Praticien   : Emerald (santé, croissance)
RH          : Amber (analytique, attention)
Admin       : Blue (gouvernance, confiance)
Super Admin : Purple (technique, pouvoir)
```

### **Icons**
```tsx
import { Icon } from 'lucide-react';

// Taille
<Icon className="w-4 h-4" />  // Small
<Icon className="w-5 h-5" />  // Default
<Icon className="w-6 h-6" />  // Large

// Couleur
<Icon className="text-primary" />
<Icon className="text-success" />
<Icon className="text-error" />
```

### **Animations**
```tsx
// Fade in
<div className="animate-fade-in">...</div>

// Slide
<div className="animate-slide-in-right">...</div>

// Zoom
<div className="animate-zoom-in">...</div>

// Hover lift
<div className="hover-lift">...</div>
```

### **Responsive**
```tsx
// Mobile hidden
<div className="hidden md:block">Desktop only</div>

// Mobile visible
<div className="block md:hidden">Mobile only</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  ...
</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Title
</h1>
```

---

## 🔥 **FEATURES AWARD-WINNING**

### **Déjà implémentées** ✅
- ✅ Design system complet
- ✅ Responsive parfait
- ✅ Animations fluides
- ✅ Sidebar mobile avec overlay
- ✅ Notifications dropdown
- ✅ Mood selector
- ✅ Stats cards animées
- ✅ Hover effects partout
- ✅ Skeleton loading (CSS ready)
- ✅ Gradient backgrounds
- ✅ Glass effects
- ✅ Focus states accessibles

### **À venir** ⏳
- ⏳ Jitsi integration
- ⏳ Socket.IO chat
- ⏳ Calendar interactif
- ⏳ Upload fichiers
- ⏳ Export CSV
- ⏳ Dark mode
- ⏳ PWA (Progressive Web App)
- ⏳ Offline mode

---

## 📦 **INSTALLATION**

```bash
# 1. Installer dépendances
pnpm install

# 2. Copier .env
cp .env.example .env.local

# 3. Démarrer
pnpm dev
```

### **Dépendances requises**
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10"
  }
}
```

---

## 🎯 **PROCHAINE ÉTAPE**

**Je vais maintenant créer :**
1. **PractitionerLayout** avec sidebar spécifique
2. **PractitionerDashboard** avec compteurs temps réel
3. **Calendrier interactif**
4. **Salle Jitsi** fonctionnelle
5. **Chat temps réel**

**Voulez-vous que je continue ?** 🚀
