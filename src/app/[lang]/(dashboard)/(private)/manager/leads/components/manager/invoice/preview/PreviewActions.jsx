// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

// Component Imports
import AddPaymentDrawer from '@views/apps/manager/invoice/shared/AddPaymentDrawer'
import SendInvoiceDrawer from '@views/apps/manager/invoice/shared/SendInvoiceDrawer'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Third-party imports
import axios from 'axios'

const PreviewActions = ({ invoiceData, id, onButtonClick }) => {
  // States
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [sendDrawerOpen, setSendDrawerOpen] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)

  // Hooks
  const { lang: locale } = useParams()

  // Fetch accounts on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAccounts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/account/getbankaccounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAccounts(response.data.data);
        console.log(response.data.data);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <>
      <Card>
        <CardContent className='flex flex-col gap-4'>
          <Button
            fullWidth
            color='success'
            variant='contained'
            className='capitalize'
            onClick={() => setPaymentDrawerOpen(true)}
            startIcon={<i className='ri-money-dollar-circle-line' />}
          >
            Add Payment
          </Button>
          <Button fullWidth color='secondary' variant='outlined' className='capitalize'>
            Download
          </Button>
          <div className='flex items-center gap-4'>
            <Button fullWidth color='secondary' variant='outlined' className='capitalize' onClick={onButtonClick}>
              Print
            </Button>
            <Button
              fullWidth
              component={Link}
              color='secondary'
              variant='outlined'
              className='capitalize'
              href={getLocalizedUrl(`/apps/invoice/edit/${id}`, locale)}
            >
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>
      <AddPaymentDrawer
        data={invoiceData}
        id={id}
        open={paymentDrawerOpen}
        handleClose={() => setPaymentDrawerOpen(false)}
        accounts={accounts}
      />
      <SendInvoiceDrawer open={sendDrawerOpen} handleClose={() => setSendDrawerOpen(false)} />
    </>
  )
}

export default PreviewActions
