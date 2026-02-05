# Balemoo Authentication System - Demo Instructions

## 🎯 Overview

Your Balemoo website now has a complete role-based authentication system with three user roles:

### User Roles & Permissions

1. **Admin** - Full access to all features
   - ✅ kabar.in (Guest CRM & WhatsApp)
   - ✅ check.in (QR Check-in System)
   - ✅ monitor.in (Analytics Dashboard)

2. **Staff** - Limited access for event staff
   - ❌ kabar.in (Locked)
   - ✅ check.in (QR Check-in System)
   - ✅ monitor.in (Analytics Dashboard)

3. **User** - Monitoring only
   - ❌ kabar.in (Locked)
   - ❌ check.in (Locked)
   - ✅ monitor.in (Analytics Dashboard)

## 🚀 Quick Start - Testing the System

### Option 1: Quick Demo Access (Recommended)

1. Click "Login" from the landing page
2. Click "Try Quick Demo Access →" at the bottom
3. Choose a role card and click the button to instantly create and log in

**Demo Credentials:**
- **Admin:** demo-admin@balemoo.com / demo12345
- **Staff:** demo-staff@balemoo.com / demo12345
- **User:** demo-user@balemoo.com / demo12345

### Option 2: Manual Sign Up

1. Click "Login" from the landing page
2. Click "Don't have an account? Sign up"
3. Enter your details (email, password, name)
4. Sign up with default "user" role
5. Log in with your credentials

## 🎨 User Interface Flow

### Landing Page
- **Header:** "Login" button (top right, glassmorphism style)
- **Hero Section:** "Get Started" button (center, prominent CTA)

### Login Page
- Email & password authentication
- Toggle between Sign Up / Sign In
- Error handling with shake animation
- Link to Quick Demo Access

### Dashboard
- Personalized welcome message
- Three product cards with role-based access
- **Enabled cards:** Full color, hover lift effect, clickable
- **Disabled cards:** Grayscale, locked icon, tooltip on hover
- **Shake animation** when clicking locked cards
- Role badge displayed at bottom
- Sign Out button (top right)

### Product Pages
- kabar.in - Guest CRM features
- check.in - QR check-in system
- monitor.in - Analytics dashboard
- Each has "Back to Dashboard" button

## 🧪 Testing Different Roles

### Test as Admin
1. Use demo-admin@balemoo.com / demo12345
2. All three product cards should be enabled
3. Click any card to navigate to its page
4. Return to dashboard and test other cards

### Test as Staff
1. Use demo-staff@balemoo.com / demo12345
2. kabar.in should be locked (grayscale + lock icon)
3. check.in and monitor.in should be enabled
4. Try clicking the locked kabar.in card - it should shake
5. Hover over locked card to see tooltip

### Test as User
1. Use demo-user@balemoo.com / demo12345
2. Only monitor.in should be enabled
3. kabar.in and check.in should be locked
4. Test the shake animation on locked cards

## 🎭 UX Features to Test

### Animations
- ✅ Smooth 700-900ms ease-out transitions throughout
- ✅ Staggered card fade-ins on dashboard
- ✅ Shake animation on login errors
- ✅ Shake animation on clicking locked cards
- ✅ Scale-up hover effect on buttons (1.03x)
- ✅ Glassmorphism effects throughout

### Interactions
- ✅ Login button hover states
- ✅ Card hover lift effect (enabled cards only)
- ✅ Tooltip fade-in on disabled card hover
- ✅ Loading states with spinners
- ✅ Error messages with soft animations

### Visual Feedback
- ✅ Locked cards show lock icon overlay
- ✅ Disabled cards are grayscale with 50% opacity
- ✅ Hover tooltips explain access restrictions
- ✅ Role badge shows current user role

## 🔐 Backend Features

### Authentication
- Email & password authentication via Supabase
- Automatic email confirmation (no email server needed)
- Session management with access tokens
- Secure role storage in user metadata

### Server Endpoints
- `POST /make-server-deeab278/signup` - Create new user
- `GET /make-server-deeab278/user/role` - Get user role (protected)

## 🎨 Design System

All components follow Apple's minimal aesthetic:
- **Font:** Inter (system fallback to -apple-system)
- **Colors:** Clean blacks (#1a1a1a) and grays (#6b6b6b)
- **Background:** Soft iOS-style ambient gradients with pastels
- **Effects:** Glassmorphism with backdrop-blur
- **Spacing:** Generous white space throughout
- **Radius:** Rounded corners (12-16px) and pills (full)

## 📝 Notes for Development

- All routes are protected with AuthProvider
- User session persists on page refresh
- Sign out clears session and redirects to home
- Product pages are placeholders ("Coming Soon")
- Role logic is centralized in Dashboard component
- Inline styles maintain Apple-style consistency

## 🐛 Troubleshooting

**Issue:** Demo user already exists
- **Solution:** The system will redirect you to login page. Use the credentials above to log in.

**Issue:** Authentication failed
- **Solution:** Check your Supabase connection and ensure the server is running.

**Issue:** Cards not showing correct access
- **Solution:** Check the user's role in the database user_metadata field.

---

**Enjoy testing your beautiful Apple-style authentication system! 🚀**
