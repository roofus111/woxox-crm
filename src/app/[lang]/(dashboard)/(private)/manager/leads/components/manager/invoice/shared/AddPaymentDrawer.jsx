// React Imports
import { useState } from 'react'
import axios from 'axios'

// MUI Import
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Autocomplete from '@mui/material/Autocomplete'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { toast } from 'react-toastify'

// Vars
const initialData = {
  transactionDate: new Date(),
  paymentMethod: 'select-method',
  amount: 500,
  description: '',
  bankAccountId: ''
}

const AddPaymentDrawer = ({ data, id, open, handleClose, accounts }) => {
  // States
  const [formData, setFormData] = useState(initialData)
  console.log(data);

// inside AddPaymentDrawer component
  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token')

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment`,
        {
          ...formData,
          bankAccountId: formData.bankAccountId,
          invoice: id,
          leadId: data.leadId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      // try to find created transaction in response
      const createdRaw = response.data?.transaction ?? response.data?.payment ?? response.data

      const createdTx = (createdRaw && Object.keys(createdRaw).length)
        ? createdRaw
        : {
            paymentId: response.data?.id ?? `local-${Date.now()}`,
            amount: formData.amount,
            transactionDate: formData.transactionDate,
            paymentMethod: formData.paymentMethod,
            description: formData.description,
            processedBy: { name: 'You' }
          }

      // Close drawer & reset for immediate UX
      handleClose()
      setFormData(initialData)
      toast.success('Payment added')

      // Dispatch event (optimistic update)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('transaction:created', {
          detail: { invoiceId: id, transaction: createdTx }
        }))

        // Also call global refresh (this forces TransactionHistory to fetch canonical data)
        // Make sure PreviewPage sets window.refreshTransactionHistory = refreshTransactions
        // (you already do that in PreviewPage useEffect)
        if (typeof window.refreshTransactionHistory === 'function') {
          // small micro-delay helps ensure listener processed optimistic update first
          setTimeout(() => window.refreshTransactionHistory(), 50)
        }
      }

    } catch (error) {
      console.error('Failed to add payment:', error)
      toast.error('Failed to add payment')
    }
  }

  const handleReset = () => {
    handleClose()
    setFormData(initialData)
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between pli-5 plb-4'>
        <Typography variant='h5'>Make Payment</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-5'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <Autocomplete
            fullWidth
            options={accounts}
            value={accounts.find(account => account._id === formData.bankAccountId) || null}
            onChange={(event, newValue) => {
              setFormData(prev => ({
                ...prev,
                bankAccountId: newValue?._id || ''
              }))
            }}
            getOptionLabel={(option) => option.accountName || ''}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Select Account'
                required
                margin='normal'
              />
            )}
          />
          <TextField
            fullWidth
            id='invoice-balance'
            label='Invoice Balance'
            InputProps={{
              disabled: true,
              startAdornment: <InputAdornment position='start'>Rs.</InputAdornment>
            }}
            defaultValue={data.balance}
          />
          <TextField
            fullWidth
            id='payment-amount'
            label='Payment Amount'
            type='number'
            InputProps={{
              startAdornment: <InputAdornment position='start'>Rs.</InputAdornment>
            }}
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: +e.target.value })}
          />
          <AppReactDatepicker
            selected={formData.transactionDate}
            id='payment-date'
            onChange={date => date !== null && setFormData({ ...formData, transactionDate: date })}
            customInput={<TextField fullWidth label='Payment Date' />}
          />
          <FormControl fullWidth>
            <InputLabel htmlFor='payment-method'>Payment Method</InputLabel>
            <Select
              label='Payment Method'
              labelId='payment-method'
              id='payment-method-select'
              value={formData.paymentMethod}
              onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <MenuItem value='select-method' disabled>
                Select Payment Method
              </MenuItem>
              <MenuItem value='cash'>Cash</MenuItem>
              <MenuItem value='bank-transfer'>Bank Transfer</MenuItem>
              <MenuItem value='credit'>Credit</MenuItem>
              <MenuItem value='debit'>Debit</MenuItem>
              <MenuItem value='UPI'>UPI</MenuItem>
              <MenuItem value='other'>other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            rows={6}
            multiline
            fullWidth
            label='Internal Payment Note'
            placeholder='Internal Payment Note'
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              Send
            </Button>
            <Button variant='outlined' color='secondary' type='reset' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  )
}

export default AddPaymentDrawer
