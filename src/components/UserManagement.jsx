import { useState, useEffect } from 'react'
import { supabase, ROLES } from '../config/supabase'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'
import './UserManagement.css'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    role: ROLES.ACCOUNTANT
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          auth.users (email, created_at, last_sign_in_at)
        `)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingUser) {
        // Update existing user role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', editingUser.user_id)

        if (error) throw error
      } else {
        // Create new user (this would typically be done through auth)
        // For now, we'll just show a message
        alert('User creation should be done through the sign-up process')
      }

      setFormData({ email: '', role: ROLES.ACCOUNTANT })
      setShowForm(false)
      setEditingUser(null)
      loadUsers()
    } catch (error) {
      console.error('Error managing user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) return

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString()
  }

  const getRoleColor = (role) => {
    switch (role) {
      case ROLES.OWNER:
        return 'role-owner'
      case ROLES.ADMIN:
        return 'role-admin'
      case ROLES.ACCOUNTANT:
        return 'role-accountant'
      default:
        return 'role-default'
    }
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add User
          </button>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.user_id}>
                <td>
                  <div className="user-info">
                    <div className="email">{user.auth?.users?.email || 'Unknown'}</div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td>{formatDate(user.auth?.users?.created_at)}</td>
                <td>{formatDate(user.auth?.users?.last_sign_in_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setEditingUser(user)
                        setFormData({
                          email: user.auth?.users?.email || '',
                          role: user.role
                        })
                        setShowForm(true)
                      }}
                    >
                      <Edit size={16} />
                      Edit Role
                    </button>
                    {user.role !== ROLES.OWNER && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(user.user_id)}
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User Role' : 'Add New User'}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false)
                  setEditingUser(null)
                  setFormData({ email: '', role: ROLES.ACCOUNTANT })
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value={ROLES.ACCOUNTANT}>Accountant</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.OWNER}>Owner</option>
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForm(false)
                    setEditingUser(null)
                    setFormData({ email: '', role: ROLES.ACCOUNTANT })
                  }}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : (editingUser ? 'Update Role' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
