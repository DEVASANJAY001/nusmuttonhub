# Setup Guide for Mutton Wholesale Management System

## Quick Start

### 1. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Supabase Project Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy your Project URL and anon/public key
   - Add them to your `.env` file

3. **Setup Database**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the entire content of `supabase-schema.sql`
   - Run the SQL script

### 3. First User Setup

1. **Start the Application**
   ```bash
   npm run dev
   ```

2. **Register First User**
   - Go to the sign-up page
   - Use security code: `7904116719`
   - Choose role: `Owner` (recommended for first user)
   - Complete registration

3. **Verify Setup**
   - Login with your new account
   - Check that you can see all menu items (Owner has full access)
   - Try creating a buyer and seller profile

### 4. Security Configuration

The security code is defined in `src/config/supabase.js`:
```javascript
export const SECURITY_CODE = '7904116719'
```

You can change this to any code you prefer.

### 5. Role Management

- **Owner**: Full access, can manage other users
- **Admin**: Can manage buyers/sellers, cannot view logs
- **Accountant**: Can add entries and settlements, cannot delete

### 6. Testing the System

1. **Create Test Data**
   - Add a few buyer and seller profiles
   - Create some transactions
   - Test settlements

2. **Verify Features**
   - Check reports generation
   - Test export functionality
   - Verify role-based access

### 7. Production Deployment

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting**
   - Upload the `dist` folder to your hosting provider
   - Set environment variables in your hosting platform
   - Ensure HTTPS is enabled

### Troubleshooting

**Common Issues:**

1. **Authentication Errors**
   - Check your Supabase URL and key
   - Verify the database schema is properly set up

2. **Permission Errors**
   - Ensure Row Level Security policies are active
   - Check user role assignments

3. **Database Connection Issues**
   - Verify Supabase project is active
   - Check network connectivity

**Need Help?**
- Check the browser console for errors
- Review Supabase logs in the dashboard
- Ensure all environment variables are set correctly
