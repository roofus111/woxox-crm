// React Imports
'use client'
import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender // Make sure to import flexRender
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

// Style Imports
import styles from '@core/styles/table.module.css'

// Updated Default Data

// Column Helper
const columnHelper = createColumnHelper()

// Fuzzy Filter Function
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Debounced Input Component
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} size='small' value={value} onChange={e => setValue(e.target.value)} />
}

// Kitchen Sink Component
const KitchenSink = () => {
  const [data, setData] = useState(() => [])
  const [globalFilter, setGlobalFilter] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
        setError('Failed to fetch data.')
        setLoading(false)
      })

    // Cleanup function
  }, [])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', { header: 'Name' }),
      columnHelper.accessor('email', { header: 'Email' }),
      columnHelper.accessor('phone', { header: 'Phone' }),
      columnHelper.accessor('campaign', { header: 'Campaign' }),
      columnHelper.accessor('status', { header: 'Status' })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <Card>
      <CardHeader
        title='Kitchen Sink'
        action={<DebouncedInput value={globalFilter} onChange={setGlobalFilter} placeholder='Search all columns...' />}
      />
      <div className='overflow-x-auto'>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        component='div'
        count={table.getRowModel().rows.length}
        onPageChange={(event, newPage) => table.setPageIndex(newPage)}
        onRowsPerPageChange={event => table.setPageSize(parseInt(event.target.value, 10))}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Card>
  )
}

export default KitchenSink
