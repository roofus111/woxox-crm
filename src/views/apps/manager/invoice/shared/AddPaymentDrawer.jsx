// React Imports
import { useState } from 'react'

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

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { toast } from 'react-toastify'

// Vars
const initialData = {
  transactionDate: new Date(),
  paymentMethod: 'select-method',
  amount: 500,
  description: ''
}

const AddPaymentDrawer = ({ data, id, open, handleClose }) => {
  // States
  const [formData, setFormData] = useState(initialData)

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token'); // Secure token retrieval from localStorage
      console.log(data);

      // Assuming `formData` is defined elsewhere in your component with useState
      const dataIn = { ...formData, leadId: data, invoice: id }; // Ensure 'data.leadId' is correctly sourced
      console.log(dataIn); // Useful for debugging, consider removing in production

      const response = await fetch('http://localhost:8000/api/payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Correct way to include the bearer token
        },
        body: JSON.stringify(dataIn)
      });

      const dataOut = await response.json(); // Correctly wait for JSON conversion

      if (response.ok) {
        toast.success('Invoice Generated');
      } else {
        toast.error(`Something went wrong: ${dataOut.message}`); // Display server error message if available
      }
    } catch (error) {
      console.error('Error submitting form:', error); // Log error details for debugging
      toast.error('Please try again'); // More generic error message for the user
    }

    handleClose(); // Assumed to be a function to close the form/modal
  };

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
        <form className='flex flex-col gap-5'>
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
            <Button variant='contained' onClick={() => handleSubmit(data.leadId)}>
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
