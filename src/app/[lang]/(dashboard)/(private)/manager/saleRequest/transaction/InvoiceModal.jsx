'use client'

import React, { useState, useEffect, useRef } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import axios from 'axios'
import Image from 'next/image'
import { format } from 'date-fns'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const InvoiceModal = ({ invoice, open, onClose, onDownload }) => {
  const [companyLogo, setCompanyLogo] = useState('')
  const [companyData, setCompanyData] = useState(null)
  const invoiceRef = useRef(null)

  useEffect(() => {
    if (invoice && invoice.company) {
      const token = localStorage.getItem('token')
      const fetchData = async () => {
        try {
          setCompanyData(invoice.company)

          // Fetch the company logo from the API as a blob
          const logoResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/companies/get-image`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              },
              responseType: 'blob'
            }
          )
          const logoBlob = new Blob([logoResponse.data], { type: 'image/jpeg' })
          const logoUrl = URL.createObjectURL(logoBlob)
          setCompanyLogo(logoUrl)
        } catch (error) {
          console.error('Error fetching company data or logo:', error)
        }
      }
      fetchData()

      return () => {
        if (companyLogo) {
          URL.revokeObjectURL(companyLogo)
        }
      }
    }
  }, [invoice])

  if (!invoice) return null

  // Format dates
  const formattedInvoiceDateIssued = invoice.invoice?.dateIssued
    ? format(new Date(invoice.invoice.dateIssued), 'PP')
    : 'N/A'
  const formattedDueDate = invoice.invoice?.dueDate
    ? format(new Date(invoice.invoice.dueDate), 'PP')
    : 'N/A'
  const formattedTransactionDate = invoice.transactionDate
    ? format(new Date(invoice.transactionDate), 'PPpp')
    : 'N/A'

  const company = companyData || invoice.company || {}
  const currentMonth = format(new Date(), 'MMMM yyyy')

  // Improved PDF Download function
  // Improved PDF generation function
  // Updated handleDownload function that maintains logo position
  const handleDownload = async () => {
    if (!invoiceRef.current) return
    try {
      // First, temporarily ensure the logo position is consistent
      const logoElement = invoiceRef.current.querySelector('.company-logo-container')
      const originalLogoStyles = {}

      if (logoElement) {
        // Save original styles
        originalLogoStyles.display = logoElement.style.display
        originalLogoStyles.position = logoElement.style.position
        originalLogoStyles.right = logoElement.style.right

        // Ensure the logo stays in the right position
        logoElement.style.display = 'block'
        logoElement.style.position = 'absolute'
        logoElement.style.top = '-10px'
        logoElement.style.right = '30px' // Keep it on the right side
        logoElement.style.maxWidth = '80px'
        logoElement.style.maxHeight = '80px'
      }

      // Wait for renders to complete
      await new Promise(resolve => setTimeout(resolve, 800))

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: invoiceRef.current.offsetWidth,
        height: invoiceRef.current.offsetHeight,
        // Set background to white
        backgroundColor: '#FFFFFF'
      })

      // Restore original logo styles
      if (logoElement) {
        logoElement.style.display = originalLogoStyles.display
        logoElement.style.position = originalLogoStyles.position
        logoElement.style.right = originalLogoStyles.right
      }

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Calculate proper scaling with margins
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20
      const pdfHeight = pdf.internal.pageSize.getHeight() - 20

      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // Determine scaling ratio
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const finalImgWidth = imgWidth * ratio
      const finalImgHeight = imgHeight * ratio

      // Center on page
      const xOffset = (pdf.internal.pageSize.getWidth() - finalImgWidth) / 2
      const yOffset = 10

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight)
      pdf.save(`Invoice-${invoice.invoice?.invoiceNumber || 'Download'}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  // Updated handlePrint function that maintains logo position
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice')
      return
    }

    // Clone the invoice element to avoid modifying the original
    const invoiceElement = invoiceRef.current.cloneNode(true)

    // Ensure proper positioning for printing - keep right alignment
    const logoContainer = invoiceElement.querySelector('.company-logo-container')
    if (logoContainer) {
      logoContainer.style.position = 'absolute'
      logoContainer.style.top = '1px'
      logoContainer.style.right = '30px' // Keep it on the right side
      logoContainer.style.maxWidth = '80px'
      logoContainer.style.maxHeight = '80px'
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.invoice?.invoiceNumber || ''}</title>
        <meta charset="utf-8">
        <style>
          @page { size: A4; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 0; 
            margin: 0;
            box-sizing: border-box;
            background-color: white;
          }
          .invoice-content { 
            position: relative;
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
          }
          img { max-width: 80px; max-height: 80px; object-fit: contain; }
          
          /* Grid styles */
          .MuiGrid-container { display: flex; flex-wrap: wrap; margin-bottom: 5px; }
          .MuiGrid-item { box-sizing: border-box; padding: 3px; }
          [class*="MuiGrid-grid-xs-4"] { width: 33.33%; }
          [class*="MuiGrid-grid-xs-2"] { width: 16.66%; }
          [class*="MuiGrid-grid-xs-6"] { width: 50%; }
          [class*="MuiGrid-grid-xs-8"] { width: 66.66%; }
          
          /* Text alignment */
          [style*="text-align: right"] { text-align: right; }
          [style*="text-align: center"] { text-align: center; }
          
          /* Other styles */
          .MuiDivider-root { border-bottom: 1px solid #ddd; margin: 20px 0; }
          .MuiPaper-root { padding: 4px; }
          .MuiBox-root { display: block; }
          .company-logo-container { 
            position: absolute; 
            top: 20px; 
            right: 30px; /* Keep on right side */
          }
          
          /* Font weights */
          [data-weight="bold"] { font-weight: bold; }
          
          /* Colors */
          [data-color="primary"] { color: #1976d2; }
          
          @media print {
            body { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-content">
          ${invoiceElement.innerHTML}
        </div>
        <script>
          window.onload = function() { 
            setTimeout(() => { window.print(); window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `)
    printWindow.document.close()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent>
        {/* MAIN INVOICE WRAPPER */}
        <Paper
          elevation={0}
          sx={{ p: 3, borderRadius: 2, position: 'relative' }}
          ref={invoiceRef}
        >
          {/* HEADER SECTION */}
          <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
            {/* LEFT SIDE - COMPANY INFO */}
            <Grid item xs={6}>
              <Typography variant="h6" fontWeight="bold">
                {company.name || 'Company Name'}
              </Typography>
              <Typography variant="body2">
                {company.address?.addressLine1 || '123 Main Street'}
              </Typography>
              <Typography variant="body2">
                {company.address?.city || 'City'}, {company.address?.zip || '00000'}
              </Typography>
            </Grid>

            {/* RIGHT SIDE - INVOICE TITLE */}
            <Grid item xs={6} textAlign="right">
              <Typography variant="h5" fontWeight="bold" color="primary">

              </Typography>
              <Typography className='mt-14' variant="body2" fontWeight="bold">
                For the Month: {currentMonth}
              </Typography>
              <Typography variant="body2">
                Invoice Number: {invoice.invoice?.invoiceNumber || 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          {/* COMPANY LOGO - POSITIONED SEPARATELY */}
          <Box
            className="company-logo-container"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              position: 'absolute',
              top: '1px',
              right: '30px',
              width: 80,
              height: 80,
              overflow: 'hidden',
              borderRadius: 1
            }}
          >
            {companyLogo ? (
              <Image
                src={companyLogo}
                alt="Company Logo"
                width={80}
                height={80}
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}
              >
                {company?.name?.[0]?.toUpperCase() || 'C'}
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* BILL FROM & BILL TO */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Bill From
              </Typography>
              <Typography variant="body2">
                {company.name || 'Company Name'}
              </Typography>
              <Typography variant="body2">
                {company.address?.addressLine1 || ''}, {company.address?.city || ''}, {company.address?.state || ''} - {company.address?.zip || ''}
              </Typography>
              <Typography variant="body2">
                GSTIN: {company?.gstNumber || 'N/A'}
              </Typography>
              <Typography variant="body2">
                Phone: {company.phone || 'N/A'}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Bill To
              </Typography>
              <Typography variant="body2">
                {invoice.leadId?.name || 'Customer Name'}
              </Typography>
              <Typography variant="body2">
                {invoice.leadId?.address?.addressLine1 || 'No address provided'}
              </Typography>
              <Typography variant="body2">
                Phone: {invoice.leadId?.phone || 'N/A'}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* INVOICE DETAILS */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Date Issued</Typography>
              <Typography variant="body2">{formattedInvoiceDateIssued}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Due Date</Typography>
              <Typography variant="body2">{formattedDueDate}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Payment Status</Typography>
              <Typography variant="body2">{invoice.paymentStatus || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Payment ID</Typography>
              <Typography variant="body2">{invoice.paymentId || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Transaction Date</Typography>
              <Typography variant="body2">{formattedTransactionDate}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Payment Method</Typography>
              <Typography variant="body2">{invoice.paymentMethod || 'N/A'}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* TABLE HEADER */}
          <Grid container sx={{ py: 1, backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
            <Grid item xs={4}>
              <Typography variant="body2" fontWeight="bold">Item</Typography>
            </Grid>
            <Grid item xs={2} textAlign="center">
              <Typography variant="body2" fontWeight="bold">Qty</Typography>
            </Grid>
            <Grid item xs={2} textAlign="right">
              <Typography variant="body2" fontWeight="bold">Cost</Typography>
            </Grid>
            <Grid item xs={2} textAlign="right">
              <Typography variant="body2" fontWeight="bold">Tax</Typography>
            </Grid>
            <Grid item xs={2} textAlign="right">
              <Typography variant="body2" fontWeight="bold">Total</Typography>
            </Grid>
          </Grid>

          {/* ITEM ROWS */}
          {invoice.invoice?.items?.map((item, idx) => {
            const taxAmount = ((item.cost * item.quantity) * (item.taxPercentage || invoice.invoice?.taxRate || 0)) / 100
            const totalWithTax = (item.cost * item.quantity) + taxAmount

            return (
              <Grid container sx={{ py: 1, borderBottom: '1px solid #ddd' }} key={idx}>
                <Grid item xs={4}>
                  <Typography variant="body2">{item.item}</Typography>
                </Grid>
                <Grid item xs={2} textAlign="center">
                  <Typography variant="body2">{item.quantity}</Typography>
                </Grid>
                <Grid item xs={2} textAlign="right">
                  <Typography variant="body2">₹ {item.cost.toLocaleString('en-IN')}</Typography>
                </Grid>
                <Grid item xs={2} textAlign="right">
                  <Typography variant="body2">
                    {item.taxPercentage || invoice.invoice?.taxRate || 0}%
                  </Typography>
                </Grid>
                <Grid item xs={2} textAlign="right">
                  <Typography variant="body2">₹ {totalWithTax.toLocaleString('en-IN')}</Typography>
                </Grid>
              </Grid>
            )
          })}

          {/* TOTALS */}
          <Grid container sx={{ mt: 3, mb: 2 }}>
            <Grid item xs={8} />
            <Grid item xs={4}>
              <Grid container>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2" fontWeight="bold">Subtotal:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2">
                    ₹ {(invoice.invoice?.totalAmount || 0).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2" fontWeight="bold">Tax ({invoice.invoice?.taxRate || 0}%):</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2">
                    ₹ {(invoice.invoice?.gst || 0).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container sx={{ mt: 1 }}>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body1" fontWeight="bold">Total:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ₹ {(invoice.invoice?.grandTotal || 0).toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      {/* ACTION BUTTONS */}
      <DialogActions>
        <Button onClick={handleDownload} variant="contained" color="primary">
          Download
        </Button>
        <Button onClick={handlePrint} variant="contained" color="secondary">
          Print
        </Button>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InvoiceModal
