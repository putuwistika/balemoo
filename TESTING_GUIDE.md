# 🧪 Testing Guide - Balemoo Project Management

## Prerequisites

Pastikan sudah terinstall:
- Node.js v18+ atau v20+
- npm atau pnpm
- Git (optional)

## 1. Setup & Installation

### Install Dependencies
```bash
# Menggunakan npm
npm install

# ATAU menggunakan pnpm (recommended - lihat package.json)
pnpm install
```

### Add Dev Script
Tambahkan dev script ke `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## 2. Start Development Server

```bash
# Jalankan dev server
npm run dev

# ATAU dengan pnpm
pnpm dev
```

Server akan berjalan di: **http://localhost:5173** (atau port lain jika 5173 sudah terpakai)

## 3. Testing Flow

### Step 1: Login sebagai Admin
1. Buka browser ke http://localhost:5173
2. Klik **"Login"** di header
3. Login dengan credentials:
   ```
   Email: demo-admin@balemoo.com
   Password: demo12345
   ```
   
   **ATAU** klik "Try Quick Demo Access" → pilih Admin card

### Step 2: Navigate ke Projects
Setelah login, klik **"Projects"** atau navigate ke `/projects`

### Step 3: Check Initial State
- **Expected:** List projects kosong ATAU ada projects dari localStorage lama
- **Check browser console:** Apakah ada error dari API call?

### Step 4: Initialize Demo Projects (First Time Only)
Jika list kosong, kamu perlu init demo projects dari backend:

**Option A - Via Browser Console:**
```javascript
// Open browser console (F12)
const accessToken = localStorage.getItem('supabase.auth.token'); // Check actual key
fetch('https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/init-demo-projects', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Demo projects created:', data))
.catch(err => console.error('Error:', err));

// Then reload the page
window.location.reload();
```

**Option B - Via Backend Direct:**
Atau jalankan via Supabase Dashboard → Functions → Test function

### Step 5: Test CREATE Project

1. Klik tombol **"+"** (Create Project)
2. Isi form:
   ```
   Project Name: Test Event 2026
   Start Date: [today]
   End Date: [tomorrow]
   Agenda 1:
     - Name: Opening Ceremony
     - Date: [today]
     - Time: 10:00
   ```
3. Klik **"Create Project"**
4. **Expected Results:**
   - ✅ Toast notification: "🎉 Project created successfully!"
   - ✅ Modal closes
   - ✅ New project appears in list
   - ✅ Check browser Network tab: POST request to `/projects` (status 200)

**Debug if Failed:**
- Check browser console for errors
- Check Network tab → POST request → Response
- Verify accessToken exists in AuthContext

### Step 6: Test EDIT Project

1. Find project card dengan Edit/Delete buttons (admin only)
2. Klik icon **pensil biru** (Edit)
3. Edit modal opens dengan data ter-fill
4. Change something:
   ```
   Project Name: Test Event 2026 (Updated)
   Add new agenda:
     - Name: Closing Ceremony
     - Date: [tomorrow]
     - Time: 18:00
   ```
5. Klik **"Update Project"**
6. **Expected Results:**
   - ✅ Toast notification: "✅ Project updated successfully!"
   - ✅ Modal closes
   - ✅ Changes reflected in project card
   - ✅ Check Network tab: PUT request to `/projects/:id` (status 200)

**Debug if Failed:**
- Check if admin role (only admin can edit)
- Check project ID passed correctly
- Verify request body in Network tab

### Step 7: Test DELETE Project

1. Find project card
2. Klik icon **trash merah** (Delete)
3. Confirm dialog appears: "Are you sure?"
4. Klik **OK**
5. **Expected Results:**
   - ✅ Toast notification: "Project deleted successfully"
   - ✅ Project disappears from list
   - ✅ Check Network tab: DELETE request to `/projects/:id` (status 200)

**Verify Soft Delete:**
- Check Supabase Dashboard → Table Editor → kv_store_deeab278
- Find deleted project (search by project name)
- Verify: `isDeleted: true`, `deletedAt` and `deletedBy` fields populated

### Step 8: Test Role-Based Access

**Test as Staff:**
1. Logout
2. Login as staff:
   ```
   Email: demo-staff@balemoo.com
   Password: demo12345
   ```
3. Navigate to Projects
4. **Expected:**
   - ✅ Can see all projects
   - ❌ NO Edit/Delete buttons (staff cannot edit/delete)

**Test as User:**
1. Logout
2. Login as user:
   ```
   Email: demo-user@balemoo.com
   Password: demo12345
   ```
3. Navigate to Projects
4. **Expected:**
   - ✅ Can see ONLY assigned projects
   - ❌ NO Edit/Delete buttons

## 4. Common Issues & Solutions

### Issue 1: "No authorization token provided"
**Solution:**
- Check if user is logged in
- Check AuthContext has accessToken
- Verify token in localStorage/sessionStorage

**Debug:**
```javascript
// Browser console
const { user, accessToken } = useAuth(); // In component
console.log('User:', user);
console.log('Token:', accessToken);
```

### Issue 2: Projects not loading
**Solution:**
- Check Network tab for failed requests
- Verify Supabase function is deployed and running
- Check CORS settings in backend

**Debug:**
```javascript
// Test backend health
fetch('https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/health')
  .then(r => r.json())
  .then(data => console.log('Backend health:', data));
```

### Issue 3: "Project not found" saat edit/delete
**Solution:**
- Verify project ID format correct (should start with "project:")
- Check project not already soft-deleted
- Verify role permissions (admin only)

### Issue 4: Changes not reflecting in UI
**Solution:**
- Check if `refreshProjects()` called after CRUD operations
- Verify `fetchProjects()` working correctly
- Check React state updates

**Debug:**
```javascript
// In ProjectContext
useEffect(() => {
  console.log('Projects updated:', projects);
}, [projects]);
```

### Issue 5: TypeError "Cannot read property 'id' of undefined"
**Solution:**
- Check project data structure from API
- Verify agendas array exists
- Add null checks in components

## 5. Backend Testing (Supabase Functions)

### Test Backend Directly

**Via curl:**
```bash
# Get projects
curl -X GET \
  https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create project
curl -X POST \
  https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "startDate": "2026-02-10",
    "endDate": "2026-02-11",
    "agendas": [
      {"id": "ag1", "name": "Event", "date": "2026-02-10", "time": "10:00"}
    ],
    "assignedUsers": ["user-id-here"]
  }'

# Update project
curl -X PUT \
  https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/projects/project:123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project",
    "startDate": "2026-02-10",
    "endDate": "2026-02-11",
    "agendas": [
      {"id": "ag1", "name": "Updated Event", "date": "2026-02-10", "time": "10:00"}
    ]
  }'

# Delete project
curl -X DELETE \
  https://uvqbmlnavztzobfaiqao.supabase.co/functions/v1/make-server-deeab278/projects/project:123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Get Access Token:**
```javascript
// Browser console (after login)
const session = await supabase.auth.getSession();
console.log('Access Token:', session.data.session?.access_token);
```

### Check Supabase Function Logs

1. Go to: https://supabase.com/dashboard/project/uvqbmlnavztzobfaiqao
2. Click **Edge Functions** → **make-server-deeab278**
3. Click **Logs** tab
4. Check for errors/logs from your requests

## 6. Testing Checklist

### ✅ Create Project
- [ ] Modal opens correctly
- [ ] Form validation works
- [ ] Can add/remove agendas
- [ ] Success toast appears
- [ ] New project appears in list
- [ ] Network request succeeds (200)

### ✅ Read Projects
- [ ] Projects load on page load
- [ ] Correct projects shown based on role
- [ ] Soft-deleted projects NOT shown
- [ ] Loading state shows
- [ ] Error handling works

### ✅ Update Project
- [ ] Edit modal opens with correct data
- [ ] Can modify all fields
- [ ] Success toast appears
- [ ] Changes reflected in UI
- [ ] Network request succeeds (200)

### ✅ Delete Project
- [ ] Confirm dialog appears
- [ ] Delete only on confirm
- [ ] Success toast appears
- [ ] Project removed from UI
- [ ] Soft delete (data still in DB)
- [ ] Network request succeeds (200)

### ✅ Role-Based Access
- [ ] Admin sees all projects
- [ ] Admin can create/edit/delete
- [ ] Staff sees all projects
- [ ] Staff CANNOT create/edit/delete
- [ ] User sees only assigned projects
- [ ] User CANNOT create/edit/delete

### ✅ Error Handling
- [ ] Invalid token shows error
- [ ] Network errors handled
- [ ] Form validation works
- [ ] User-friendly error messages

## 7. Performance Testing

### Check Performance
1. Open Chrome DevTools → Performance
2. Record while navigating to Projects page
3. Check:
   - Time to first render
   - API call duration
   - Re-render count

### Optimization Tips
- Projects should load in < 1 second
- No unnecessary re-renders
- Proper loading states
- Debounce search input (if added)

## 8. Browser Compatibility

Test in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 9. Mobile Testing

Test responsive design:
- Project cards stack properly
- Modals fit screen
- Buttons accessible
- Touch interactions work

---

## Quick Start Summary

```bash
# 1. Install
pnpm install

# 2. Add dev script to package.json
# "dev": "vite"

# 3. Run dev server
pnpm dev

# 4. Open browser
# http://localhost:5173

# 5. Login as admin
# demo-admin@balemoo.com / demo12345

# 6. Test CRUD operations
# Create → Edit → Delete
```

**Need Help?**
- Check browser console for errors
- Check Network tab for API calls
- Check Supabase Function logs
- Verify authentication token

**Happy Testing!** 🚀
