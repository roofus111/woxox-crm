'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'

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
import Switch from '@mui/material/Switch';
import DialogContentText from '@mui/material/DialogContentText'
import { toast } from 'react-toastify'
import axios from 'axios'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { MenuItem } from '@mui/material'

// Style Imports
import styles from '@core/styles/table.module.css'
const columnHelper = createColumnHelper()

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
  const [open, setOpen] = useState(false)
  const [data, setData] = useState([])
  const [rows, setRows] = useState([]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const sentData = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        role: `${formData.role}`,
        password: `${formData.firstName}@CRMpass24`,
      };

      let response;
      if (formData._id) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/put/${formData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sentData),
        });
      } else {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sentData),
        });
      }

      const responseData = await response.json();

      if (response.ok) {
        toast.success(formData._id ? 'Employee updated successfully!' : 'Employee created successfully!');
        fetchData(); // Refetch data to refresh the table
        handleReset();
        setOpen(false);
      } else {
        setError(responseData.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Error during submit:', error);
    } finally {
      setLoading(false);
    }
  };


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

  const handleClickOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleEdit = async (user) => {
    setFormData({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setOpen(true); // Open the dialog for editing
  }

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Set the fetched data
      console.log("users", response.data);

      setData(response.data);

    } catch (err) {
      setError('Failed to fetch data.');
      toast.error('Failed to fetch employee data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // const handleDelete = async (user) => {
  //   try {
  //     console.log('User to delete:', user); // Debug: Check the user object
  //     if (!user._id) {
  //       console.error('User does not have an _id. Delete operation aborted.');
  //       toast.error('Unable to delete user: Missing user ID.');
  //       return;
  //     }

  //     const token = localStorage.getItem('token');
  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-profiles/delete/${user._id}`, {
  //       method: 'DELETE',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.ok) {
  //       toast.success('Employee deleted successfully!');
  //       // Update the state by removing the deleted user
  //       setData((prevData) => {
  //         const updatedData = prevData.filter((item) => item._id !== user._id);
  //         console.log('Updated data:', updatedData); // Debug: Verify filtered data
  //         return updatedData;
  //       });
  //     } else {
  //       const errorData = await response.json();
  //       console.error('Error response:', errorData); // Debug: Log error response from server
  //       toast.error(errorData.message || 'Failed to delete user.');
  //     }
  //   } catch (err) {
  //     console.error('Error deleting user:', err); // Debug: Log unexpected error
  //     toast.error('An error occurred while deleting the user.');
  //   }
  // };

  const handleToggleActive = (row) => {
    // Skip toggling the active/inactive status for admin role
    if (row.role === "admin") return;
  
    // Toggle the active/inactive status for non-admin users
    const updatedStatus = !row.isActive;
  
    // Optimistically update the status in the frontend
    setRows((prevRows) =>
      prevRows.map((user) =>
        user._id === row._id ? { ...user, isActive: updatedStatus } : user
      )
    );
  
    // Update the status in the backend
    updateRowStatus(row._id, updatedStatus);
  };
  
  const updateRowStatus = async (id, isActive) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('token');
  
    console.log(`Updating row with ID: ${id} to active status: ${isActive}`);
  
    try {
      const response = await axios.put(
        `${apiUrl}/api/user-profiles/${id}/toggle-status`,
        { isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.status === 200) {
        console.log('Status updated successfully:', response.data);
        // After the status update, refetch the data or update specific row
        fetchData(); // Call a function to fetch the latest data
      } else {
        console.error('Failed to update status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating status:', error.message);
    }
  };
  
  const columns = [
    columnHelper.accessor('createdAt', {
      header: 'Created At',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
      id: 'fullName',
      header: 'Full Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
    }),
    columnHelper.accessor('phone', {
      header: 'Phone',
    }),
    columnHelper.accessor('role', {
      header: 'Role',
    }),
    columnHelper.display({
      header: 'Actions',
      cell: ({ row }) => (
        <Box display="flex" justifyContent="center" gap={1}>
          <IconButton onClick={() => handleEdit(row.original)} size="small">
            <i className="ri-edit-line" style={{ fontSize: '1.2rem', color: '#1976d2' }}></i>
          </IconButton>
          <Switch
            checked={row.original.isActive}
            onChange={() => handleToggleActive(row.original)}
            color="primary"
            disabled={row.original.role === "admin"} // Disable the switch for admins
            sx={{
              // Change the color of the disabled switch for admins
              '&.Mui-disabled': {
                color: row.original.role === "admin" ? '#9e9e9e' : 'primary.main', // Modify the color for admins
              },
            }}
          />
        </Box>
      ),
    }),
  ];  

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  return (
    <>
      <Box margin={5} display={'flex'} justifyContent={'flex-end'}>
        <Button variant='contained' onClick={handleClickOpen}>
          Add Employee
        </Button>
      </Box>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Create/Edit Employee</DialogTitle>
        <DialogContent>
          <form>
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    placeholder="First Name "
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    placeholder="Last Name"
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    placeholder="example@gmail.com"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    type="tel"
                    placeholder="+91 8893648965"
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                  </TextField>
                </Grid>
                {error && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error">
                      {error}
                    </Typography>
                  </Grid>
                )}
                {success && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="success">
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
        <CardHeader title="User List" />
        <Divider />
        <div className="overflow-x-auto">
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
              {table.getRowModel().rows.slice(0, 100).map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

export default Teams
