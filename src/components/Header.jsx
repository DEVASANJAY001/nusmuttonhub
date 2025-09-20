import { useState } from 'react'
import { LogOut, Sun, Moon, User } from 'lucide-react'
import './Header.css'

const Header = ({ user, userRole, onLogout, darkMode, toggleDarkMode }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1>Dashboard</h1>
        </div>

        <div className="header-right">
          {/* Dark Mode Toggle */}
          <button 
            className="header-button"
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User size={20} />
              <span className="user-info">
                <span className="user-email">{user?.email}</span>
                <span className="user-role">{formatRole(userRole)}</span>
              </span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-details">
                  <div className="user-email">{user?.email}</div>
                  <div className="user-role-badge">{formatRole(userRole)}</div>
                </div>
                <button 
                  className="logout-button"
                  onClick={onLogout}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
