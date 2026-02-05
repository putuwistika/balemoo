# 🚀 Quick Start - Balemoo Project Management

## Run in 3 Steps:

### 1️⃣ Install Dependencies
```bash
npm install
# OR
pnpm install
```

### 2️⃣ Start Dev Server
```bash
npm run dev
# OR  
pnpm dev
```

### 3️⃣ Open Browser
```
http://localhost:5173
```

---

## Login Credentials

**Admin (Full Access):**
```
Email: demo-admin@balemoo.com
Password: demo12345
```

**Staff (Read Only):**
```
Email: demo-staff@balemoo.com
Password: demo12345
```

**User (Assigned Projects Only):**
```
Email: demo-user@balemoo.com
Password: demo12345
```

---

## What to Test

✅ **Create Project** - Click "+" button  
✅ **Edit Project** - Click blue pencil icon (admin only)  
✅ **Delete Project** - Click red trash icon (admin only)  
✅ **View Projects** - Navigate to /projects

---

## Troubleshooting

**Projects not loading?**
- Check browser console (F12)
- Check Network tab for API errors
- Verify logged in as admin

**Backend not responding?**
- Test: https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/health
- Should return: `{"status":"ok"}`

---

📖 **Full Guide:** See `TESTING_GUIDE.md`  
📊 **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
