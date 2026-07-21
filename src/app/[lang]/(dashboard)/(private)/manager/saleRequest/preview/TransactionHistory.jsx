'use client'

import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

const TransactionHistory = forwardRef(({ invoiceId }, ref) => {
  const [history, setHistory] = useState([])
  const [invoiceInfo, setInvoiceInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchHistory = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)

    if (!invoiceId) {
      setError('No invoice id provided.')
      if (showLoading) setLoading(false)
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
      const resp = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoice/paymenthistory/${invoiceId}`,
        { headers }
      )

      const data = resp.data || {}
      const paymentHistory = Array.isArray(data.paymentHistory) ? data.paymentHistory : []
      setHistory(paymentHistory)

      setInvoiceInfo({
        invoiceNumber: data.invoiceNumber ?? '-',
        totalAmount: data.totalAmount ?? 0,
        paidAmount: data.paidAmount ?? 0,
        balanceAmount: data.balanceAmount ?? 0,
        paymentCount: data.paymentCount ?? (Array.isArray(paymentHistory) ? paymentHistory.length : 0)
      })
    } catch (err) {
      console.error('Error fetching payment history:', err)
      setError(err?.response?.data?.message || err.message || 'Failed to load payment history')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshTransactions: () => fetchHistory(false)
  }), [invoiceId])

  useEffect(() => {
    fetchHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId])

    useEffect(() => {
    if (typeof window === 'undefined') return

    const handler = (e) => {
        try {
        const detail = e?.detail || {}
        // if event targets a different invoice, ignore
        if (detail.invoiceId && detail.invoiceId !== invoiceId) return

        // If event includes created transaction, optimistic prepend
        if (detail.transaction) {
            const newTx = detail.transaction
            setHistory(prev => [newTx, ...prev])

            // update invoice info optimistically
            setInvoiceInfo(prev => {
            if (!prev) return prev
            const increment = Number(newTx.amount ?? 0)
            const paid = Number(prev.paidAmount ?? 0) + increment
            const balance = Number(prev.totalAmount ?? 0) - paid
            const count = (Number(prev.paymentCount ?? 0) + 1)
            return {
                ...prev,
                paidAmount: paid,
                balanceAmount: balance,
                paymentCount: count
            }
            })

            // Then re-sync with server to get canonical record (in case server modified fields)
            // Small micro-delay helps UX and avoids flash — but not required
            setTimeout(() => {
            fetchHistory(false)
            }, 100)
        } else {
            // No transaction object included -> just re-fetch
            fetchHistory(false)
        }
        } catch (err) {
        console.error('Error handling transaction:created event', err)
        }
    }

    window.addEventListener('transaction:created', handler)
    return () => window.removeEventListener('transaction:created', handler)
    }, [invoiceId]) 

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return '-'
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(Number(amount))
    } catch {
      return String(amount)
    }
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return '-'
    try {
      const d = typeof dateValue === 'number' || /^\d+$/.test(String(dateValue))
        ? new Date(Number(dateValue))
        : new Date(dateValue)
      if (isNaN(d.getTime())) return String(dateValue)
      return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return String(dateValue)
    }
  }

  const getStatusBadge = (status) => {
    if (!status && status !== 0) return <span className="text-gray-500">-</span>
    const statusStr = typeof status === 'string' ? status : String(status)
    const statusLower = statusStr.toLowerCase()
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    const colorClass = statusColors[statusLower] || 'bg-blue-100 text-blue-800'
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {statusStr.charAt(0).toUpperCase() + statusStr.slice(1)}
      </span>
    )
  }

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
          {/* Header with invoice summary */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
              {invoiceInfo && (
                <span className="text-sm text-gray-600">
                  Invoice #{invoiceInfo.invoiceNumber}
                </span>
              )}
            </div>

            {invoiceInfo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Amount:</span>
                  <div className="font-medium">{formatCurrency(invoiceInfo.totalAmount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Paid Amount:</span>
                  <div className="font-medium text-green-600">{formatCurrency(invoiceInfo.paidAmount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Balance:</span>
                  <div className="font-medium text-red-600">{formatCurrency(invoiceInfo.balanceAmount)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Transactions:</span>
                  <div className="font-medium">{invoiceInfo.paymentCount}</div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-600">Loading payment history...</div>
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">
                  {typeof error === 'string' ? error : 'Failed to load payment history.'}
                </div>
              </div>
            )}

            {!loading && !error && history.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No payment transactions found for this invoice.
              </div>
            )}

            {!loading && !error && history.length > 0 && (
              <div className="overflow-x-auto -mx-6">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Processed By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((transaction, index) => {
                        // Defensive field mapping — update keys to match your API if needed
                        const paymentId = transaction.paymentId ?? transaction.id ?? transaction.txnId ?? index
                        const txDate =
                          transaction.transactionDate ??
                          transaction.date ??
                          transaction.createdAt ??
                          transaction.timestamp
                        const amount = transaction.amount ?? transaction.value ?? transaction.paidAmount ?? '-'
                        const method = transaction.paymentMethod ?? transaction.method ?? '-'
                        const status = transaction.paymentStatus ?? transaction.status ?? '-'
                        const description = transaction.description ?? transaction.remarks ?? '-'
                        const processedBy = transaction.processedBy ?? transaction.processed_by ?? null

                        return (
                          <tr key={paymentId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {paymentId || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              <div className="text-sm">{formatDate(txDate)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {method || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              {getStatusBadge(status)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              <div className="max-w-xs truncate" title={description}>
                                {description || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {processedBy && (processedBy.name || processedBy.email) ? (
                                <div className="space-y-1">
                                  {processedBy.name && <div className="font-medium text-sm">{processedBy.name}</div>}
                                  {processedBy.email && <div className="text-gray-500 text-xs">{processedBy.email}</div>}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

TransactionHistory.displayName = 'TransactionHistory'
TransactionHistory.propTypes = { invoiceId: PropTypes.string }

export default TransactionHistory
