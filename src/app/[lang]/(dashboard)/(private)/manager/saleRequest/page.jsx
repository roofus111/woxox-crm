
'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'
import Button from '@mui/material/Button'
// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'
import { IconButton } from '@mui/material'
import { toast } from 'react-toastify'
import Link from 'next/link'



const salesRequest = () => {
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
        columnHelper.accessor('LeadId.profile.countryOfInterest', {
            cell: info => info.getValue(),
            header: 'Country'
        }),
        columnHelper.accessor('LeadId.profile.programOfInterest', {
            cell: info => info.getValue(),
            header: 'Course'
        }),
        columnHelper.accessor('', {
            header: 'Actions',
            cell: (info) => {
                const rowData = info.row.original; // Access the original row data
                return (
                    <div>
                        <IconButton color='primary' size='small'>
                            <i className='ri-eye-fill ' />
                        </IconButton>
                        {rowData.LeadId.status === 'Converted' ? (
                            <>
                                <Button onClick={() => handleApprove(rowData.LeadId._id)} color="success">Approve</Button>
                                <IconButton color='error' size='small'>
                                    <i className='ri-close-fill ' />
                                </IconButton>
                            </>
                        ) : <Link href={`saleRequest/createInvoice?id=${rowData.LeadId._id}`} passHref>
                            <IconButton color="primary" size="small">
                                <i className="ri-bill-fill" />
                            </IconButton>
                        </Link>
                        }
                    </div>
                );
            }
        })
    ]

    const handleApprove = async (id) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('No authorization token found.')

                return
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: "Pending" }),
            });
            if (!response.ok) {
                toast.error("Something goes wrong")
            }
            const data = await response.json();
            toast.success(`Lead Status changes to ${data.lead.status}`)
        } catch (error) {
            console.error('Failed to update lead status:', error);
            throw error; // Rethrow error to handle in the UI
        }
    }
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
    }, [])
    return (
        <Card>
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
    )
}
export default salesRequest
