# HR Statistics API - Implementation

## Backend Changes

### New Module: HR Module
Created `backend-api/src/modules/hr/` with:
- **hr.service.ts** - Business logic for HR statistics
- **hr.controller.ts** - REST endpoint `/hr/stats`
- **hr.module.ts** - NestJS module

### Endpoint: `GET /hr/stats`

**Authentication:** Required (JWT)

**Response:**
```json
{
  "totalEmployees": 10,
  "activeUsers": 8,
  "totalConsultations": 25,
  "consultationsThisMonth": 5,
  "completedConsultations": 15,
  "upcomingConsultations": 3,
  "departments": ["Engineering", "Marketing", "Sales"],
  "employeesByDepartment": {
    "Engineering": 5,
    "Marketing": 3,
    "Sales": 2
  }
}
```

**Statistics Calculated:**
- **totalEmployees**: Total number of employees enrolled in the company
- **activeUsers**: Employees who logged in within last 30 days OR have consultations in last 30 days
- **totalConsultations**: Total number of consultations (all time)
- **consultationsThisMonth**: Consultations scheduled this month
- **completedConsultations**: Consultations with status `COMPLETED`
- **upcomingConsultations**: Future consultations with status `SCHEDULED` or `CONFIRMED`
- **departments**: List of unique departments
- **employeesByDepartment**: Count of employees per department

**Role-based Access:**
- **ADMIN_RH**: Gets stats for their company (via `companyId`)
- **SUPER_ADMIN / ADMIN_HUNTZEN**: Gets global stats (all companies) if no `companyId`
- **Other roles**: Returns empty stats

---

## Frontend Changes

### API Service
Added `getHRStats()` method to `src/app/services/api.ts`:
```typescript
async getHRStats() {
  return this.request<{...}>('/hr/stats');
}
```

### HRDashboard Component
Updated `src/app/components/hr/HRDashboard.tsx` to:
- Fetch statistics from `/hr/stats` endpoint
- Display statistics in cards:
  - **Employés inscrits** (Total employees)
  - **Utilisateurs actifs** (Active users - 30 days)
  - **Consultations totales** (Total consultations)
  - **Séances réalisées** (Completed consultations)
- Show additional stats:
  - **Consultations ce mois** (This month's consultations + upcoming)
  - **Répartition par département** (Employees by department)

---

## Testing

1. **Start backend:**
   ```bash
   cd backend-api
   npm run start:dev
   ```

2. **Login as ADMIN_RH:**
   - Email: `admin.rh@huntzen-demo.com`
   - Password: `Password123!`

3. **View HR Dashboard:**
   - Should automatically show `hr-dashboard`
   - Statistics should display with real data from the database

4. **Test endpoint directly:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/hr/stats
   ```

---

## Files Modified/Created

### Backend (New)
- `backend-api/src/modules/hr/hr.service.ts`
- `backend-api/src/modules/hr/hr.controller.ts`
- `backend-api/src/modules/hr/hr.module.ts`

### Backend (Modified)
- `backend-api/src/app.module.ts` - Added HRModule import

### Frontend (Modified)
- `src/app/services/api.ts` - Added `getHRStats()` method
- `src/app/components/hr/HRDashboard.tsx` - Updated to fetch and display stats

---

## Next Steps (Optional Enhancements)

- Add date range filters
- Add export functionality (CSV/PDF)
- Add charts/graphs for visual representation
- Add trend analysis (month-over-month growth)
- Add practitioner statistics
- Add consultation success rate metrics
