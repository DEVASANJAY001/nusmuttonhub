import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { Search, Filter, Download } from 'lucide-react'
import { exportAuditLogs } from '../utils/exportUtils'
import './Logs.css'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    action: '',
    table: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    loadLogs()
  }, [filters])

  const loadLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user_roles (role)
        `)
        .order('created_at', { ascending: false })

      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      if (filters.table) {
        query = query.eq('table_name', filters.table)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59')
      }

      const { data, error } = await query

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = () => {
    exportAuditLogs(logs)
  }

  const formatValue = (value) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return value
  }

  return (
    <div className="logs">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={exportLogs}>
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters-grid">
          <div className="form-group">
            <label>Action</label>
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>

          <div className="form-group">
            <label>Table</label>
            <select
              value={filters.table}
              onChange={(e) => setFilters(prev => ({ ...prev, table: e.target.value }))}
            >
              <option value="">All Tables</option>
              <option value="buyers">Buyers</option>
              <option value="sellers">Sellers</option>
              <option value="buyer_transactions">Buyer Transactions</option>
              <option value="seller_transactions">Seller Transactions</option>
              <option value="user_roles">User Roles</option>
            </select>
          </div>

          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="logs-table">
        <table>
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Action</th>
              <th>Table</th>
              <th>User Role</th>
              <th>Old Values</th>
              <th>New Values</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="loading-cell">
                  Loading logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div className="datetime">
                      <div>{new Date(log.created_at).toLocaleDateString()}</div>
                      <small>{new Date(log.created_at).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <span className={`action-badge action-${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.table_name}</td>
                  <td>
                    <span className="role-badge">
                      {log.user_roles?.role || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <div className="values-cell">
                      {log.old_values ? (
                        <pre>{formatValue(log.old_values)}</pre>
                      ) : (
                        <span className="no-data">-</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="values-cell">
                      {log.new_values ? (
                        <pre>{formatValue(log.new_values)}</pre>
                      ) : (
                        <span className="no-data">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Logs
