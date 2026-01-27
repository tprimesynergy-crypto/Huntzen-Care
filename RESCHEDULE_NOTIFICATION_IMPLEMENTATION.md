# Reschedule Notification Implementation

This document describes the implementation of notifications when appointments are rescheduled.

## Changes Made

### 1. Database Schema Update

**File**: `backend-api/prisma/schema.prisma`

Added new notification type:
```prisma
enum NotificationType {
  CONSULTATION_CONFIRMED
  CONSULTATION_CANCELLED
  CONSULTATION_RESCHEDULED  // ← NEW
  CONSULTATION_REMINDER_24H
  MESSAGE_RECEIVED
  NEWS_PUBLISHED
  SYSTEM
}
```

### 2. NotificationsService Enhancement

**File**: `backend-api/src/modules/notifications/notifications.service.ts`

Added `create()` method to create notifications:
```typescript
async create(userId: string, type: string, title: string, message: string, linkUrl?: string, linkLabel?: string)
```

### 3. ConsultationsService Update

**File**: `backend-api/src/modules/consultations/consultations.service.ts`

- Injected `NotificationsService`
- Updated `reschedule()` method to:
  - Create notification for the other party after rescheduling
  - If employee reschedules → notify practitioner
  - If practitioner reschedules → notify employee
  - Include formatted date/time and link to consultation

### 4. Module Dependencies

**File**: `backend-api/src/modules/consultations/consultations.module.ts`

- Imported `NotificationsModule` to access `NotificationsService`

---

## How It Works

1. **When an employee reschedules**:
   - Consultation is updated with new date/time
   - Notification is created for the practitioner
   - Message: "{Employee Name} a reprogrammé votre consultation au {date} à {time}."

2. **When a practitioner reschedules**:
   - Consultation is updated with new date/time
   - Notification is created for the employee
   - Message: "{Practitioner Name} a reprogrammé votre consultation au {date} à {time}."

3. **Notification includes**:
   - Title: "Consultation reprogrammée"
   - Message with formatted date/time
   - Link to view the consultation
   - Type: `CONSULTATION_RESCHEDULED`

---

## Migration Required

You need to create and run a database migration to add the new enum value.

### Step 1: Create Migration

```bash
cd backend-api
npx prisma migrate dev --name add_consultation_rescheduled_notification
```

This will:
- Create a new migration file
- Update the database schema
- Regenerate Prisma Client

### Step 2: For Production

```bash
# Generate migration (if not done locally)
npx prisma migrate dev --name add_consultation_rescheduled_notification

# Apply to production database
npx prisma migrate deploy
```

---

## Testing

### Test Scenario 1: Employee Reschedules

1. Login as employee (e.g., marc@huntzen-demo.com)
2. Go to "Mes Rendez-vous"
3. Click "Reprogrammer" on an upcoming consultation
4. Change the date/time
5. Save

**Expected Result**:
- Consultation is updated
- Practitioner receives a notification
- Notification appears in practitioner's notification list
- Notification message includes employee name and new date/time

### Test Scenario 2: Practitioner Reschedules

1. Login as practitioner (e.g., sophie.martin@huntzen-care.com)
2. Go to "Mes Consultations" (or Practitioner Dashboard)
3. Find a consultation and reschedule it (if reschedule functionality exists for practitioners)
4. Save

**Expected Result**:
- Consultation is updated
- Employee receives a notification
- Notification appears in employee's notification list
- Notification message includes practitioner name and new date/time

---

## Frontend Display

The notification will appear in:
- Notification bell icon in the top bar
- Notification count badge
- Notification list/dropdown

The notification will have:
- Title: "Consultation reprogrammée"
- Message with details
- Clickable link to view the consultation

---

## Code Locations

- **Schema**: `backend-api/prisma/schema.prisma`
- **Notification Service**: `backend-api/src/modules/notifications/notifications.service.ts`
- **Consultation Service**: `backend-api/src/modules/consultations/consultations.service.ts`
- **Module Config**: `backend-api/src/modules/consultations/consultations.module.ts`

---

## Notes

- Notifications are created asynchronously (non-blocking)
- If notification creation fails, the reschedule still succeeds (error is logged but not thrown)
- Date/time formatting uses French locale (`fr-FR`)
- Link URL format: `/consultations/{consultationId}` (adjust based on your frontend routing)

---

## Future Enhancements

- Add email notifications for rescheduled consultations
- Add push notifications (if mobile app exists)
- Add notification preferences (user can choose to receive/not receive reschedule notifications)
- Add notification history/archive
