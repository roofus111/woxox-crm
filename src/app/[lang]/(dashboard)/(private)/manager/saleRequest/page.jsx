
'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'
import Button from '@mui/material/Button'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'


// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'


// Style Imports

import styles from '@core/styles/table.module.css'
import { IconButton } from '@mui/material'
import { toast } from 'react-toastify'
import Link from 'next/link'



const SalesRequest = () => {
    // const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])


    const columnHelper = createColumnHelper()

    const columns = [
        columnHelper.accessor('SalesId', {
            cell: info => `ID ${info.getValue()}`,
            header: 'Ref. ID'
        }),
        columnHelper.accessor('LeadId.name', {
            cell: info => info.getValue(),
            header: 'Full Name'
        }),
        columnHelper.accessor('LeadId.phone', {
            cell: info => info.getValue(),
            header: 'Phone'
        }),
        columnHelper.accessor('LeadId.email', {
            cell: info => info.getValue(),
            header: 'Email'
        }),
        columnHelper.accessor('LeadId.campaignid.name', {
            cell: info => info.getValue(),
            header: 'Campaign'
        }),
        // columnHelper.accessor('LeadId.profile.programOfInterest', {
        //     cell: info => info.getValue(),
        //     header: 'Course'
        // }),
        columnHelper.accessor('', {
            header: 'Actions',
            cell: (info) => {
                const rowData = info.row.original; // Access the original row data
                return (
                    // <div>
                    //     <IconButton color='primary' size='small'>
                    //         <i className='ri-eye-fill ' />
                    //     </IconButton>
                    //     {rowData?.LeadId?.status === 'Converted' ? (
                    //         <>
                    //             <Button onClick={() => handleApprove(rowData.LeadId._id)} color="success">Approve</Button>
                    //             <IconButton color='error' size='small'>
                    //                 <i className='ri-close-fill ' />
                    //             </IconButton>
                    //         </>
                    //     ) : <Link href={`saleRequest/createInvoice?id=${rowData?.LeadId?._id}`} passHref>
                    //         <IconButton color="primary" size="small">
                    //             <i className="ri-bill-fill" />
                    //         </IconButton>
                    //     </Link>
                    //     }
                    // </div>
                    <div>
                        {rowData.accepted ? (
                            <><IconButton color='primary' size='small' onClick={() => handleOpen(rowData)}>
                                <i className='ri-eye-fill ' />
                            </IconButton><Link href={`saleRequest/createInvoice?id=${rowData?.LeadId?._id}&sales=${rowData?._id}`} passHref>
                                    <IconButton color="primary" size="small">
                                        <i className="ri-bill-fill" />
                                    </IconButton>
                                </Link></>
                        ) : (
                            <Button variant='contained' color='success' onClick={() => handleAccept(rowData._id)}>
                                Accept
                            </Button>
                        )}



                    </div>
                );
            }
        })
    ]
    const [refresh, setRefresh] = useState(false)
    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('No authorization token found.')
                return
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/accept`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ SalesId: id })
            })

            if (!response.ok) {
                const errorData = await response.json()
                toast.error(errorData.message || 'Failed to accept sale request')
                return
            }

            const data = await response.json()
            toast.success('Sale request accepted successfully')

            // Refresh the data
            setRefresh(!refresh)

        } catch (error) {
            console.error('Error accepting sale request:', error)
            toast.error('Failed to accept sale request')
        }
    }







    // const handleApprove = async (id) => {
    //     try {
    //         const token = localStorage.getItem('token')
    //         if (!token) {
    //             toast.error('No authorization token found.')

    //             return
    //         }
    //         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}/status`, {
    //             method: 'PUT',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${token}`
    //             },
    //             body: JSON.stringify({ status: "Pending" }),
    //         });
    //         if (!response.ok) {
    //             toast.error("Something goes wrong")
    //         }
    //         const data = await response.json();
    //         toast.success(`Lead Status changes to ${data.lead.status}`)
    //     } catch (error) {
    //         console.error('Failed to update lead status:', error);
    //         throw error; // Rethrow error to handle in the UI
    //     }
    // }


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
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                if (isMounted) {
                    setData(response.data.salesData) // Update data if component is still mounted
                    console.log(response.data.salesData)
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
    }, [refresh])

    const [open, setOpen] = useState(false);
    const [rowData, setRowData] = useState(null);
    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = (rowData) => {
        setOpen(true);
        setRowData(rowData.invoice);
    };




    return (
        <><Card>
            <CardHeader title='Sales Request' />
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
                            .rows.slice(0, 25)
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
        </Card>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Sale Request Details"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {rowData && rowData.length > 0 ? (
                            <List>
                                {rowData.map((invoice, index) => (
                                    <div key={invoice._id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`Invoice #${index + 1}`}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2">
                                                            Total Amount: ₹{invoice.totalAmount}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            GST: ₹{invoice.gst}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            Grand Total: ₹{invoice.grandTotal}
                                                        </Typography>

                                                        <br />
                                                        <Link href={`/manager/saleRequest/preview?id=${invoice.refId}`} passHref>
                                                            <IconButton color="primary" size="small">
                                                                <i className="ri-eye-fill" />
                                                            </IconButton>
                                                        </Link>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                        {index < rowData.length - 1 && <Divider />}
                                    </div>
                                ))}
                            </List>
                        ) : (
                            <Typography>No invoices found</Typography>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
export default SalesRequest
