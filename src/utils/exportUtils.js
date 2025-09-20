import * as XLSX from 'xlsx'

// Export buyer transactions to Excel
export const exportBuyerTransactions = (transactions, dateRange) => {
  const worksheetData = transactions.map(transaction => ({
    'Date': new Date(transaction.entry_date).toLocaleDateString(),
    'Buyer Name': transaction.buyers?.name || 'Unknown',
    'Buyer Phone': transaction.buyers?.phone || '',
    'Number of Goats': transaction.number_of_goats,
    'Total Amount': transaction.total_amount,
    'Paid Amount': transaction.paid_amount,
    'Remaining Balance': transaction.remaining_balance,
    'Payment Mode': transaction.payment_mode,
    'Status': transaction.remaining_balance > 0 ? 'Pending' : 'Paid'
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyer Transactions')

  // Add summary sheet
  const summaryData = [
    ['Buyer Transactions Summary'],
    [''],
    ['Total Transactions', transactions.length],
    ['Total Amount', transactions.reduce((sum, t) => sum + t.total_amount, 0)],
    ['Total Paid', transactions.reduce((sum, t) => sum + t.paid_amount, 0)],
    ['Total Pending', transactions.reduce((sum, t) => sum + t.remaining_balance, 0)],
    [''],
    ['Date Range', `${dateRange.start} to ${dateRange.end}`],
    ['Generated On', new Date().toLocaleString()]
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const fileName = `buyer-transactions-${dateRange.start}-to-${dateRange.end}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Export seller transactions to Excel
export const exportSellerTransactions = (transactions, dateRange) => {
  const worksheetData = transactions.map(transaction => ({
    'Date': new Date(transaction.entry_date).toLocaleDateString(),
    'Seller Name': transaction.sellers?.name || 'Unknown',
    'Seller Phone': transaction.sellers?.phone || '',
    'Weight (KG)': transaction.total_weight,
    'Price per KG': transaction.price_per_kg,
    'Total Amount': transaction.total_amount,
    'Paid Amount': transaction.paid_amount,
    'Remaining Balance': transaction.remaining_balance,
    'Payment Mode': transaction.payment_mode,
    'Status': transaction.remaining_balance > 0 ? 'Pending' : 'Paid'
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Seller Transactions')

  // Add summary sheet
  const summaryData = [
    ['Seller Transactions Summary'],
    [''],
    ['Total Transactions', transactions.length],
    ['Total Amount', transactions.reduce((sum, t) => sum + t.total_amount, 0)],
    ['Total Paid', transactions.reduce((sum, t) => sum + t.paid_amount, 0)],
    ['Total Pending', transactions.reduce((sum, t) => sum + t.remaining_balance, 0)],
    ['Total Weight (KG)', transactions.reduce((sum, t) => sum + t.total_weight, 0)],
    [''],
    ['Date Range', `${dateRange.start} to ${dateRange.end}`],
    ['Generated On', new Date().toLocaleString()]
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const fileName = `seller-transactions-${dateRange.start}-to-${dateRange.end}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Export combined report
export const exportCombinedReport = (buyerTransactions, sellerTransactions, dateRange) => {
  const workbook = XLSX.utils.book_new()

  // Buyer transactions sheet
  const buyerData = buyerTransactions.map(transaction => ({
    'Type': 'Purchase',
    'Date': new Date(transaction.entry_date).toLocaleDateString(),
    'Party Name': transaction.buyers?.name || 'Unknown',
    'Party Phone': transaction.buyers?.phone || '',
    'Details': `${transaction.number_of_goats} goats`,
    'Amount': transaction.total_amount,
    'Paid': transaction.paid_amount,
    'Remaining': transaction.remaining_balance,
    'Payment Mode': transaction.payment_mode,
    'Status': transaction.remaining_balance > 0 ? 'Pending' : 'Paid'
  }))

  const buyerSheet = XLSX.utils.json_to_sheet(buyerData)
  XLSX.utils.book_append_sheet(workbook, buyerSheet, 'Buyer Transactions')

  // Seller transactions sheet
  const sellerData = sellerTransactions.map(transaction => ({
    'Type': 'Sale',
    'Date': new Date(transaction.entry_date).toLocaleDateString(),
    'Party Name': transaction.sellers?.name || 'Unknown',
    'Party Phone': transaction.sellers?.phone || '',
    'Details': `${transaction.total_weight} KG @ ₹${transaction.price_per_kg}/KG`,
    'Amount': transaction.total_amount,
    'Paid': transaction.paid_amount,
    'Remaining': transaction.remaining_balance,
    'Payment Mode': transaction.payment_mode,
    'Status': transaction.remaining_balance > 0 ? 'Pending' : 'Paid'
  }))

  const sellerSheet = XLSX.utils.json_to_sheet(sellerData)
  XLSX.utils.book_append_sheet(workbook, sellerSheet, 'Seller Transactions')

  // Combined summary sheet
  const totalBuyerAmount = buyerTransactions.reduce((sum, t) => sum + t.total_amount, 0)
  const totalBuyerPaid = buyerTransactions.reduce((sum, t) => sum + t.paid_amount, 0)
  const totalBuyerPending = buyerTransactions.reduce((sum, t) => sum + t.remaining_balance, 0)

  const totalSellerAmount = sellerTransactions.reduce((sum, t) => sum + t.total_amount, 0)
  const totalSellerPaid = sellerTransactions.reduce((sum, t) => sum + t.paid_amount, 0)
  const totalSellerPending = sellerTransactions.reduce((sum, t) => sum + t.remaining_balance, 0)

  const summaryData = [
    ['Mutton Hub - Combined Report Summary'],
    [''],
    ['BUYER TRANSACTIONS'],
    ['Total Transactions', buyerTransactions.length],
    ['Total Amount', totalBuyerAmount],
    ['Total Paid', totalBuyerPaid],
    ['Total Pending', totalBuyerPending],
    [''],
    ['SELLER TRANSACTIONS'],
    ['Total Transactions', sellerTransactions.length],
    ['Total Amount', totalSellerAmount],
    ['Total Paid', totalSellerPaid],
    ['Total Pending', totalSellerPending],
    [''],
    ['OVERALL SUMMARY'],
    ['Total Transactions', buyerTransactions.length + sellerTransactions.length],
    ['Total Amount', totalBuyerAmount + totalSellerAmount],
    ['Total Paid', totalBuyerPaid + totalSellerPaid],
    ['Total Pending', totalBuyerPending + totalSellerPending],
    ['Net Position', totalSellerAmount - totalBuyerAmount],
    [''],
    ['Date Range', `${dateRange.start} to ${dateRange.end}`],
    ['Generated On', new Date().toLocaleString()]
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  const fileName = `combined-report-${dateRange.start}-to-${dateRange.end}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Export audit logs
export const exportAuditLogs = (logs) => {
  const worksheetData = logs.map(log => ({
    'Date': new Date(log.created_at).toLocaleDateString(),
    'Time': new Date(log.created_at).toLocaleTimeString(),
    'Action': log.action,
    'Table': log.table_name,
    'User Role': log.user_roles?.role || 'Unknown',
    'Old Values': log.old_values ? JSON.stringify(log.old_values, null, 2) : '',
    'New Values': log.new_values ? JSON.stringify(log.new_values, null, 2) : ''
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Audit Logs')

  const fileName = `audit-logs-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Export buyers list
export const exportBuyers = (buyers) => {
  const worksheetData = buyers.map(buyer => ({
    'Name': buyer.name,
    'Phone': buyer.phone,
    'Address': buyer.address,
    'Created Date': new Date(buyer.created_at).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Buyers')

  const fileName = `buyers-list-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

// Export sellers list
export const exportSellers = (sellers) => {
  const worksheetData = sellers.map(seller => ({
    'Name': seller.name,
    'Phone': seller.phone,
    'Address': seller.address,
    'Created Date': new Date(seller.created_at).toLocaleDateString()
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sellers')

  const fileName = `sellers-list-${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
