import { useState, useEffect } from 'react'
import { supabase, PAYMENT_MODES } from '../config/supabase'
import { Plus, Search, Download, Printer, Edit, Trash2 } from 'lucide-react'
import { exportBuyers } from '../utils/exportUtils'
import './BuyerManagement.css'

const BuyerManagement = ({ userRole, onDataChange }) => {
  const [buyers, setBuyers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [selectedBuyer, setSelectedBuyer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [transactionData, setTransactionData] = useState({
    buyer_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    number_of_goats: '',
    total_amount: '',
    paid_amount: '',
    payment_mode: PAYMENT_MODES.CASH
  })

  useEffect(() => {
    loadBuyers()
    loadTransactions()
  }, [])

  const loadBuyers = async () => {
    try {
      const { data, error } = await supabase
        .from('buyers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBuyers(data || [])
    } catch (error) {
      console.error('Error loading buyers:', error)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('buyer_transactions')
        .select(`
          *,
          buyers (name, phone)
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
        .from('buyers')
        .insert([formData])

      if (error) throw error

      setFormData({ name: '', phone: '', address: '' })
      setShowForm(false)
      loadBuyers()
      onDataChange?.()
    } catch (error) {
      console.error('Error creating buyer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const remainingBalance = transactionData.total_amount - transactionData.paid_amount

      const { error } = await supabase
        .from('buyer_transactions')
        .insert([{
          ...transactionData,
          remaining_balance: remainingBalance
        }])

      if (error) throw error

      // Log the transaction
      await logAction('CREATE', 'buyer_transactions', null, {
        ...transactionData,
        remaining_balance: remainingBalance
      })

      setTransactionData({
        buyer_id: '',
        entry_date: new Date().toISOString().split('T')[0],
        number_of_goats: '',
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
        .from('buyer_transactions')
        .update({
          paid_amount: newPaidAmount,
          remaining_balance: newRemainingBalance
        })
        .eq('id', transactionId)

      if (error) throw error

      // Log the settlement
      await logAction('UPDATE', 'buyer_transactions', {
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
    exportBuyers(buyers)
  }

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.phone.includes(searchTerm)
  )

  const filteredTransactions = transactions.filter(transaction =>
    transaction.buyers?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.buyers?.phone.includes(searchTerm)
  )

  return (
    <div className="buyer-management">
      <div className="page-header">
        <h2>Buyer Management</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add Buyer
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
            placeholder="Search buyers or transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline" onClick={exportToExcel}>
          <Download size={20} />
          Export
        </button>
      </div>

      {/* Buyer Profiles */}
      <div className="section">
        <h3>Buyer Profiles</h3>
        <div className="buyers-grid">
          {filteredBuyers.map(buyer => (
            <div key={buyer.id} className="buyer-card">
              <div className="buyer-info">
                <h4>{buyer.name}</h4>
                <p>{buyer.phone}</p>
                <p className="address">{buyer.address}</p>
              </div>
              <div className="buyer-actions">
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    setSelectedBuyer(buyer)
                    setTransactionData(prev => ({ ...prev, buyer_id: buyer.id }))
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
        <h3>Purchase Transactions</h3>
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Buyer</th>
                <th>Goats</th>
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
                      <div>{transaction.buyers?.name}</div>
                      <small>{transaction.buyers?.phone}</small>
                    </div>
                  </td>
                  <td>{transaction.number_of_goats}</td>
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

      {/* Add Buyer Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Buyer</h3>
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
                  {loading ? 'Adding...' : 'Add Buyer'}
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
              <h3>Add Purchase Transaction</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTransactionForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleTransactionSubmit} className="modal-form">
              <div className="form-group">
                <label>Buyer</label>
                <select
                  value={transactionData.buyer_id}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, buyer_id: e.target.value }))}
                  required
                >
                  <option value="">Select Buyer</option>
                  {buyers.map(buyer => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.name} - {buyer.phone}
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
                <label>Number of Goats</label>
                <input
                  type="number"
                  value={transactionData.number_of_goats}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, number_of_goats: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Total Amount</label>
                <input
                  type="number"
                  value={transactionData.total_amount}
                  onChange={(e) => setTransactionData(prev => ({ ...prev, total_amount: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Paid Amount</label>
                <input
                  type="number"
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

export default BuyerManagement
