import { useState, useEffect } from 'react'
import { supabase, PAYMENT_MODES } from '../config/supabase'
import { Plus, Search, Download, Edit, Trash2 } from 'lucide-react'
import { exportSellers } from '../utils/exportUtils'
import './SellerManagement.css'

const SellerManagement = ({ userRole, onDataChange }) => {
  const [sellers, setSellers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [transactionData, setTransactionData] = useState({
    seller_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    total_weight: '',
    price_per_kg: '',
    total_amount: '',
    paid_amount: '',
    payment_mode: PAYMENT_MODES.CASH
  })

  useEffect(() => {
    loadSellers()
    loadTransactions()
  }, [])

  const loadSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSellers(data || [])
    } catch (error) {
      console.error('Error loading sellers:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_transactions')
        .select(`
          *,
          sellers (name, phone)
        `)
        .order('entry_date', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('sellers')
        .insert([formData])

      if (error) throw error

      setFormData({ name: '', phone: '', address: '' })
      setShowForm(false)
      loadSellers()
      onDataChange?.()
    } catch (error) {
      console.error('Error creating seller:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const totalAmount = transactionData.total_weight * transactionData.price_per_kg
      const remainingBalance = totalAmount - transactionData.paid_amount

      const { error } = await supabase
        .from('seller_transactions')
        .insert([{
          ...transactionData,
          total_amount: totalAmount,
          remaining_balance: remainingBalance
        }])

      if (error) throw error

      // Log the transaction
      await logAction('CREATE', 'seller_transactions', null, {
        ...transactionData,
        total_amount: totalAmount,
        remaining_balance: remainingBalance
      })

      setTransactionData({
        seller_id: '',
        entry_date: new Date().toISOString().split('T')[0],
        total_weight: '',
        price_per_kg: '',
        total_amount: '',
        paid_amount: '',
        payment_mode: PAYMENT_MODES.CASH
      })
      setShowTransactionForm(false)
      loadTransactions()
      onDataChange?.()
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettlement = async (transactionId, amount) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId)
      if (!transaction) return

      const newPaidAmount = transaction.paid_amount + amount
      const newRemainingBalance = transaction.total_amount - newPaidAmount

      const { error } = await supabase
        .from('seller_transactions')
        .update({
          paid_amount: newPaidAmount,
          remaining_balance: newRemainingBalance
        })
        .eq('id', transactionId)

      if (error) throw error

      // Log the settlement
      await logAction('UPDATE', 'seller_transactions', {
        paid_amount: transaction.paid_amount,
        remaining_balance: transaction.remaining_balance
      }, {
        paid_amount: newPaidAmount,
        remaining_balance: newRemainingBalance
      })

      loadTransactions()
      onDataChange?.()
    } catch (error) {
      console.error('Error updating settlement:', error)
    }
  }

  const logAction = async (action, table, oldValues, newValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      await supabase
        .from('audit_logs')
        .insert([{
          action,
          table_name: table,
          old_values: oldValues,
          new_values: newValues,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  const exportToExcel = () => {
    exportSellers(sellers)
  }

  const filteredSellers = sellers.filter(seller =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.phone.includes(searchTerm)
  )

  const filteredTransactions = transactions.filter(transaction =>
    transaction.sellers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.sellers?.phone.includes(searchTerm)
  )

  return (
    <div className="seller-management">
      <div className="page-header">
        <h2>Seller Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add Seller
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus size={20} />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search sellers or transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline" onClick={exportToExcel}>
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Seller Profiles */}
      <div className="section">
        <h3>Seller Profiles</h3>
        <div className="sellers-grid">
          {filteredSellers.map(seller => (
            <div key={seller.id} className="seller-card">
              <div className="seller-info">
                <h4>{seller.name}</h4>
                <p>{seller.phone}</p>
                <p className="address">{seller.address}</p>
              </div>
              <div className="seller-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    setSelectedSeller(seller)
                    setTransactionData(prev => ({ ...prev, seller_id: seller.id }))
                    setShowTransactionForm(true)
                  }}
                >
                  Add Transaction
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="section">
        <h3>Sales Transactions</h3>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Seller</th>
                <th>Weight (KG)</th>
                <th>Price/KG</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
                <th>Payment Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{new Date(transaction.entry_date).toLocaleDateString()}</td>
                  <td>
                    <div>
                      <div>{transaction.sellers?.name}</div>
                      <small>{transaction.sellers?.phone}</small>
                    </div>
                  </td>
                  <td>{transaction.total_weight} KG</td>
                  <td>₹{transaction.price_per_kg}</td>
                  <td>₹{transaction.total_amount.toLocaleString()}</td>
                  <td>₹{transaction.paid_amount.toLocaleString()}</td>
                  <td className={transaction.remaining_balance > 0 ? 'pending' : 'paid'}>
                    ₹{transaction.remaining_balance.toLocaleString()}
                  </td>
                  <td>{transaction.payment_mode}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => {
                          const amount = prompt('Enter settlement amount:')
                          if (amount && !isNaN(amount)) {
                            handleSettlement(transaction.id, parseFloat(amount))
                          }
                        }}
                      >
                        Settle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Seller Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Seller</h3>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Sales Transaction</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTransactionForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="modal-form">
              <div className="form-group">
                <label>Seller</label>
                <select
                  value={transactionData.seller_id}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, seller_id: e.target.value }))}
                  required
                >
                  <option value="">Select Seller</option>
                  {sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>
                      {seller.name} - {seller.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Entry Date</label>
                <input
                  type="date"
                  value={transactionData.entry_date}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, entry_date: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Weight (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={transactionData.total_weight}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, total_weight: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price per KG</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionData.price_per_kg}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, price_per_kg: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Paid Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={transactionData.paid_amount}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, paid_amount: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select
                  value={transactionData.payment_mode}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, payment_mode: e.target.value }))}
                  required
                >
                  <option value={PAYMENT_MODES.CASH}>Cash</option>
                  <option value={PAYMENT_MODES.UPI}>UPI</option>
                  <option value={PAYMENT_MODES.BANK_TRANSFER}>Bank Transfer</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowTransactionForm(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerManagement
