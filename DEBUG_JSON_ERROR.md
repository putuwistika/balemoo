# 🐛 Debugging JSON Parse Error

## ✅ Fixes Applied

I've updated both context files with safe JSON parsing:

1. **CampaignContext.tsx** - Added `safeJsonParse()` helper
2. **ExecutionContext.tsx** - Added `safeJsonParse()` helper

These helpers will:
- Safely parse JSON responses
- Log the raw response if parsing fails
- Provide better error messages

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console

Open browser DevTools (F12) and look for:
- Red error messages
- Network tab - failed requests
- Console tab - "Failed to parse JSON:" messages

### Step 2: Check Network Requests

1. Open DevTools → Network tab
2. Try to create a campaign or view campaigns
3. Look for requests to `/make-server-deeab278/campaigns`
4. Check:
   - Status code (should be 200)
   - Response tab (should be valid JSON)
   - If you see HTML, it's a routing/CORS issue

### Step 3: Common Issues

#### Issue 1: No Project Selected
**Error:** "Project ID is required"
**Fix:** Make sure you've selected a project before accessing Operation Center

#### Issue 2: Not Logged In
**Error:** "No authorization token provided"
**Fix:** Login first, then navigate to Operation Center

#### Issue 3: No Active Chatflows
**Error:** When creating campaign, Step 2 shows "No active chatflows"
**Fix:** Create and activate at least one chatflow first

#### Issue 4: Backend Not Running
**Error:** Network error or CORS error
**Fix:** Make sure your Supabase functions are deployed

---

## 🧪 Test the API Directly

Open browser console and run:

```javascript
// Test if API is accessible
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/make-server-deeab278/health')
  .then(r => r.text())
  .then(t => console.log('Health check:', t));

// Test campaigns endpoint (replace tokens)
const projectId = 'your-project-id';
const accessToken = 'your-access-token';
const anonKey = 'your-anon-key';

fetch(`https://YOUR_PROJECT.supabase.co/functions/v1/make-server-deeab278/campaigns?projectId=${projectId}`, {
  headers: {
    'Authorization': `Bearer ${anonKey}`,
    'X-User-Token': accessToken,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.text())
  .then(t => {
    console.log('Raw response:', t);
    try {
      console.log('Parsed:', JSON.parse(t));
    } catch (e) {
      console.error('Parse failed:', e);
    }
  });
```

---

## 🔧 Quick Fixes

### Fix 1: Clear Browser Cache
```bash
# In browser DevTools
# Application → Storage → Clear site data
```

### Fix 2: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Fix 3: Check Supabase Project
1. Go to Supabase Dashboard
2. Check if Edge Functions are deployed
3. Check function logs for errors

---

## 📝 What to Check

- [ ] User is logged in
- [ ] Project is selected
- [ ] At least one guest exists
- [ ] At least one active chatflow exists
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows 200 responses
- [ ] Response content-type is `application/json`

---

## 🚨 If Still Broken

Run this diagnostic:

```bash
# Check if files exist
ls -la supabase/functions/make-server-deeab278/*_helpers.ts

# Check for syntax errors
cd supabase/functions/make-server-deeab278
deno check index.ts

# Try deploying functions
supabase functions deploy make-server-deeab278
```

---

## 💡 Most Likely Cause

Based on the error "Unexpected non-whitespace character after JSON at position 4",
the API is probably returning:

1. **HTML error page** instead of JSON (routing issue)
2. **Empty response** (backend crash)
3. **Multiple JSON objects** (malformed response)

The safe JSON parser will now show you the actual response in console!

---

## ✅ Verification

After fixes, test:

1. Navigate to `/kabar-in/operation`
2. Should see campaign list or empty state
3. Click "Create Campaign"
4. Modal should open without errors
5. Complete wizard
6. Campaign should appear in list

If you see the error again, check browser console for:
```
Failed to parse JSON: <actual response here>
```

This will tell us exactly what the server is returning!
