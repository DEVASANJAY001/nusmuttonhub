import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { Download, Printer, Calendar, TrendingUp } from 'lucide-react'
import { exportBuyerTransactions, exportSellerTransactions, exportCombinedReport } from '../utils/exportUtils'
import './Reports.css'

const Reports = ({ userRole }) => {
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  const [buyerReports, setBuyerReports] = useState([])
  const [sellerReports, setSellerReports] = useState([])
  const [summary, setSummary] = useState({
    totalBuyerAmount: 0,
    totalSellerAmount: 0,
    pendingBuyerAmount: 0,
    pendingSellerAmount: 0
  })

  useEffect(() => {
    loadReports()
  }, [dateRange])

  const loadReports = async () => {
    try {
      // Load buyer transactions
      const { data: buyerData } = await supabase
        .from('buyer_transactions')
        .select(`
          *,
          buyers (name, phone)
        `)
        .gte('entry_date', dateRange.start)
        .lte('entry_date', dateRange.end)

      // Load seller transactions
      const { data: sellerData } = await supabase
        .from('seller_transactions')
        .select(`
          *,
          sellers (name, phone)
        `)
        .gte('entry_date', dateRange.start)
        .lte('entry_date', dateRange.end)

      setBuyerReports(buyerData || [])
      setSellerReports(sellerData || [])

      // Calculate summary
      const buyerTotals = buyerData?.reduce((acc, t) => ({
        total: acc.total + t.total_amount,
        pending: acc.pending + t.remaining_balance
      }), { total: 0, pending: 0 }) || { total: 0, pending: 0 }

      const sellerTotals = sellerData?.reduce((acc, t) => ({
        total: acc.total + t.total_amount,
        pending: acc.pending + t.remaining_balance
      }), { total: 0, pending: 0 }) || { total: 0, pending: 0 }

      setSummary({
        totalBuyerAmount: buyerTotals.total,
        totalSellerAmount: sellerTotals.total,
        pendingBuyerAmount: buyerTotals.pending,
        pendingSellerAmount: sellerTotals.pending
      })
    } catch (error) {
      console.error('Error loading reports:', error)
    }
  }

  const exportToExcel = () => {
    exportCombinedReport(buyerReports, sellerReports, dateRange)
  }

  const exportBuyerExcel = () => {
    exportBuyerTransactions(buyerReports, dateRange)
  }

  const exportSellerExcel = () => {
    exportSellerTransactions(sellerReports, dateRange)
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="reports">
      <div className="page-header">
        <h2>Reports & Analytics</h2>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={exportToExcel}>
            <Download size={20} />
            Export Excel
          </button>
          <button className="btn btn-outline" onClick={printReport}>
            <Printer size={20} />
            Print
          </button>
        </div>
      </div>

      <div className="date-range-selector">
        <div className="date-inputs">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-header">
            <h3>Buyer Summary</h3>
            <TrendingUp size={24} />
          </div>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Amount</span>
              <span className="stat-value">₹{summary.totalBuyerAmount.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pending</span>
              <span className="stat-value pending">₹{summary.pendingBuyerAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-header">
            <h3>Seller Summary</h3>
            <TrendingUp size={24} />
          </div>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total Amount</span>
              <span className="stat-value">₹{summary.totalSellerAmount.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Pending</span>
              <span className="stat-value pending">₹{summary.pendingSellerAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-header">
          <h3>Buyer Transactions</h3>
          <button className="btn btn-sm btn-outline" onClick={exportBuyerExcel}>
            <Download size={16} />
            Export
          </button>
        </div>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Buyer</th>
                <th>Goats</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {buyerReports.map(transaction => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="reports-section">
        <div className="section-header">
          <h3>Seller Transactions</h3>
          <button className="btn btn-sm btn-outline" onClick={exportSellerExcel}>
            <Download size={16} />
            Export
          </button>
        </div>
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Seller</th>
                <th>Weight</th>
                <th>Price/KG</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {sellerReports.map(transaction => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
