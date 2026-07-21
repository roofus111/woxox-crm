'use client'
import axios from 'axios'
import { useState, useEffect, useRef } from 'react'
// Component Imports
import Preview from '@views/apps/manager/invoice/preview'
import TransactionHistory from './TransactionHistory'
import { useSearchParams } from 'next/navigation'

const PreviewPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const transactionHistoryRef = useRef(null)

  useEffect(() => {
  window.refreshTransactionHistory = () => {
    try {
      transactionHistoryRef.current?.refreshTransactions()
    } catch (e) {
    }
  }

  return () => {
    try { delete window.refreshTransactionHistory } catch (e) {}
  }
}, [transactionHistoryRef])

  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setError('No invoice id in URL')
      return
    }

    let isMounted = true
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    const fetchInvoice = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/invoice/${id}`, { headers })
        if (!isMounted) return
        setData(res.data)
      } catch (err) {
        console.error('Failed to fetch invoice:', err)
        if (isMounted) setError(err?.response?.data?.message || err.message || 'Failed to load invoice')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchInvoice()
    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) return <div className="p-4">Loading invoice...</div>
  if (error) return <div className="p-4 text-red-600">Error: {String(error)}</div>
  if (!data) return <div className="p-4">No invoice data</div>

  const invoiceData = {
    id: data.id ?? data._id ?? data.refId,
    issuedDate: data.issuedDate,
    address: data.address,
    company: data.company ?? 'Hall-Robbins PLC',
    companyEmail: data.companyEmail,
    country: data.country ?? 'USA',
    contact: data.contact,
    name: data.name,
    service: data.service ?? 'Software Development',
    total: data.total ?? data.totalAmount,
    avatar: '',
    avatarColor: 'primary',
    invoiceStatus: data.service,
    balance: data.balance ?? data.balanceAmount,
    dueDate: data.dueDate,
    items: data.items ?? [],
    gst: data.gst,
    subtotal: data.subtotal,
    paid: data.paid ?? data.paidAmount,
    leadId: data.leadId
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-6">
        <div className="mb-6">
          <Preview invoiceData={invoiceData} id={data.refId ?? invoiceData.id} />
        </div>
      </div>

      <div className="w-full">
        <TransactionHistory 
          ref={transactionHistoryRef}
          invoiceId={data.refId ?? invoiceData.id} 
        />
      </div>
    </div>
  )
}

export default PreviewPage