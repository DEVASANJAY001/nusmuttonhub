# 🐐 Mutton Wholesale Management System

A comprehensive web application for managing wholesale goat and mutton trading operations with role-based access control, transaction tracking, and detailed reporting.

## 🚀 Features

### 🔐 Authentication & Roles
- **Secure Sign In/Sign Up** with Supabase Auth
- **Role-based Access Control**: Owner, Admin, Accountant
- **Security Code Protection**: Registration requires code `7904116719`
- **Login Tracking**: Last login details (date, time, IP) - Owner only

### 🐐 Buyer Management (We Buy Goats From Buyers)
- **Buyer Profiles**: Name, Phone, Address management
- **Purchase Entries**: Date, number of goats, total amount, payment tracking
- **Auto-calculated Balances**: Remaining balance updates automatically
- **Settlement Tracking**: Record additional payments with instant balance updates
- **Comprehensive Reports**: View by buyer, date, or date range
- **Export & Print**: Excel export and print-friendly reports

### 🍖 Seller Management (We Sell Goats/Mutton to Sellers)
- **Seller Profiles**: Name, Phone, Address management
- **Sales Entries**: Date, weight (KG), price per KG, auto-calculated totals
- **Payment Tracking**: Cash, UPI, Bank Transfer modes
- **Balance Management**: Automatic remaining balance calculations
- **Settlement System**: Record received payments with instant updates
- **Detailed Reports**: Sales history with export and print options

### 🛡️ Role-Based Permissions

#### Owner (Super User)
- Full access to all features
- View comprehensive audit logs (old → new values, user, role, date, action)
- Access to login history and user management
- Export combined Buyer + Seller reports
- Manage Admin & Accountant roles

#### Admin
- Manage Buyer & Seller profiles
- Add/view entries & settlements
- Export reports
- Cannot view logs or login history

#### Accountant
- Create profiles & add daily entries
- Record settlements
- Export reports
- Cannot delete entries or view logs

### 📊 Reports & Analytics
- **Dashboard Summary**: Pending vs Paid totals for Buyers & Sellers
- **Date Range Reports**: Custom date range filtering
- **Excel Export**: Full data export capabilities
- **Print Support**: Print-friendly invoice and report layouts
- **Real-time Charts**: Visual representation of pending vs paid amounts

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with card layouts
- **Dark/Light Mode**: Toggle between themes with persistent preference
- **Floating Action Button**: Quick add entry on mobile
- **Top Bar Summary**: Real-time pending vs paid totals
- **Persistent Filters**: Search and filter state maintained until cleared

### 📜 Audit & Logging
- **Comprehensive Logging**: Every action (create, update, delete, settlement) logged
- **Immutable Logs**: All changes tracked with old/new values
- **User Tracking**: Logs include user, role, date, time, and action type
- **Owner-Only Access**: Audit logs visible only to Owner role

## 🛠️ Tech Stack

- **Frontend**: Vite + React (JSX)
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Styling**: CSS3 with CSS Variables for theming
- **Icons**: Lucide React
- **Charts**: Recharts
- **Export**: XLSX library
- **Date Handling**: date-fns

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nsmuttonhub
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

#### Database Setup
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL schema from `supabase-schema.sql`

#### Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Security Code
The registration security code is set to `7904116719` in `src/config/supabase.js`. You can change this value as needed.

### User Roles
Default roles are defined in `src/config/supabase.js`:
- `owner`: Full system access
- `admin`: Management access without logs
- `accountant`: Entry and settlement access

## 📱 Usage

### First Time Setup
1. Start the application
2. Click "Sign Up"
3. Enter the security code: `7904116719`
4. Choose your role (Owner recommended for first user)
5. Complete registration

### Daily Operations
1. **Add Buyers/Sellers**: Create profiles for your trading partners
2. **Record Transactions**: Add purchase/sales entries with payment details
3. **Track Settlements**: Record additional payments as they come in
4. **Generate Reports**: Export data or print invoices as needed
5. **Monitor Activity**: View audit logs and login history (Owner only)

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Role-based Permissions**: Granular access control
- **Audit Logging**: Complete action tracking
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Input Validation**: Client and server-side validation

## 📊 Database Schema

The system uses the following main tables:
- `user_roles`: User role assignments
- `buyers`: Buyer profile information
- `sellers`: Seller profile information
- `buyer_transactions`: Purchase transaction records
- `seller_transactions`: Sales transaction records
- `audit_logs`: System activity logs
- `login_logs`: User login tracking

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository to Vercel or Netlify
2. Set environment variables in the deployment platform
3. Deploy automatically on push to main branch

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Create an issue in the repository

---

**Built with ❤️ for efficient mutton wholesale management**