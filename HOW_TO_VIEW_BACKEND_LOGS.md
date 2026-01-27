# How to View Backend Logs

## Where to Find Backend Logs

Backend logs appear in the **terminal/command prompt** where you started the backend server.

---

## Step 1: Find Your Backend Terminal

### If Backend is Running:

Look for a terminal window that shows:
```
🚀 HuntZen Care API running on http://localhost:3000
```

Or:
```
[Nest] Starting Nest application...
[Nest] Application successfully started
```

**This is where the logs appear!**

### If Backend is NOT Running:

1. Open a new terminal/command prompt
2. Navigate to backend directory:
   ```bash
   cd backend-api
   ```
3. Start the backend:
   ```bash
   npm run start:dev
   ```
4. The logs will appear in this terminal

---

## Step 2: What You'll See in Logs

When you reschedule an appointment, you should see logs like:

### Success (Good):
```
[Reschedule] Employee rescheduled, practitionerUserId: abc-123-def
[Reschedule] Creating notification for practitioner: abc-123-def
[NotificationsService] Creating notification: { userId: 'abc-123-def', type: 'CONSULTATION_RESCHEDULED', title: 'Consultation reprogrammée' }
[NotificationsService] Notification created: notif-xyz-789
[Reschedule] Notification created successfully: notif-xyz-789
```

### Error (Bad):
```
[Reschedule] Employee rescheduled, practitionerUserId: abc-123-def
[Reschedule] Creating notification for practitioner: abc-123-def
[NotificationsService] Creating notification: { userId: 'abc-123-def', type: 'CONSULTATION_RESCHEDULED', ... }
[NotificationsService] Error creating notification: [ERROR MESSAGE HERE]
[Reschedule] Failed to create reschedule notification: [ERROR MESSAGE HERE]
```

---

## Step 3: Common Terminal Locations

### Windows:
- **Command Prompt** (cmd.exe)
- **PowerShell**
- **VS Code Integrated Terminal** (bottom panel)
- **Windows Terminal**

### Mac/Linux:
- **Terminal.app** (Mac)
- **Terminal** (Linux)
- **VS Code Integrated Terminal**

---

## Step 4: If You Can't Find the Terminal

### Option A: Start Backend in a New Terminal

1. Open a new terminal
2. Navigate to project:
   ```bash
   cd c:\Stage_PSG\Huntzen\backend-api
   ```
3. Start backend:
   ```bash
   npm run start:dev
   ```
4. Keep this terminal visible
5. Try rescheduling - logs will appear here

### Option B: Check VS Code Terminal

If you're using VS Code:
1. Look at the bottom panel
2. Click on the **Terminal** tab
3. You should see terminal tabs - one might be running the backend
4. Look for the one showing `🚀 HuntZen Care API running...`

### Option C: Check All Running Processes

**Windows:**
```powershell
# See all Node processes
Get-Process node
```

**Mac/Linux:**
```bash
# See all Node processes
ps aux | grep node
```

---

## Step 5: What to Look For

When you reschedule, scroll through the terminal output and look for:

1. **`[Reschedule]`** - Shows reschedule attempt
2. **`[NotificationsService]`** - Shows notification creation attempt
3. **Error messages** - Red text or error stack traces
4. **Success messages** - "Notification created successfully"

---

## Step 6: Copy Logs for Debugging

To share logs for debugging:

1. **Select the text** in the terminal (drag to select)
2. **Copy** (Ctrl+C or right-click → Copy)
3. **Paste** into a message or text file

Or take a screenshot of the terminal.

---

## Quick Test

To verify logs are working:

1. Make sure backend is running
2. Reschedule an appointment
3. **Immediately check the terminal** - you should see logs appear
4. Look for any red error messages

---

## If No Logs Appear

If you don't see any logs when rescheduling:

1. **Backend might not be running** - Start it with `npm run start:dev`
2. **Wrong terminal** - Make sure you're looking at the backend terminal, not frontend
3. **Logs scrolled past** - Scroll up in the terminal to see older logs
4. **Backend crashed** - Check for error messages at the bottom of the terminal

---

## Example: What Good Logs Look Like

```
[Nest] 12345  - 01/22/2025, 2:30:45 PM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/22/2025, 2:30:45 PM     LOG [InstanceLoader] AppModule dependencies initialized
🚀 HuntZen Care API running on http://localhost:3000

[Reschedule] Employee rescheduled, practitionerUserId: 550e8400-e29b-41d4-a716-446655440000
[Reschedule] Updated consultation: { ... }
[Reschedule] Creating notification for practitioner: 550e8400-e29b-41d4-a716-446655440000
[NotificationsService] Creating notification: { userId: '550e8400...', type: 'CONSULTATION_RESCHEDULED', title: 'Consultation reprogrammée' }
[NotificationsService] Notification created: 660e8400-e29b-41d4-a716-446655440001
[Reschedule] Notification created successfully: 660e8400-e29b-41d4-a716-446655440001
```

---

## Troubleshooting

### "I don't see any terminal running backend"
→ Start the backend in a new terminal (see Step 4, Option A)

### "Logs are too fast/scrolling"
→ Use `Ctrl+F` (or Cmd+F on Mac) to search for `[Reschedule]` or `[NotificationsService]`

### "Terminal shows errors but I can't read them"
→ Copy the error text and share it, or take a screenshot

### "Backend terminal closed/crashed"
→ Restart it: `cd backend-api && npm run start:dev`

---

**The backend logs are your best friend for debugging!** They show exactly what's happening (or failing) when you reschedule.
