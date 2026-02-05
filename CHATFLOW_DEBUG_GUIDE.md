# 🔍 Chatflow Debug Guide - Config Not Loading Issue

**Date:** 2026-02-05  
**Issue:** Node properties tersimpan ke backend, tapi tidak muncul lagi setelah buka node properties

---

## 🎯 Current Status

### ✅ What's Working:
- Config updates in UI (properties panel)
- Save to backend (returns 200 OK)
- Backend receives config data

### ❌ What's NOT Working:
- Config tidak muncul setelah refresh halaman
- Properties panel kosong ketika buka node lagi

---

## 🔍 Enhanced Logging Added

### **Frontend Logging:**

1. **Config Components** - Logs setiap config update
2. **ChatflowStudio onUpdate** - Logs ketika nodes state di-update
3. **ChatflowStudio handleSave** - Logs complete save process
4. **ChatflowStudio loadChatflow** - **NEW!** Logs apa yang di-load dari backend
5. **ChatflowContext updateChatflow** - Logs API request/response
6. **ChatflowContext getChatflowById** - **NEW!** Logs apa yang dikembalikan backend

### **Backend Logging:**

7. **getChatflow** - **NEW!** Logs apa yang di-retrieve dari KV store
8. **updateChatflow** - **NEW!** Logs apa yang di-save ke KV store + verification read

---

## 🧪 Testing Protocol - Complete Debug Session

### **Step 1: Clear Console & Start Fresh**

1. Open browser DevTools (F12) → Console tab
2. Click "Clear console" button (or Ctrl+L)
3. Keep console open for entire test

### **Step 2: Create & Save Node with Config**

1. **Navigate to Chatflow Studio**
2. **Create new chatflow** or open existing
3. **Drag "Send Template" node** to canvas
4. **Click node** to select
5. **Select a template** from dropdown in properties panel
6. **Watch console** - Should see:
   ```
   📝 SendTemplateConfig updating: {...}
   🔄 ChatflowStudio.onUpdate called: {...}
   ✅ Nodes state updated
   ```
7. **Click Save button**
8. **Watch console** - Should see:
   ```
   💾 ========== SAVE CHATFLOW START ==========
   Node 1: { hasConfig: true, config: {...} }
   📤 Sending payload to backend
   🌐 ChatflowContext.updateChatflow called
   📥 Response status: 200 OK
   ✅ Chatflow saved successfully
   💾 ========== SAVE CHATFLOW END ==========
   ```

**✅ Checkpoint 1:** Config saved to backend successfully

### **Step 3: Check Backend Logs (IMPORTANT!)**

9. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/uvqbmlnavztzobfaiqao/functions
   - Click on **"make-server-deeab278"**
   - Click **"Logs"** tab
   - Sort by newest first

10. **Look for these backend logs:**
    ```
    🔧 updateChatflow called: {...}
    🔧 Updates.nodes count: X
    🔧 Update Node 1: { hasConfig: true, config: {...} }
    ✅ Saved to KV store with key: chatflow:...
    ✅ Verified from KV - nodes count: X
    ```

**✅ Checkpoint 2:** Backend received and saved config to KV store

### **Step 4: Refresh & Load**

11. **Note the chatflow ID** from URL (e.g., `/chatflow/chatflow_1234567890`)
12. **Refresh the page** (F5 or Ctrl+R)
13. **Watch console carefully** - Should see:
    ```
    🔍 getChatflowById called for ID: chatflow_1234567890
    📥 getChatflowById response status: 200
    ✅ getChatflowById raw response: {...}
    ✅ getChatflowById chatflow.nodes: [...]
    ✅ Nodes in response:
      Node 1: { hasConfig: true/false, config: {...} }
    
    📥 ========== LOAD CHATFLOW ==========
    🔍 Loaded chatflow: {...}
    🔍 Nodes from backend: [...]
    Loaded Node 1: { hasConfig: true/false, config: {...} }
    ✅ Setting nodes state with: [...]
    📥 ========== LOAD CHATFLOW END ==========
    ```

**🔍 Critical Question:** Di log "Loaded Node 1", apakah `hasConfig: true` atau `false`?

### **Step 5: Check Backend Load Logs**

14. **Go back to Supabase Dashboard** → Functions → Logs
15. **Look for getChatflow logs:**
    ```
    🔍 getChatflow backend called: { id: "...", projectId: "..." }
    🔍 Getting chatflow with key: chatflow:...
    ✅ Found chatflow, nodes count: X
    ✅ Backend Node 1: { hasConfig: true/false, config: {...} }
    ```

**🔍 Critical Question:** Di backend log, apakah node memiliki config?

### **Step 6: Open Node Properties**

16. **Click the node** to open properties panel
17. **Check if template is selected** in dropdown

**🔍 Critical Question:** Apakah template yang dipilih muncul?

---

## 📊 Diagnostic Decision Tree

### **Scenario A: hasConfig: false in Save Logs**

**Symptom:** Di save logs, `Node X: { hasConfig: false }`

**Diagnosis:** Config tidak masuk ke nodes state

**Check:**
- Apakah ada log `📝 [NodeType]Config updating`?
- Apakah ada log `🔄 ChatflowStudio.onUpdate called`?
- Di log onUpdate, apakah `config` ada?

**Fix:** Issue di config component atau ChatflowStudio onUpdate

---

### **Scenario B: hasConfig: true in Save, false in Backend Logs**

**Symptom:** 
- Save: `hasConfig: true, config: {...}`
- Backend: `🔧 Update Node 1: { hasConfig: false }`

**Diagnosis:** Config hilang saat dikirim ke backend (serialization issue?)

**Check:**
- Log `📤 Sending payload to backend` - apakah payload contains config?
- Log `🌐 ChatflowContext.updateChatflow` - apakah request body contains config?

**Fix:** Issue di frontend API call atau serialization

---

### **Scenario C: hasConfig: true in Backend Save, false in Backend Load**

**Symptom:**
- Backend save: `✅ Verified from KV - nodes count: X` (with config)
- Backend load: `✅ Backend Node 1: { hasConfig: false }`

**Diagnosis:** Config tidak tersimpan ke KV store, atau KV store corrupted

**Check:**
- Verify backend save logs: `🔧 Update Node 1: { hasConfig: true }`
- Verify backend save logs: `✅ Verified from KV`
- Compare save logs vs load logs

**Fix:** Issue di KV store save/retrieve logic

---

### **Scenario D: hasConfig: true in Backend Load, false in Frontend Load**

**Symptom:**
- Backend load: `✅ Backend Node 1: { hasConfig: true, config: {...} }`
- Frontend load: `Loaded Node 1: { hasConfig: false }`

**Diagnosis:** Config hilang saat di-return dari backend ke frontend

**Check:**
- Log `✅ getChatflowById raw response` - apakah response contains nodes with config?
- Log `🔍 Nodes from backend` - apakah nodes array contains config?

**Fix:** Issue di backend response atau frontend parsing

---

### **Scenario E: hasConfig: true in Frontend Load, false in Properties Panel**

**Symptom:**
- Frontend load: `Loaded Node 1: { hasConfig: true, config: {...} }`
- Properties panel: Template dropdown shows "Select Template" (empty)

**Diagnosis:** Config components tidak membaca config dengan benar

**Check:**
- Inspect node object di properties panel
- Check if config structure matches what component expects

**Fix:** Issue di config component read logic

---

## 🎯 Action Items Based on Results

### **After running complete test:**

1. **Copy ALL console logs** (frontend)
2. **Copy ALL backend logs** from Supabase dashboard
3. **Identify which scenario** matches your situation
4. **Share logs** untuk further debugging

---

## 🔧 Quick Fixes to Try

### **Fix 1: Verify Backend Deployment**

```bash
cd /Users/wistikai/Documents/2.BaleDauh
npx supabase functions deploy make-server-deeab278 --project-ref uvqbmlnavztzobfaiqao
```

### **Fix 2: Clear Browser Cache**

1. Open DevTools (F12)
2. Right-click Refresh button
3. Click "Empty Cache and Hard Reload"

### **Fix 3: Check Node Structure**

Open console, select node, run:
```javascript
console.log('Selected node:', selectedNode);
console.log('Node config:', selectedNode?.data?.config);
```

### **Fix 4: Check Backend Response**

In Network tab (F12):
1. Find GET request to `/chatflows/{id}`
2. Click on it
3. Go to "Response" tab
4. Check if `chatflow.nodes[].data.config` exists

---

## 📝 What to Share for Debugging

### **Frontend Logs:**
```
[Copy all logs from browser console, from page load to opening node]
```

### **Backend Logs:**
```
[Copy logs from Supabase Dashboard → Functions → Logs]
```

### **Screenshots:**
1. Properties panel (showing empty dropdown)
2. Console logs (showing load sequence)
3. Backend logs (showing getChatflow)

---

## 🚀 Next Steps

1. **Run complete test** following protocol above
2. **Identify scenario** that matches your situation
3. **Share logs** (frontend + backend)
4. **Try quick fixes** if applicable

---

**Ready to debug!** 🔍

Follow the testing protocol step-by-step dan catat di scenario mana masalahnya terjadi.
