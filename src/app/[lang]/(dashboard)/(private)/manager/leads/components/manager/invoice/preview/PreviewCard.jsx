// MUI Imports
'use client'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'

// Component Imports
import Logo from '@components/layout/shared/Logo'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import './print.css'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Image from 'next/image'


const PreviewCard = ({ invoiceData, id }) => {
  const [companyData, setCompanyData] = useState(null)
  const [companyLogo, setCompanyLogo] = useState('')
  useEffect(() => {
    const token = localStorage.getItem('token')
    const fetchData = async () => {
      try {
        // Fetch company data
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCompanyData(response.data);

        // Fetch company logo
        const logoResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/companies/get-image`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob'
        });
        // Create blob URL specifically for JPEG image
        const logoBlob = new Blob([logoResponse.data], { type: 'image/jpeg' });
        const logoUrl = URL.createObjectURL(logoBlob);
        setCompanyLogo(logoUrl);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();

    // Cleanup function to revoke object URL
    return () => {
      if (companyLogo) {
        URL.revokeObjectURL(companyLogo);
      }
    };
  }, []);
  return (
    <Card className='previewCard'>
      <CardContent className='sm:!p-12'>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <div className='p-6 bg-actionHover rounded'>
              <div className='flex justify-between gap-y-4 flex-col sm:flex-row'>
                <div className='flex flex-col gap-6'>
                  <div className='flex items-center'>
                    <Image
                      src={companyLogo}
                      alt="Company Logo"
                      height={100}
                      width={100}
                      style={{ width: 'auto', height: '100px' }}
                    />

                    <h1 style={{ paddingLeft: '6px' }}>{companyData?.name}</h1>
                  </div>

                  {/* Replace with dynamic content */}
                  <div>
                    <Typography color='text.primary'>{companyData?.address.street}, {companyData?.address.city}, {companyData?.address.state}, {companyData?.address.zip}</Typography>
                    <Typography color='text.primary'>{companyData?.address.city}, {companyData?.address.state}, {companyData?.address.zip}</Typography>
                    <Typography color='text.primary'>{companyData?.phone} | {companyData?.email}</Typography>
                    <Typography color='text.primary'>{companyData?.website}</Typography>
                  </div>
                </div>
                <div className='flex flex-col gap-6'>
                  <Typography variant='h5'>{`Invoice #${invoiceData?.id}`}</Typography>
                  <div className='flex flex-col gap-1'>
                    <Typography color='text.primary'>{`Date Issued: ${invoiceData?.issuedDate}`}</Typography>
                    <Typography color='text.primary'>{`Date Due: ${invoiceData?.dueDate}`}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Invoice To:
                  </Typography>
                  <div>
                    <Typography>{invoiceData?.name}</Typography>
                    {/* <Typography>{invoiceData?.company}</Typography> */}
                    <Typography>{invoiceData?.address}</Typography>
                    <Typography>{invoiceData?.contact}</Typography>
                    <Typography>{invoiceData?.companyEmail}</Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <div className='overflow-x-auto border rounded'>
              <table className={tableStyles.table}>
                <thead>
                  <tr className='border-be'>
                    <th className='!bg-transparent'>Item</th>
                    <th className='!bg-transparent'>Description</th>
                    <th className='!bg-transparent'>Cost</th>
                    <th className='!bg-transparent'>Quantity</th>
                    <th className='!bg-transparent'>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData?.items?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Typography color='text.primary'>{item.item}</Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>{item.description}</Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>{item.quantity}</Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>{item.cost}</Typography>
                      </td>
                      <td>
                        <Typography color='text.primary'>{item.total}</Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Grid>
          <Grid item xs={12}>
            <div className='flex justify-between flex-col gap-y-4 sm:flex-row'>
              <div className='flex flex-col gap-1 order-2 sm:order-[unset]'>
                {/* <div className='flex items-center gap-2'>
                  <Typography className='font-medium' color='text.primary'>
                    Salesperson:
                  </Typography>
                  <Typography>Tommy Shelby</Typography>
                </div>
                <Typography>Thanks for your business</Typography> */}
              </div>
              <div className='min-is-[200px]'>
                <div className='flex items-center justify-between'>
                  <Typography>Subtotal:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    {invoiceData?.subtotal}
                  </Typography>
                </div>
                {/* <div className='flex items-center justify-between'>
                  <Typography>Discount:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    $28
                  </Typography>
                </div> */}
                <div className='flex items-center justify-between'>
                  <Typography>Tax:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    {invoiceData?.gst}
                  </Typography>
                </div>
                <Divider className='mlb-2' />
                <div className='flex items-center justify-between'>
                  <Typography>Total:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    {invoiceData?.total}
                  </Typography>
                </div>
                <div className='flex items-center justify-between'>
                  <Typography>Paid:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    {invoiceData?.paid}
                  </Typography>
                </div>
                <Divider className='mlb-2' />
                <div className='flex items-center justify-between'>
                  <Typography>Balance:</Typography>
                  <Typography className='font-medium' color='text.primary'>
                    {invoiceData?.balance}
                  </Typography>
                </div>
              </div>
            </div>
          </Grid>
          <Grid item xs={12}>
            <Divider className='border-dashed' />
          </Grid>
          <Grid item xs={12}>
            <Typography>
              <Typography component='span' className='font-medium' color='text.primary'>
                Note:
              </Typography>{' '}
              {invoiceData?.notes}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

export default PreviewCard
