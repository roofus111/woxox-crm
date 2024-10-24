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
import Typography from '@mui/material/Typography'

// Column Definitions
const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('createdAt', {
    cell: info => info.getValue(),
    header: 'Created',
    cell: info => new Date(info.getValue()).toLocaleString()
  }),
  columnHelper.accessor('leadId.name', {
    cell: info => info.getValue(),
    header: 'Lead Name'
  }),
  columnHelper.accessor('status', {
    cell: info => info.getValue(),
    header: 'Follow-Up Status'
  }),

  columnHelper.accessor('nextFollowUpDate', {
    cell: info => info.getValue(),
    header: 'Scheduled On',
    cell: info => new Date(info.getValue()).toLocaleString()
  }),
  columnHelper.accessor('assignedTo.name', {
    cell: info => info.getValue(),
    header: 'Assigned To'
  }),
  columnHelper.accessor('createdBy.name', {
    cell: info => info.getValue(),
    header: 'Created By'
  }),
  columnHelper.accessor('notes', {
    cell: info => info.getValue(),
    header: 'Notes'
  })
]

const BasicDataTables = () => {
  // const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
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
      .get('http://localhost:8000/api/followups/', {
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
  }, [])

  return (
    <Card>
      <CardHeader title='Follow Ups' />
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

export default BasicDataTables
