# 🔗 Supabase Setup Guide

## Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Fill details:
   - Project name: `mutton-hub`
   - Database password: (create strong password)
   - Region: (choose closest)
5. Click "Create new project"
6. Wait 2-3 minutes for setup

### 2. Get Your Credentials
1. Go to **Settings → API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJ...` (long string)

### 3. Create Environment File
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Setup Database Schema
1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Copy entire content from `supabase-schema.sql`
4. Paste and click **"Run"**

### 5. Test Connection
- The app will show connection test page
- If successful: ✅ Connected Successfully!
- If failed: Check credentials and try again

### 6. Enable Full Application
Once connection is confirmed, edit `src/App.jsx`:

**Replace this:**
```jsx
// Show connection test first
return <ConnectionTest />
```

**With this:**
```jsx
if (loading) {
  return <LoadingSpinner />
}

if (!user) {
  return <Auth />
}

return <Dashboard user={user} userRole={userRole} />
```

### 7. First User Setup
1. Go to sign-up page
2. Use security code: `7904116719`
3. Choose "Owner" role
4. Complete registration
5. Start using the app!

## Troubleshooting

### Connection Failed?
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Ensure database schema was applied

### Authentication Issues?
- Check security code matches in config
- Verify user roles table exists
- Check Row Level Security policies

### Database Errors?
- Re-run the SQL schema
- Check table permissions
- Verify foreign key relationships

## Security Notes

- Keep your database password secure
- Don't commit `.env` file to version control
- The anon key is safe to use in frontend
- Row Level Security protects your data

## Next Steps

After successful setup:
1. Create your first user (Owner role)
2. Add some buyers and sellers
3. Create test transactions
4. Explore all features
5. Customize as needed

Your Mutton Wholesale Management System is ready! 🎉
