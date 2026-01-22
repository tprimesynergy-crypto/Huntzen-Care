# 🚀 RAPPORT COMPLET POUR CURSOR - HUNTZEN CARE

## 📋 TABLE DES MATIÈRES

1. [Vision & Contexte](#1-vision--contexte)
2. [Architecture Globale](#2-architecture-globale)
3. [Structure Repo Complète](#3-structure-repo-complète)
4. [RBAC Complet (TypeScript)](#4-rbac-complet-typescript)
5. [Base de Données SQL](#5-base-de-données-sql)
6. [API REST (OpenAPI)](#6-api-rest-openapi)
7. [Backend NestJS (Code)](#7-backend-nestjs-code)
8. [Frontend Next.js (Code)](#8-frontend-nextjs-code)
9. [Règles Métier](#9-règles-métier)
10. [Plan de Développement](#10-plan-de-développement)

---

## 1. VISION & CONTEXTE

### **HuntZen Care : MHaaS (Mental Health as a Service)**

**Plateforme SaaS B2B** permettant aux entreprises d'offrir un accès confidentiel et sécurisé à des praticiens de santé mentale.

### **Contraintes Non Négociables** ⚠️

#### **1. Secret Médical Absolu**
- ❌ RH/Admin/Super Admin n'ont **JAMAIS** accès :
  - Notes cliniques
  - Journal employé
  - Chat consultation
  - Contenu séance
  - Diagnostics, motifs

#### **2. Paiement Hors Plateforme**
- ❌ **AUCUN** prix/tarif dans le produit
- ❌ **AUCUN** paiement in-app
- ✅ Compteurs d'activité pour paiement externe :
  - Nombre de consultations
  - Durée totale (seconds)
  - Breakdown par période

#### **3. Reporting Usage (Sans Médical)**
- ✅ RH/Admin/Super Admin voient :
  - **Nombre** consultations par employé
  - **Durée** cumulée par employé
  - **Usage** par entreprise
- ❌ Jamais le contenu

#### **4. Multi-Tenant**
- 10+ entreprises
- 5-100 employés/entreprise
- 50+ praticiens
- Isolation stricte par `company_id`

#### **5. Stack Technique**
- **Frontend** : Next.js 14+ (App Router)
- **Backend** : NestJS 10+
- **Database** : PostgreSQL 15+
- **Cache** : Redis 7+
- **Visio** : Jitsi (self-hosted)
- **Infra** : Docker + Nginx

---

## 2. ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - App Router (SSR/Server Components)                       │
│  - Tailwind + shadcn/ui                                     │
│  - Middleware RBAC (route protection)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS (Nginx reverse proxy)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (NestJS) - Port 3000                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  REST API (OpenAPI/Swagger)                         │   │
│  │  - Auth (JWT + Refresh)                             │   │
│  │  - RBAC (5 rôles + guards)                          │   │
│  │  - Multi-tenant (company_id isolation)              │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebSocket (Socket.IO) - Port 3001                  │   │
│  │  - Chat temps réel                                  │   │
│  │  - Notifications                                    │   │
│  └─────────────────────────────────────────────────────┘   │
└──────┬───────────┬───────────┬──────────────┬──────────────┘
       │           │           │              │
       ▼           ▼           ▼              ▼
   ┌──────┐  ┌──────┐  ┌──────────┐  ┌────────────┐
   │ PG   │  │Redis │  │  Jitsi   │  │  Storage   │
   │ SQL  │  │Cache │  │  Server  │  │  (Files)   │
   └──────┘  └──────┘  └──────────┘  └────────────┘
```

---

## 3. STRUCTURE REPO COMPLÈTE

### **Monorepo pnpm workspaces**

```
huntzen-care/
├─ apps/
│  ├─ web/                         # Next.js Frontend
│  │  ├─ app/
│  │  │  ├─ (public)/
│  │  │  │  ├─ page.tsx            # Landing
│  │  │  │  └─ security/page.tsx
│  │  │  ├─ login/page.tsx
│  │  │  ├─ employee/              # Employé (R5)
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ booking/page.tsx
│  │  │  │  ├─ consultations/[id]/page.tsx
│  │  │  │  └─ journal/page.tsx
│  │  │  ├─ practitioner/          # Praticien (R4)
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ agenda/page.tsx
│  │  │  │  ├─ consultations/[id]/page.tsx
│  │  │  │  └─ usage/page.tsx
│  │  │  ├─ rh/                    # Admin RH (R3)
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ employees/page.tsx
│  │  │  │  └─ usage/page.tsx
│  │  │  ├─ admin/                 # Admin HuntZen (R2)
│  │  │  │  ├─ layout.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ companies/page.tsx
│  │  │  │  └─ practitioners/page.tsx
│  │  │  └─ super-admin/           # Super Admin PSG (R1)
│  │  │     ├─ layout.tsx
│  │  │     ├─ page.tsx
│  │  │     └─ monitoring/page.tsx
│  │  ├─ components/
│  │  │  ├─ ui/                    # shadcn/ui
│  │  │  ├─ layout/
│  │  │  │  ├─ Sidebar.tsx
│  │  │  │  └─ Topbar.tsx
│  │  │  ├─ auth/
│  │  │  │  └─ LoginForm.tsx
│  │  │  ├─ booking/
│  │  │  │  └─ PractitionerCard.tsx
│  │  │  ├─ consultation/
│  │  │  │  └─ JitsiRoom.tsx
│  │  │  └─ chat/
│  │  │     └─ ChatPanel.tsx
│  │  ├─ lib/
│  │  │  ├─ api.ts                 # Typed fetch client
│  │  │  ├─ auth.ts                # Session helpers
│  │  │  └─ rbac.ts                # Role maps
│  │  ├─ middleware.ts             # RBAC route protection
│  │  ├─ styles/globals.css
│  │  ├─ next.config.js
│  │  └─ package.json
│  │
│  └─ api/                         # NestJS Backend
│     ├─ src/
│     │  ├─ main.ts
│     │  ├─ app.module.ts
│     │  ├─ config/
│     │  │  ├─ env.validation.ts
│     │  │  └─ swagger.ts
│     │  ├─ common/
│     │  │  ├─ decorators/
│     │  │  │  ├─ roles.decorator.ts
│     │  │  │  └─ perms.decorator.ts
│     │  │  ├─ guards/
│     │  │  │  ├─ jwt-auth.guard.ts
│     │  │  │  ├─ roles.guard.ts
│     │  │  │  ├─ perms.guard.ts
│     │  │  │  ├─ company-scope.guard.ts
│     │  │  │  └─ no-medical.guard.ts
│     │  │  ├─ interceptors/
│     │  │  │  ├─ audit.interceptor.ts
│     │  │  │  └─ request-id.interceptor.ts
│     │  │  └─ filters/
│     │  │     └─ http-exception.filter.ts
│     │  ├─ auth/
│     │  │  ├─ rbac/
│     │  │  │  ├─ roles.enum.ts         # 5 rôles
│     │  │  │  ├─ permissions.ts        # Permissions
│     │  │  │  ├─ rbac.matrix.ts        # Matrice complète
│     │  │  │  └─ rbac.service.ts
│     │  │  ├─ auth.module.ts
│     │  │  ├─ auth.controller.ts
│     │  │  ├─ auth.service.ts
│     │  │  └─ strategies/
│     │  │     └─ jwt.strategy.ts
│     │  ├─ modules/
│     │  │  ├─ companies/
│     │  │  │  ├─ companies.module.ts
│     │  │  │  ├─ companies.controller.ts
│     │  │  │  └─ companies.service.ts
│     │  │  ├─ employees/
│     │  │  ├─ practitioners/
│     │  │  ├─ availability/
│     │  │  ├─ consultations/
│     │  │  │  ├─ consultations.module.ts
│     │  │  │  ├─ consultations.controller.ts
│     │  │  │  └─ consultations.service.ts
│     │  │  ├─ jitsi/
│     │  │  ├─ chat/
│     │  │  │  ├─ chat.gateway.ts      # WebSocket
│     │  │  │  ├─ chat.module.ts
│     │  │  │  └─ chat.service.ts
│     │  │  ├─ medical/                # INTERDIT admin
│     │  │  │  ├─ medical.module.ts
│     │  │  │  ├─ medical.controller.ts
│     │  │  │  └─ medical.service.ts
│     │  │  ├─ metrics/                # Compteurs
│     │  │  │  ├─ metrics.module.ts
│     │  │  │  ├─ metrics.controller.ts
│     │  │  │  └─ metrics.service.ts
│     │  │  ├─ content/
│     │  │  └─ audit/
│     │  ├─ db/
│     │  │  ├─ prisma/
│     │  │  │  └─ schema.prisma
│     │  │  └─ migrations/
│     │  │     └─ 001_initial.sql
│     │  ├─ security/
│     │  │  └─ encryption.service.ts   # AES-256-GCM
│     │  ├─ infra/
│     │  │  ├─ redis/
│     │  │  └─ mail/
│     │  └─ test/
│     ├─ nest-cli.json
│     └─ package.json
│
├─ packages/
│  └─ shared/
│     ├─ src/
│     │  ├─ types.ts               # Shared types
│     │  ├─ constants.ts           # Roles, statuses
│     │  └─ rbac.json              # Matrice RBAC
│     └─ package.json
│
├─ infra/
│  ├─ docker/
│  │  ├─ docker-compose.yml        # Tous services
│  │  ├─ nginx/
│  │  │  └─ nginx.conf
│  │  └─ postgres/
│  │     └─ init.sql
│  └─ scripts/
│     ├─ backup.sh
│     └─ restore.sh
│
├─ db/
│  ├─ schema.sql                   # SQL complet
│  └─ seed.sql
│
├─ openapi/
│  └─ openapi.yaml                 # Swagger complet
│
├─ README.md
├─ pnpm-workspace.yaml
└─ package.json
```

---

## 4. RBAC COMPLET (TypeScript)

### **4.1 Enums Rôles**

**Fichier** : `apps/api/src/auth/rbac/roles.enum.ts`

```typescript
export enum Role {
  R1_PSG_SUPER = "R1_PSG_SUPER",           // Super Super Admin (PSG)
  R2_HUNTZEN_ADMIN = "R2_HUNTZEN_ADMIN",   // Admin HuntZen
  R3_COMPANY_RH = "R3_COMPANY_RH",         // Admin Entreprise (RH)
  R4_PRACTITIONER = "R4_PRACTITIONER",     // Praticien
  R5_EMPLOYEE = "R5_EMPLOYEE",             // Employé
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.R1_PSG_SUPER]: "Super Super Admin (PSG)",
  [Role.R2_HUNTZEN_ADMIN]: "Admin HuntZen",
  [Role.R3_COMPANY_RH]: "Admin Entreprise (RH)",
  [Role.R4_PRACTITIONER]: "Praticien",
  [Role.R5_EMPLOYEE]: "Employé",
};
```

---

### **4.2 Permissions**

**Fichier** : `apps/api/src/auth/rbac/permissions.ts`

```typescript
/**
 * Liste exhaustive des permissions
 * Convention : resource.action
 */
export const Perm = {
  // ========== AUTH ==========
  AUTH_LOGIN: "auth.login",
  AUTH_REFRESH: "auth.refresh",
  AUTH_LOGOUT: "auth.logout",

  // ========== INFRA (R1 PSG) ==========
  INFRA_READ: "infra.read",
  INFRA_MANAGE: "infra.manage",
  MONITORING_READ: "monitoring.read",
  BACKUPS_MANAGE: "backups.manage",
  SECURITY_READ: "security.read",
  SECURITY_MANAGE: "security.manage",
  AUDIT_TECH_READ: "audit_tech.read",
  FEATURE_FLAGS_MANAGE: "feature_flags.manage",

  // ========== ADMIN HUNTZEN (R2) ==========
  COMPANIES_MANAGE: "companies.manage",
  COMPANY_ADMINS_MANAGE: "company_admins.manage",
  PRACTITIONERS_VALIDATE: "practitioners.validate",
  PRACTITIONERS_MANAGE: "practitioners.manage",
  CONTENT_GLOBAL_MANAGE: "content_global.manage",
  SUPPORT_N2_MANAGE: "support_n2.manage",
  METRICS_GLOBAL_READ: "metrics_global.read",
  EXPORTS_METRICS_GLOBAL: "exports.metrics_global",

  // ========== RH ENTREPRISE (R3) ==========
  EMPLOYEES_MANAGE: "employees.manage",
  EMPLOYEES_IMPORT_CSV: "employees.import_csv",
  COMPANY_PROFILE_MANAGE: "company_profile.manage",
  COMPANY_NEWS_MANAGE: "company_news.manage",
  METRICS_COMPANY_READ: "metrics_company.read",
  METRICS_EMPLOYEE_USAGE_READ: "metrics_employee_usage.read",
  EXPORTS_METRICS_COMPANY: "exports.metrics_company",

  // ========== PRATICIEN (R4) ==========
  PRACTITIONER_PROFILE_MANAGE: "practitioner_profile.manage",
  AVAILABILITY_MANAGE: "availability.manage",
  CONSULTATIONS_OWN_READ: "consultations.own.read",
  CONSULTATIONS_OWN_WRITE: "consultations.own.write",
  ROOM_JOIN: "room.join",
  CHAT_OWN_READ: "chat.own.read",
  CHAT_OWN_WRITE: "chat.own.write",
  CLINICAL_NOTES_OWN_READ: "clinical_notes.own.read",
  CLINICAL_NOTES_OWN_WRITE: "clinical_notes.own.write",
  METRICS_PRACTITIONER_USAGE_READ: "metrics_practitioner_usage.read",
  EXPORTS_PRACTITIONER_USAGE: "exports.practitioner_usage",

  // ========== EMPLOYÉ (R5) ==========
  PRACTITIONERS_BROWSE: "practitioners.browse",
  BOOKING_CREATE: "booking.create",
  BOOKING_UPDATE_OWN: "booking.update_own",
  BOOKING_CANCEL_OWN: "booking.cancel_own",
  CONSULTATIONS_MY_READ: "consultations.my.read",
  ROOM_JOIN_OWN: "room.join_own",
  JOURNAL_OWN_READ: "journal.own.read",
  JOURNAL_OWN_WRITE: "journal.own.write",
  CONTENT_READ: "content.read",
  NOTIFICATIONS_READ_OWN: "notifications.read_own",
  SETTINGS_MANAGE_OWN: "settings.manage_own",

  // ========== MÉDICAL (INTERDIT) ==========
  MEDICAL_READ: "medical.read",
  MEDICAL_WRITE: "medical.write",
} as const;

export type Permission = typeof Perm[keyof typeof Perm];
```

---

### **4.3 Matrice RBAC**

**Fichier** : `apps/api/src/auth/rbac/rbac.matrix.ts`

```typescript
import { Role } from "./roles.enum";
import { Perm, Permission } from "./permissions";

export type RoleMatrix = Record<Role, {
  can: Permission[];
  cannot?: Permission[];
}>;

/**
 * Matrice RBAC complète
 * Source de vérité pour toutes les permissions
 */
export const RBAC_MATRIX: RoleMatrix = {
  // ========================================
  // R1 - SUPER SUPER ADMIN (PSG)
  // ========================================
  [Role.R1_PSG_SUPER]: {
    can: [
      Perm.INFRA_READ,
      Perm.INFRA_MANAGE,
      Perm.MONITORING_READ,
      Perm.BACKUPS_MANAGE,
      Perm.SECURITY_READ,
      Perm.SECURITY_MANAGE,
      Perm.AUDIT_TECH_READ,
      Perm.FEATURE_FLAGS_MANAGE,
    ],
    cannot: [
      // ❌ INTERDIT : Contenu médical
      Perm.MEDICAL_READ,
      Perm.MEDICAL_WRITE,
      Perm.CLINICAL_NOTES_OWN_READ,
      Perm.CLINICAL_NOTES_OWN_WRITE,
      Perm.JOURNAL_OWN_READ,
      Perm.JOURNAL_OWN_WRITE,
      Perm.CHAT_OWN_READ,
      Perm.CHAT_OWN_WRITE,
    ],
  },

  // ========================================
  // R2 - ADMIN HUNTZEN
  // ========================================
  [Role.R2_HUNTZEN_ADMIN]: {
    can: [
      Perm.COMPANIES_MANAGE,
      Perm.COMPANY_ADMINS_MANAGE,
      Perm.PRACTITIONERS_VALIDATE,
      Perm.PRACTITIONERS_MANAGE,
      Perm.CONTENT_GLOBAL_MANAGE,
      Perm.SUPPORT_N2_MANAGE,
      Perm.METRICS_GLOBAL_READ,
      Perm.EXPORTS_METRICS_GLOBAL,
    ],
    cannot: [
      // ❌ INTERDIT : Contenu médical
      Perm.MEDICAL_READ,
      Perm.MEDICAL_WRITE,
      Perm.CLINICAL_NOTES_OWN_READ,
      Perm.CLINICAL_NOTES_OWN_WRITE,
      Perm.JOURNAL_OWN_READ,
      Perm.JOURNAL_OWN_WRITE,
      Perm.CHAT_OWN_READ,
      Perm.CHAT_OWN_WRITE,
    ],
  },

  // ========================================
  // R3 - ADMIN ENTREPRISE (RH)
  // ========================================
  [Role.R3_COMPANY_RH]: {
    can: [
      Perm.EMPLOYEES_MANAGE,
      Perm.EMPLOYEES_IMPORT_CSV,
      Perm.COMPANY_PROFILE_MANAGE,
      Perm.COMPANY_NEWS_MANAGE,
      Perm.METRICS_COMPANY_READ,
      Perm.METRICS_EMPLOYEE_USAGE_READ,
      Perm.EXPORTS_METRICS_COMPANY,
    ],
    cannot: [
      // ❌ INTERDIT : Contenu médical
      Perm.MEDICAL_READ,
      Perm.MEDICAL_WRITE,
      Perm.CLINICAL_NOTES_OWN_READ,
      Perm.CLINICAL_NOTES_OWN_WRITE,
      Perm.JOURNAL_OWN_READ,
      Perm.JOURNAL_OWN_WRITE,
      Perm.CHAT_OWN_READ,
      Perm.CHAT_OWN_WRITE,
    ],
  },

  // ========================================
  // R4 - PRATICIEN
  // ========================================
  [Role.R4_PRACTITIONER]: {
    can: [
      Perm.PRACTITIONER_PROFILE_MANAGE,
      Perm.AVAILABILITY_MANAGE,
      Perm.CONSULTATIONS_OWN_READ,
      Perm.CONSULTATIONS_OWN_WRITE,
      Perm.ROOM_JOIN,
      Perm.CHAT_OWN_READ,
      Perm.CHAT_OWN_WRITE,
      // ✅ AUTORISÉ : Ses notes cliniques uniquement
      Perm.CLINICAL_NOTES_OWN_READ,
      Perm.CLINICAL_NOTES_OWN_WRITE,
      Perm.METRICS_PRACTITIONER_USAGE_READ,
      Perm.EXPORTS_PRACTITIONER_USAGE,
    ],
  },

  // ========================================
  // R5 - EMPLOYÉ
  // ========================================
  [Role.R5_EMPLOYEE]: {
    can: [
      Perm.PRACTITIONERS_BROWSE,
      Perm.BOOKING_CREATE,
      Perm.BOOKING_UPDATE_OWN,
      Perm.BOOKING_CANCEL_OWN,
      Perm.CONSULTATIONS_MY_READ,
      Perm.ROOM_JOIN_OWN,
      Perm.CHAT_OWN_READ,
      Perm.CHAT_OWN_WRITE,
      // ✅ AUTORISÉ : Son journal uniquement
      Perm.JOURNAL_OWN_READ,
      Perm.JOURNAL_OWN_WRITE,
      Perm.CONTENT_READ,
      Perm.NOTIFICATIONS_READ_OWN,
      Perm.SETTINGS_MANAGE_OWN,
    ],
    cannot: [
      // ❌ INTERDIT : Notes cliniques
      Perm.CLINICAL_NOTES_OWN_READ,
      Perm.CLINICAL_NOTES_OWN_WRITE,
    ],
  },
};
```

---

### **4.4 Service RBAC**

**Fichier** : `apps/api/src/auth/rbac/rbac.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { RBAC_MATRIX } from "./rbac.matrix";
import { Role } from "./roles.enum";
import type { Permission } from "./permissions";

@Injectable()
export class RbacService {
  /**
   * Vérifie si un rôle a une permission
   */
  hasPermission(role: Role, perm: Permission): boolean {
    const rules = RBAC_MATRIX[role];
    if (!rules) return false;

    const can = rules.can.includes(perm);
    const cannot = (rules.cannot ?? []).includes(perm);

    return can && !cannot;
  }

  /**
   * Vérifie si un rôle a toutes les permissions
   */
  hasAll(role: Role, perms: Permission[]): boolean {
    return perms.every((p) => this.hasPermission(role, p));
  }

  /**
   * Vérifie si un rôle a au moins une permission
   */
  hasAny(role: Role, perms: Permission[]): boolean {
    return perms.some((p) => this.hasPermission(role, p));
  }

  /**
   * Liste toutes les permissions d'un rôle
   */
  getPermissions(role: Role): Permission[] {
    const rules = RBAC_MATRIX[role];
    if (!rules) return [];

    return rules.can.filter(
      (p) => !(rules.cannot ?? []).includes(p)
    );
  }
}
```

---

### **4.5 Decorators**

**Fichier** : `apps/api/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";
import { Role } from "../../auth/rbac/roles.enum";

export const ROLES_KEY = "roles";

/**
 * Decorator pour restreindre une route à certains rôles
 * Usage: @Roles(Role.R2_HUNTZEN_ADMIN, Role.R3_COMPANY_RH)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

**Fichier** : `apps/api/src/common/decorators/perms.decorator.ts`

```typescript
import { SetMetadata } from "@nestjs/common";
import type { Permission } from "../../auth/rbac/permissions";

export const PERMS_KEY = "perms";

/**
 * Decorator pour restreindre une route à certaines permissions
 * Usage: @Perms(Perm.EMPLOYEES_MANAGE, Perm.EMPLOYEES_IMPORT_CSV)
 */
export const Perms = (...perms: Permission[]) => SetMetadata(PERMS_KEY, perms);
```

---

### **4.6 Guards**

#### **JWT Auth Guard**

**Fichier** : `apps/api/src/common/guards/jwt-auth.guard.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
```

#### **Roles Guard**

**Fichier** : `apps/api/src/common/guards/roles.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { Role } from "../../auth/rbac/roles.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Pas de restriction
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role: Role };

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Accès refusé : rôle insuffisant");
    }

    return true;
  }
}
```

#### **Permissions Guard**

**Fichier** : `apps/api/src/common/guards/perms.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMS_KEY } from "../decorators/perms.decorator";
import type { Permission } from "../../auth/rbac/permissions";
import { RbacService } from "../../auth/rbac/rbac.service";
import { Role } from "../../auth/rbac/roles.enum";

@Injectable()
export class PermsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rbac: RbacService,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredPerms = this.reflector.getAllAndOverride<Permission[]>(PERMS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredPerms || requiredPerms.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role: Role };

    if (!user || !this.rbac.hasAll(user.role, requiredPerms)) {
      throw new ForbiddenException("Accès refusé : permissions insuffisantes");
    }

    return true;
  }
}
```

#### **Company Scope Guard**

**Fichier** : `apps/api/src/common/guards/company-scope.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Role } from "../../auth/rbac/roles.enum";

/**
 * Guard pour isolation multi-tenant
 * RH/Employé ne peuvent accéder qu'à leur entreprise
 */
@Injectable()
export class CompanyScopeGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role: Role; companyId?: string };

    // Admin global (R1, R2) : accès à toutes les entreprises
    if ([Role.R1_PSG_SUPER, Role.R2_HUNTZEN_ADMIN].includes(user.role)) {
      return true;
    }

    // Récupérer company_id de la route (si présent)
    const targetCompanyId = req.params?.companyId || req.body?.companyId;

    // RH / Employé : doivent rester dans leur entreprise
    if ([Role.R3_COMPANY_RH, Role.R5_EMPLOYEE].includes(user.role)) {
      if (!user.companyId) {
        throw new ForbiddenException("Utilisateur sans entreprise");
      }

      if (targetCompanyId && targetCompanyId !== user.companyId) {
        throw new ForbiddenException("Accès refusé : entreprise différente");
      }
    }

    return true;
  }
}
```

#### **No Medical For Admins Guard** ⚠️

**Fichier** : `apps/api/src/common/guards/no-medical.guard.ts`

```typescript
import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Role } from "../../auth/rbac/roles.enum";

/**
 * Guard CRITIQUE : Empêche R1/R2/R3 d'accéder au contenu médical
 * À utiliser sur TOUS les endpoints médicaux (notes, journal, chat)
 */
@Injectable()
export class NoMedicalForAdminsGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { role: Role };

    // Rôles INTERDITS d'accès médical
    const forbiddenRoles = [
      Role.R1_PSG_SUPER,
      Role.R2_HUNTZEN_ADMIN,
      Role.R3_COMPANY_RH,
    ];

    if (forbiddenRoles.includes(user.role)) {
      throw new ForbiddenException(
        "Accès refusé : contenu médical interdit pour ce rôle"
      );
    }

    return true;
  }
}
```

---

**FIN DU FICHIER 05 - Suite dans les fichiers suivants**

Les prochains fichiers contiendront :
- 06 : Backend NestJS (code complet des modules)
- 07 : Frontend Next.js (code complet)
- 08 : SQL complet avec triggers
- 09 : OpenAPI/Swagger complet

**Voulez-vous que je continue avec les fichiers 06, 07, 08 et 09 ?**
