
'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'

// Data Imports
import defaultData from './data'

// Column Definitions
const columnHelper = createColumnHelper()

const columns = [
    columnHelper.accessor('name', {
        cell: info => info.getValue(),
        header: 'Full Name'
    }),
    columnHelper.accessor('fullName', {
        cell: info => info.getValue(),
        header: 'Full Name'
    }),
    columnHelper.accessor('email', {
        cell: info => info.getValue(),
        header: 'Email'
    }),
    columnHelper.accessor('start_date', {
        cell: info => info.getValue(),
        header: 'Date'
    }),
    columnHelper.accessor('experience', {
        cell: info => info.getValue(),
        header: 'Experience'
    }),
    columnHelper.accessor('age', {
        cell: info => info.getValue(),
        header: 'Age'
    })
]

const salesRequest = () => {
    // const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])

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
            .get('http://localhost:8000/api/leads/search?status=Converted', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                if (isMounted) {
                    setData(response.data.leads) // Update data if component is still mounted
                    console.log(response.data.leads)
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
            <CardHeader title='Basic Table' />
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
        </Card>
    )
}
export default salesRequest
