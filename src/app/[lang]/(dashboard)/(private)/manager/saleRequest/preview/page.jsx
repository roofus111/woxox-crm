'use client'
import axios from 'axios'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'
// Component Imports
import Preview from '@views/apps/manager/invoice/preview'
import { useSearchParams } from 'next/navigation'
// Data Imports
import { getInvoiceData } from '@/app/server/actions'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/invoice` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
/* const getInvoiceData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/invoice`)

  if (!res.ok) {
    throw new Error('Failed to fetch invoice data')
  }

  return res.json()
} */
const PreviewPage = () => {
  const [data, setData] = useState([])
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get(`https://app.canbridge.in/api/invoice/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data) // Update data if component is still mounted
        console.log(response.data)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
      })
  }, [])

  return <Preview invoiceData={{
    id: data.id,
    issuedDate: data.issuedDate,
    address: data.address,
    company: 'Hall-Robbins PLC',
    companyEmail: data.companyEmail,
    country: 'USA',
    contact: data.contact,
    name: data.name,
    service: 'Software Development',
    total: data.total,
    avatar: '',
    avatarColor: 'primary',
    invoiceStatus: data.service,
    balance: data.balance,
    dueDate: data.dueDate,
    items: data.items,
    gst: data.gst,
    subtotal: data.subtotal,
    paid: data.paid,
    leadId: data.leadId

  }} id={data.refId} />


}

export default PreviewPage
