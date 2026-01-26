# Seed Users - All Roles

After running `npm run prisma:seed` in `backend-api/`, you'll have the following test users:

## Login Credentials

**All passwords:** `Password123!`

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **SUPER_ADMIN** | `superadmin@huntzen.com` | `Password123!` | HR Dashboard |
| **ADMIN_HUNTZEN** | `admin@huntzen.com` | `Password123!` | HR Dashboard |
| **ADMIN_RH** | `admin.rh@huntzen-demo.com` | `Password123!` | HR Dashboard |
| **EMPLOYEE** | `marc@huntzen-demo.com` | `Password123!` | Employee Dashboard |
| **PRACTITIONER** | `sophie.martin@huntzen-care.com` | `Password123!` | Practitioner Dashboard |
| **PRACTITIONER** | `thomas.bernard@huntzen-care.com` | `Password123!` | Practitioner Dashboard |

## Dashboard Routing

- **SUPER_ADMIN, ADMIN_HUNTZEN, ADMIN_RH** → `hr-dashboard` (HR Dashboard)
- **PRACTITIONER** → `practitioner-dashboard` (Practitioner Dashboard)
- **EMPLOYEE** → `dashboard` (Employee Dashboard)

## Testing Different Dashboards

You can also use **"Démo - Changer de vue"** in the sidebar to switch between different dashboard views regardless of your role:

- 👤 Vue Employé → Employee Dashboard
- 👨‍⚕️ Vue Praticien → Practitioner Dashboard
- 👔 Vue Admin RH → HR Dashboard
- 💰 Suivi Praticiens (Admin) → Practitioner Billing
- 📊 Suivi Employés (RH) → Employee Usage
- 🌐 Landing Page → Marketing Landing Page

## Running the Seed

```bash
cd backend-api
npm run prisma:seed
```

This will:
1. Clear all existing data
2. Create a demo company
3. Create users for all roles
4. Create practitioners with profiles
5. Create sample consultations, messages, news, journal entries, and notifications
