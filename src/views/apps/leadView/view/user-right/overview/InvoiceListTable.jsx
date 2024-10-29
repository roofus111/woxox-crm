'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import TablePagination from '@mui/material/TablePagination'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Vars
const invoiceStatusObj = {
  Sent: { color: 'secondary', icon: 'ri-send-plane-2-line' },
  Paid: { color: 'success', icon: 'ri-check-line' },
  Draft: { color: 'primary', icon: 'ri-mail-line' },
  'Partial Payment': { color: 'warning', icon: 'ri-pie-chart-2-line' },
  'Past Due': { color: 'error', icon: 'ri-information-line' },
  Downloaded: { color: 'info', icon: 'ri-arrow-down-line' }
}

// Column Definitions

const InvoiceListTable = ({ id }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const columnHelper = createColumnHelper()
  // Vars
  const open = Boolean(anchorEl)

  // Hooks
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      columnHelper.accessor('uploadedAt', {
        header: 'Created Date',
        cell: info => info.getValue()
      }),
      columnHelper.accessor('docName', {
        header: 'Document Name',
        cell: info => info.getValue()
      }),

      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton onClick={() => setData(data?.filter(invoice => invoice.id !== row.original.id))} size='small'>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <i
                className='ri-download-line'
                onClick={() => (window.location.href = `https://app.canbridge.in/api/leads/docs/${row.original._id}`)}
              />
            </IconButton>
            <OptionMenu
              iconClassName='text-textSecondary'
              options={[
                {
                  text: 'Download',
                  icon: 'ri-download-line',
                  menuItemProps: { className: 'flex items-center gap-2' }
                },
                {
                  text: 'Edit',
                  icon: 'ri-pencil-line',
                  href: getLocalizedUrl(`/apps/invoice/edit/${row.original.id}`, locale),
                  linkProps: {
                    className: classnames('flex items-center bs-[40px] plb-2 pli-5 is-full gap-2')
                  }
                },
                {
                  text: 'Duplicate',
                  icon: 'ri-file-copy-line',
                  menuItemProps: { className: 'flex items-center gap-2' }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true // Flag to check if component is still mounted

    const token = localStorage.getItem('token')

    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    axios
      .get(`https://app.canbridge.in/api/leads/docs/bylead/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (isMounted) {
          console.log(response.data)

          setData(response.data) // Update data if component is still mounted
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
  }, []) // Empty dependency array means this runs only once on mount

  if (loading) return <Typography>Loading...</Typography>
  if (error) return <Typography color='error'>{error}</Typography>
  return (
    <Card>
      <CardHeader
        title='Invoice List'
        sx={{ '& .MuiCardHeader-action': { m: 0 } }}
        action={
          <>
            <Button
              variant='contained'
              aria-haspopup='true'
              onClick={handleClick}
              aria-expanded={open ? 'true' : undefined}
              endIcon={<i className='ri-upload-2-line' />}
              aria-controls={open ? 'user-view-overview-export' : undefined}
            >
              Export
            </Button>
            <Menu open={open} anchorEl={anchorEl} onClose={handleClose} id='user-view-overview-export'>
              <MenuItem onClick={handleClose} className='uppercase'>
                pdf
              </MenuItem>
              <MenuItem onClick={handleClose} className='uppercase'>
                xlsx
              </MenuItem>
              <MenuItem onClick={handleClose} className='uppercase'>
                csv
              </MenuItem>
            </Menu>
          </>
        }
      />
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} {...(header.id === 'action' && { className: 'is-24' })}>
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='ri-arrow-up-s-line text-xl' />,
                            desc: <i className='ri-arrow-down-s-line text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table
              .getRowModel()
              .rows.slice(0, table.getState().pagination.pageSize)
              .map(row => {
                return (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} {...(cell.id.includes('action') && { className: 'is-24' })}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        className='border-bs'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        SelectProps={{
          inputProps: { 'aria-label': 'rows per page' }
        }}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default InvoiceListTable
