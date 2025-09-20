import { useState, useEffect } from 'react'
import { supabase, ROLES } from '../config/supabase'
import Sidebar from './Sidebar'
import Header from './Header'
import BuyerManagement from './BuyerManagement'
import SellerManagement from './SellerManagement'
import Reports from './Reports'
import Logs from './Logs'
import UserManagement from './UserManagement'
import './Dashboard.css'

const Dashboard = ({ user, userRole }) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [summary, setSummary] = useState({
    totalBuyers: 0,
    totalSellers: 0,
    pendingBuyerAmount: 0,
    paidBuyerAmount: 0,
    pendingSellerAmount: 0,
    paidSellerAmount: 0
  })
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    
    // Load dashboard summary
    loadSummary()
  }, [])

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const loadSummary = async () => {
    try {
      // Get buyer summary
      const { data: buyerData } = await supabase
        .from('buyer_transactions')
        .select('total_amount, paid_amount')

      // Get seller summary
      const { data: sellerData } = await supabase
        .from('seller_transactions')
        .select('total_amount, paid_amount')

      // Get profile counts
      const { count: buyerCount } = await supabase
        .from('buyers')
        .select('*', { count: 'exact', head: true })

      const { count: sellerCount } = await supabase
        .from('sellers')
        .select('*', { count: 'exact', head: true })

      // Calculate totals
      const buyerTotals = buyerData?.reduce((acc, transaction) => ({
        total: acc.total + (transaction.total_amount || 0),
        paid: acc.paid + (transaction.paid_amount || 0)
      }), { total: 0, paid: 0 }) || { total: 0, paid: 0 }

      const sellerTotals = sellerData?.reduce((acc, transaction) => ({
        total: acc.total + (transaction.total_amount || 0),
        paid: acc.paid + (transaction.paid_amount || 0)
      }), { total: 0, paid: 0 }) || { total: 0, paid: 0 }

      setSummary({
        totalBuyers: buyerCount || 0,
        totalSellers: sellerCount || 0,
        pendingBuyerAmount: buyerTotals.total - buyerTotals.paid,
        paidBuyerAmount: buyerTotals.paid,
        pendingSellerAmount: sellerTotals.total - sellerTotals.paid,
        paidSellerAmount: sellerTotals.paid
      })
    } catch (error) {
      console.error('Error loading summary:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'buyers':
        return <BuyerManagement userRole={userRole} onDataChange={loadSummary} />
      case 'sellers':
        return <SellerManagement userRole={userRole} onDataChange={loadSummary} />
      case 'reports':
        return <Reports userRole={userRole} />
      case 'logs':
        return userRole === ROLES.OWNER ? <Logs /> : null
      case 'users':
        return userRole === ROLES.OWNER ? <UserManagement /> : null
      default:
        return (
          <div className="dashboard-content">
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Buyers</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{summary.totalBuyers}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value pending">₹{summary.pendingBuyerAmount.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Paid</span>
                    <span className="stat-value paid">₹{summary.paidBuyerAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h3>Sellers</h3>
                <div className="summary-stats">
                  <div className="stat">
                    <span className="stat-label">Total</span>
                    <span className="stat-value">{summary.totalSellers}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value pending">₹{summary.pendingSellerAmount.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Paid</span>
                    <span className="stat-value paid">₹{summary.paidSellerAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-welcome">
              <h2>Welcome to Mutton Hub</h2>
              <p>Manage your wholesale goat and mutton trading operations efficiently.</p>
              <div className="quick-actions">
                <button 
                  className="action-button"
                  onClick={() => setActiveTab('buyers')}
                >
                  Manage Buyers
                </button>
                <button 
                  className="action-button"
                  onClick={() => setActiveTab('sellers')}
                >
                  Manage Sellers
                </button>
                <button 
                  className="action-button"
                  onClick={() => setActiveTab('reports')}
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole}
      />
      <div className="dashboard-main">
        <Header 
          user={user} 
          userRole={userRole}
          onLogout={handleLogout}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <main className="dashboard-content-wrapper">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default Dashboard
