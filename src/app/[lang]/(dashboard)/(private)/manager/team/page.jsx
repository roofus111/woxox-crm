'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'

// Third-party Imports
import { useDropzone } from 'react-dropzone'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import { toast } from 'react-toastify'
import axios from 'axios'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'
const columnHelper = createColumnHelper()
const columns = [
  columnHelper.accessor('createdAt', {
    cell: info => info.getValue(),
    header: 'Created At',
    cell: info => new Date(info.getValue()).toLocaleString()
  }),
  columnHelper.accessor('firstName', {
    cell: info => info.getValue(),
    header: 'First Name'
  }),
  columnHelper.accessor('lastName', {
    cell: info => info.getValue(),
    header: 'Last Name'
  }),
  columnHelper.accessor('email', {
    cell: info => info.getValue(),
    header: 'Email'
  }),
  columnHelper.accessor('phone', {
    cell: info => info.getValue(),
    header: 'Phone',
    cell: info => info.getValue()
  }),
  columnHelper.accessor('role', {
    cell: info => info.getValue(),
    header: 'Role',
    cell: info => info.getValue()
  })
]
const Teams = () => {
  // States
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const sentData = {
        ...formData,
        name: formData.firstName + ' ' + formData.lastName,
        password: formData.firstName + '@CRMpass24',
        role: 'user'
      }
      //   Example API call to submit the form
      const response = await fetch('http://13.127.160.185:8000/api/user-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(sentData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Lead submitted successfully!')
        handleReset() // Reset form after successful submission
      } else {
        setError(data.message || 'An error occurred. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      name: '',
      email: '',
      phone: ''
    })
    setError('')
    setSuccess('')
  }

  const [open, setOpen] = useState(false)

  const handleClickOpen = () => setOpen(true)

  const handleClose = () => {
    setOpen(false)
  }

  const [data, setData] = useState([])

  // if (loading) return <Typography>Loading...</Typography>
  // if (error) return <Typography color='error'>{error}</Typography>
  // States

  // Hooks
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  useEffect(() => {
    let isMounted = true // Flag to check if component is still mounted

    const token = localStorage.getItem('token')

    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    axios
      .get('http://13.127.160.185:8000/api/user-profiles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (isMounted) {
          setData(response.data) // Update data if component is still mounted
          console.log(response.data)
          setLoading(false)
        }
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
        if (isMounted) {
          setError('Failed to fetch data.')
          setLoading(false)
        }
      })
    return () => {
      isMounted = false // Cleanup flag when component unmounts
    }
  }, [success])

  return (
    <>
      <Box margin={5} display={'flex'} justifyContent={'flex-end'}>
        <Button variant='contained' onClick={handleClickOpen}>
          Add Employee
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title'>Create New Employee</DialogTitle>
        <DialogContent>
          <form>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='First Name'
                    placeholder='First Name '
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Last Name'
                    value={formData.lastName}
                    placeholder='Last Name'
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Email'
                    type='email'
                    value={formData.email}
                    placeholder='example@gmail.com'
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Phone'
                    value={formData.phone}
                    type='tel'
                    placeholder='+91 8893648965'
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </Grid>
                {error && (
                  <Grid item xs={12}>
                    <Typography variant='body2' color='error'>
                      {error}
                    </Typography>
                  </Grid>
                )}
                {success && (
                  <Grid item xs={12}>
                    <Typography variant='body2' color='success'>
                      {success}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSubmit} variant='contained' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
          <Button type='reset' variant='outlined' onClick={handleReset} disabled={loading}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
      <Card>
        <CardHeader title='Create a new Lead' />
        <Divider />
        <div className='overflow-x-auto'>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, 10)
                .map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>{' '}
    </>
  )
}

export default Teams
