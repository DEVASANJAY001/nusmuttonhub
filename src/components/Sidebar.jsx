import { useState } from 'react'
import { 
  Home, 
  Users, 
  ShoppingCart, 
  FileText, 
  History, 
  Settings,
  Menu,
  X
} from 'lucide-react'
import { ROLES } from '../config/supabase'
import './Sidebar.css'

const Sidebar = ({ activeTab, setActiveTab, userRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.ACCOUNTANT] },
    { id: 'buyers', label: 'Buyers', icon: Users, roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.ACCOUNTANT] },
    { id: 'sellers', label: 'Sellers', icon: ShoppingCart, roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.ACCOUNTANT] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.ACCOUNTANT] },
    { id: 'logs', label: 'Logs', icon: History, roles: [ROLES.OWNER] },
    { id: 'users', label: 'User Management', icon: Settings, roles: [ROLES.OWNER] }
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  const handleMenuClick = (tabId) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2>🐐 Mutton Hub</h2>
          <p>Wholesale Management</p>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-role">
            <span className="role-label">Role:</span>
            <span className={`role-badge role-${userRole}`}>
              {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Unknown'}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
