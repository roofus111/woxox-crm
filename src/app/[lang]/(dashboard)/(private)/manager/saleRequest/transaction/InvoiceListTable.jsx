'use client'

// React Imports
import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
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
import { getInitials } from '@/utils/getInitials'
import { getLocalizedUrl } from '@/utils/i18n'

// Modal Component Import
import InvoiceModal from './InvoiceModal'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Filter function
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// DebouncedInput component
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size="small" />
}

const invoiceStatusObj = {
  Pending: { color: 'secondary', icon: 'ri-send-plane-2-line' },
  Sent: { color: 'secondary', icon: 'ri-send-plane-2-line' },
  Paid: { color: 'success', icon: 'ri-check-line' },
  Draft: { color: 'primary', icon: 'ri-mail-line' },
  'Partial Payment': { color: 'warning', icon: 'ri-pie-chart-2-line' },
  'Past Due': { color: 'error', icon: 'ri-information-line' },
  Downloaded: { color: 'info', icon: 'ri-arrow-down-line' }
}

const columnHelper = createColumnHelper()

const InvoiceListTable = ({ invoiceData }) => {
  // States for table data and UI
  const [status, setStatus] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // States for the Modal invoice view
  const [openModal, setOpenModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Fetch invoice data from API
  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data)
        console.log('Fetched Invoices:', response.data)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
      })
  }, [])

  // Get locale from URL params
  const { lang: locale } = useParams()

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      columnHelper.accessor('paymentId', {
        header: 'Date',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <Typography className="font-medium" color="text.primary">
                {row.original.paymentId}
              </Typography>
              <Typography variant="body2">RefID {row.original.invoice?.invoiceNumber}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('_Id', {
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {getAvatar({ avatar: row.original.avatar, name: row.original.leadId?.name })}
            <div className="flex flex-col">
              <Typography className="font-medium" color="text.primary">
                {row.original.leadId?.name}
              </Typography>
              <Typography variant="body2">{row.original.leadId?.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('paymentMethod', {
        header: 'Payment Mode',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <Typography className="font-medium" color="text.primary">
                {row.original.paymentMethod}
              </Typography>
              <Typography variant="body2">{row.original.paymentStatus}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <Typography className="font-medium" color="text.primary">
                {row.original.amount}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('createdAt', {
        header: 'Created At',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <Typography variant="body2">
                {new Date(row.original.createdAt).toLocaleString()}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex items-center gap-0.5">
            <IconButton
              size="small"
              onClick={() => setData(data.filter(invoice => invoice.id !== row.original.id))}
            >
              <i className="ri-delete-bin-7-line text-textSecondary" />
            </IconButton>
            <IconButton size="small" onClick={() => handleViewInvoice(row.original)}>
              <i className="ri-eye-line text-textSecondary" />
            </IconButton>
            {/* <OptionMenu
              iconClassName="text-textSecondary"
              options={[
                {
                  text: 'Download',
                  icon: 'ri-download-line',
                  menuItemProps: {
                    onClick: () => handleDownloadInvoice(),
                    className: 'flex items-center gap-2'
                  }
                },
                {
                  text: 'Edit',
                  icon: 'ri-pencil-line',
                  href: getLocalizedUrl(`/apps/invoice/edit/${row.original.id}`, locale),
                  linkProps: {
                    className: 'flex items-center plb-2 pli-5 gap-2'
                  }
                },
                {
                  text: 'Duplicate',
                  icon: 'ri-file-copy-line',
                  menuItemProps: { className: 'flex items-center gap-2' }
                }
              ]}
            /> */}
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  // Helper function for avatar display
  const getAvatar = ({ avatar, name }) => {
    if (avatar) {
      return <CustomAvatar src={avatar} skin="light" size={34} />
    }
    return (
      <CustomAvatar skin="light" size={34}>
        {getInitials(name)}
      </CustomAvatar>
    )
  }

  // Update filtered data when 'status' or 'data' changes
  useEffect(() => {
    const filtered = data.filter(invoice => {
      if (status && invoice.invoiceStatus?.toLowerCase().replace(/\s+/g, '-') !== status) return false
      return true
    })
    setFilteredData(filtered)
  }, [status, data])

  // Initialize table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: { pageSize: 10 }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // Handler to open the modal with selected invoice details
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setOpenModal(true)
  }

  // Handler to close the modal
  const handleCloseModal = () => {
    setOpenModal(false)
    setSelectedInvoice(null)
  }

  // Handler for downloading invoice as PDF using jsPDF
  const handleDownloadInvoice = () => {
    if (!selectedInvoice) return

    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF()
      doc.text(`Invoice Number: ${selectedInvoice.invoice?.invoiceNumber || 'N/A'}`, 10, 10)
      doc.text(`Description: ${selectedInvoice.description}`, 10, 20)
      doc.text(
        `Created At: ${new Date(selectedInvoice.createdAt).toLocaleString()}`,
        10,
        30
      )
      doc.text(`Amount: ${selectedInvoice.amount}`, 10, 40)
      // Add any additional invoice details here

      doc.save(`${selectedInvoice.invoice?.invoiceNumber || 'invoice'}.pdf`)
    })
  }


  return (
    <Card>
      <CardContent className="flex justify-between flex-col sm:flex-row gap-4 flex-wrap items-start sm:items-center">
        <Button
          variant="contained"
          component={Link}
          startIcon={<i className="ri-add-line" />}
          href={getLocalizedUrl('apps/invoice/add', locale)}
          className="max-sm:is-full"
        >
          Create Invoice
        </Button>
        <div className="flex items-center flex-col sm:flex-row max-sm:is-full gap-4">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder="Search Invoice"
            className="max-sm:is-full min-is-[250px]"
          />
          <FormControl fullWidth size="small" className="max-sm:is-full min-is-[175px]">
            <InputLabel id="status-select">Invoice Status</InputLabel>
            <Select
              fullWidth
              id="select-status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              label="Invoice Status"
              labelId="status-select"
            >
              <MenuItem value="">none</MenuItem>
              <MenuItem value="downloaded">Downloaded</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="partial-payment">Partial Payment</MenuItem>
              <MenuItem value="past-due">Past Due</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
            </Select>
          </FormControl>
        </div>
      </CardContent>
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {!header.isPlaceholder && (
                      <div
                        className={classnames({
                          'flex items-center': header.column.getIsSorted(),
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <i className="ri-arrow-up-s-line text-xl" />,
                          desc: <i className="ri-arrow-down-s-line text-xl" />
                        }[header.column.getIsSorted()] || null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          {table.getFilteredRowModel().rows.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length} className="text-center">
                  No data available
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {table
                .getRowModel()
                .rows.slice(0, table.getState().pagination.pageSize)
                .map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          )}
        </table>
      </div>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        className="border-bs"
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />

      {/* Invoice Modal */}
      {openModal && (
        <InvoiceModal
          invoice={selectedInvoice}
          open={openModal}
          onClose={handleCloseModal}
          onDownload={handleDownloadInvoice}
        />
      )}
    </Card>
  )
}

export default InvoiceListTable
