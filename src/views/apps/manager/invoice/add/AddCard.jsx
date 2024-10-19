'use client'

// React Imports
import React, { useState, useEffect } from 'react';

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import InputLabel from '@mui/material/InputLabel'
import useMediaQuery from '@mui/material/useMediaQuery'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import AddCustomerDrawer, { initialFormData } from './AddCustomerDrawer'
import Logo from '@components/layout/shared/Logo'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'
import { toast } from 'react-toastify';

const AddAction = (props) => {
  // States
  const [open, setOpen] = useState(false)
  const [selectData, setSelectData] = useState(null)
  const [issuedDate, setIssuedDate] = useState(null)
  const [dueDate, setDueDate] = useState(null)
  const [note, setNote] = useState('')
  // Hooks
  const isBelowMdScreen = useMediaQuery(theme => theme.breakpoints.down('md'))
  const isBelowSmScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))

  const onFormSubmit = data => {
    setFormData(data)
  }


  const [formData, setFormData] = useState([
    {
      item: '',
      description: '',
      cost: 0,
      quantity: 0,
      total: 0
    }
  ]);

  const [count, setCount] = useState(1);

  // Handle changes for the form fields
  const handleChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index][field] = value;

    // Automatically calculate total if cost or quantity changes
    if (field === 'cost' || field === 'quantity') {
      updatedFormData[index].total = updatedFormData[index].cost * updatedFormData[index].quantity;
    }

    setFormData(updatedFormData);
  };

  // Delete an item from the form
  const deleteForm = (index) => {
    const updatedFormData = formData.filter((_, i) => i !== index);
    setFormData(updatedFormData);
    setCount(count - 1);
  };

  // Add a new item to the form
  const addItem = () => {
    setFormData([...formData, { item: '', description: '', cost: '', quantity: '', total: '' }]);
    setCount(count + 1);
  };
  const [totals, setTotals] = useState({ totalAmount: 0, gst: 0, grandTotal: 0 });



  const GST_RATE = 0.18; // 18% GST

  const calculateTotals = () => {
    const totalAmount = formData.reduce((acc, item) => acc + item.cost * item.quantity, 0);
    const gst = totalAmount * GST_RATE;
    const grandTotal = totalAmount + gst;

    setTotals({
      totalAmount,
      gst,
      grandTotal,
    });
  };

  useEffect(() => {
    calculateTotals();
  }, [formData]);

  const handleSubmit = async e => {
    e.preventDefault()

    console.log(formData, totals, issuedDate, dueDate);
    const dataIn = { items: formData, ...totals, dateIssued: issuedDate, dueDate: dueDate, customer: props.data?._id, invoiceNumber: '777', notes: note }

    try {
      const token = localStorage.getItem('token')
      // Example API call to submit the form
      const response = await fetch('http://localhost:8000/api/invoice/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataIn)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Invoice Generated')
      } else {
        toast.error('Something went Wronng')
      }
    } catch (error) {
      toast.error('Please try Again')
    }
  }

  return (
    <>
      <Card>
        <CardContent className='sm:!p-12'>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <div className='p-6 bg-actionHover rounded'>
                <div className='flex justify-between gap-4 flex-col sm:flex-row'>
                  <div className='flex flex-col gap-6'>
                    <div className='flex items-center'>
                      <Logo />
                    </div>

                    {/* Replace with dynamic content */}
                    <div>
                      <Typography color='text.primary'>General Hospital Rd, opp. st joseph school,<br /> near indian oil pump,</Typography>
                      <Typography color='text.primary'>Jai Vihar, Kunnukuzhy, <br /> Thiruvananthapuram, Kerala 695003</Typography>
                      <Typography color='text.primary'>+91 73063 85701 | info@canbridge.in</Typography>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-4'>
                      <Typography variant='h5' className='min-is-[95px]'>
                        Invoice
                      </Typography>
                      <TextField
                        fullWidth
                        size='small'
                        // value={invoiceData?.[0].id}
                        InputProps={{
                          disabled: true,
                          startAdornment: <InputAdornment position='start'>#</InputAdornment>
                        }}
                      />
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[95px]' color='text.primary'>
                        Date Issued:
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={issuedDate}
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={date => setIssuedDate(date)}
                        customInput={<TextField fullWidth size='small' />}
                      />
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[95px]' color='text.primary'>
                        Date Due:
                      </Typography>
                      <AppReactDatepicker
                        boxProps={{ className: 'is-full' }}
                        selected={dueDate}
                        placeholderText='YYYY-MM-DD'
                        dateFormat={'yyyy-MM-dd'}
                        onChange={date => setDueDate(date)}
                        customInput={<TextField fullWidth size='small' />}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12}>
              <div className='flex justify-between flex-col gap-4 flex-wrap sm:flex-row'>
                <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Invoice To:
                  </Typography>
                  {/*
                   <Select
                    className={classnames('min-is-[200px]', { 'is-1/2': isBelowSmScreen })}
                    size='small'
                    value={selectData?.id || ''}
                    onChange={e => {
                      setFormData({})
                      // setSelectData(invoiceData?.slice(0, 5).filter(item => item.id === e.target.value)[0] || null)
                    }}
                  >
                    <MenuItem
                      className='flex items-center gap-2 text-success bg-transparent hover:bg-successLight'
                      value=''
                      onClick={() => {
                        setSelectData(null)
                        setOpen(true)
                      }}
                    >
                      <i className='ri-add-line' />
                      Add New Customer
                    </MenuItem>
                    {invoiceData?.slice(0, 5).map((invoice, index) => (
                      <MenuItem key={index} value={invoice.id}>
                        {invoice.name}
                      </MenuItem>
                    ))}
                  </Select> 
                  */}
                  {props.data?._id ? (
                    <div>
                      <Typography>{props.data?.name}</Typography>
                      <Typography>{props.data?.profile?.address}</Typography>
                      <Typography>{props.data?.profile?.city} {props.data?.profile?.pinCode}</Typography>
                      <Typography>{props.data?.profile?.state}</Typography>
                      <Typography>{props.data?.phone}</Typography>
                    </div>
                  ) : (
                    <div>
                      {/* <Typography>{formData?.name}</Typography>
                      <Typography>{formData?.company}</Typography>
                      <Typography>{formData?.address}</Typography>
                      <Typography>{formData?.contactNumber}</Typography>
                      <Typography>{formData?.email}</Typography> */}
                    </div>
                  )}
                </div>
                {/* <div className='flex flex-col gap-4'>
                  <Typography className='font-medium' color='text.primary'>
                    Bill To:
                  </Typography>
                  <div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>Total Due:</Typography>
                      <Typography>$12,110.55</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>Bank name:</Typography>
                      <Typography>American Bank</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>Country:</Typography>
                      <Typography>United States</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>IBAN:</Typography>
                      <Typography>ETD95476213874685</Typography>
                    </div>
                    <div className='flex items-center gap-4'>
                      <Typography className='min-is-[100px]'>SWIFT code:</Typography>
                      <Typography>BR91905</Typography>
                    </div>
                  </div>
                </div> */}
              </div>
            </Grid>

            <Grid item xs={12}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid item xs={12}>
              {formData.map((formItem, index) => (
                <div
                  key={index}
                  className={classnames('repeater-item flex relative mbe-4 border rounded', {
                    'first:mbs-[38px] mbs-[62px]': !isBelowMdScreen,
                    'gap-5': isBelowMdScreen,
                  })}
                >
                  <Grid container spacing={5} className="m-0 pbe-5">
                    <Grid item lg={6} md={5} xs={12}>
                      <Typography className="font-medium md:absolute md:-top-[38px]" color="text.primary">
                        Item
                      </Typography>
                      <TextField
                        rows={2}
                        fullWidth
                        size="small"
                        className="mbe-5"
                        value={formItem.item}
                        onChange={(e) => handleChange(index, 'item', e.target.value)}
                      />
                      {/* <Select
                        fullWidth
                        size="small"
                        value={formItem.item}
                        onChange={(e) => handleChange(index, 'item', e.target.value)}
                        className="mbe-5"
                      >
                        <MenuItem value="App Design">App Design</MenuItem>
                        <MenuItem value="App Customization">App Customization</MenuItem>
                        <MenuItem value="ABC Template">ABC Template</MenuItem>
                        <MenuItem value="App Development">App Development</MenuItem>
                      </Select> */}
                      <TextField
                        rows={2}
                        fullWidth
                        multiline
                        size="small"
                        value={formItem.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                      />
                    </Grid>

                    <Grid item lg={2} md={3} xs={12}>
                      <Typography className="font-medium md:absolute md:-top-[38px]" color="text.primary">
                        Cost
                      </Typography>
                      <TextField
                        fullWidth={isBelowMdScreen}
                        size="small"
                        type="number"
                        placeholder="24"
                        value={formItem.cost}
                        onChange={(e) => handleChange(index, 'cost', e.target.value)}
                        className="mbe-5"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                      {/* <div className="flex flex-col">
                        <Typography component="span" color="text.primary">
                          Discount:
                        </Typography>
                        <div className="flex gap-2">
                          <Typography component="span" color="text.primary">
                            0%
                          </Typography>
                          <Tooltip title="Tax 1" placement="top">
                            <Typography component="span" color="text.primary">
                              0%
                            </Typography>
                          </Tooltip>
                          <Tooltip title="Tax 2" placement="top">
                            <Typography component="span" color="text.primary">
                              0%
                            </Typography>
                          </Tooltip>
                        </div>
                      </div> */}
                    </Grid>

                    <Grid item md={2} xs={12}>
                      <Typography className="font-medium md:absolute md:-top-[38px]" color="text.primary">
                        Quantity
                      </Typography>
                      <TextField
                        fullWidth={isBelowMdScreen}
                        size="small"
                        type="number"
                        placeholder="1"
                        value={formItem.quantity}
                        onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </Grid>

                    <Grid item md={2} xs={12}>
                      <Typography className="font-medium md:absolute md:-top-[38px]" color="text.primary">
                        Price
                      </Typography>
                      <Typography color="text.primary">Rs.{formItem.cost * formItem.quantity}</Typography>
                    </Grid>
                  </Grid>

                  <div className="flex flex-col justify-start border-is">
                    <IconButton size="small" onClick={() => deleteForm(index)}>
                      <i className="ri-close-line text-2xl text-actionActive" />
                    </IconButton>
                  </div>
                </div>
              ))}

              <Grid item xs={12}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={addItem}
                  startIcon={<i className="ri-add-line" />}
                >
                  Add Item
                </Button>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid item xs={12}>
              <div className='flex justify-between flex-col gap-4 sm:flex-row'>
                <div className='flex flex-col gap-4 order-2 sm:order-[unset]'>
                  {/* <div className='flex items-center gap-2'>
                    <Typography className='font-medium' color='text.primary'>
                      Salesperson:
                    </Typography>
                    <TextField size='small' defaultValue='Tommy Shelby' />
                  </div> */}
                  <TextField size='small' placeholder='Thanks for your business' />
                </div>
                <div className='min-is-[200px]'>
                  <div className='flex items-center justify-between'>
                    <Typography>Subtotal:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      {totals.totalAmount}
                    </Typography>
                  </div>
                  {/* <div className='flex items-center justify-between'>
                    <Typography>Discount:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      $28
                    </Typography>
                  </div> */}
                  <div className='flex items-center justify-between'>
                    <Typography>GST (18%):</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      {totals.gst}
                    </Typography>
                  </div>
                  <Divider className='mlb-2' />
                  <div className='flex items-center justify-between'>
                    <Typography>Total:</Typography>
                    <Typography className='font-medium' color='text.primary'>
                      {totals.grandTotal}
                    </Typography>
                  </div>
                </div>
              </div>
            </Grid>
            <Grid item xs={12}>
              <Divider className='border-dashed' />
            </Grid>
            <Grid item xs={12}>
              <InputLabel htmlFor='invoice-note' className='inline-flex mbe-1 text-textPrimary'>
                Note:
              </InputLabel>
              <TextField
                onChange={event => setNote(event.target.value)}
                id='invoice-note'
                rows={2}
                fullWidth
                multiline
                defaultValue={note}
              />
            </Grid>
            <Grid item xs={12} display={'flex'} justifyContent={'flex-end'}>
              <Button onClick={handleSubmit} variant='contained' color='success'>Generate Invoice</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <AddCustomerDrawer open={open} setOpen={setOpen} onFormSubmit={onFormSubmit} />
    </>
  )
}

export default AddAction
