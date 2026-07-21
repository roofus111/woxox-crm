'use client'

// React Imports
import { useState, useMemo, useEffect } from 'react'

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
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import axios from 'axios'
import { toast } from 'react-toastify'
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
const columnHelper = createColumnHelper()

const InvoiceListTable = ({ invoiceData, session }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState(...[invoiceData])
  const [globalFilter, setGlobalFilter] = useState('')
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  // Document Request & Upload States
  const [requestedDocuments, setRequestedDocuments] = useState([])
  const [fileToUpload, setFileToUpload] = useState(null)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [openDocRequestDialog, setOpenDocRequestDialog] = useState(false)
  const [selectedRequestedDocument, setSelectedRequestedDocument] = useState(null)
  const [newDocRequestName, setNewDocRequestName] = useState('')
  const [newDocRequestType, setNewDocRequestType] = useState('application/pdf')
  const [loading, setLoading] = useState(false)
  const [openDocsDialog, setOpenDocsDialog] = useState(false)

  // Vars
  const open = Boolean(anchorEl)

  // Hooks
  const { lang: locale } = useParams()

  // Fetch documents for selected invoice
  useEffect(() => {
    if (selectedInvoice) {
      fetchRequestedDocuments(selectedInvoice.id)
    }
  }, [selectedInvoice])

  // Function to fetch document requests
  const fetchRequestedDocuments = async (invoiceId) => {
    if (!invoiceId) return

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error("Authorization token is missing.")
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/files/${invoiceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        setRequestedDocuments(
          Array.isArray(response.data.files) ? response.data.files : []
        )
      } else {
        toast.error('Failed to fetch document requests.')
        setRequestedDocuments([])
      }
    } catch (error) {
      console.error('Error fetching requested files:', error)
      toast.error('Error fetching document requests.')
      setRequestedDocuments([])
    } finally {
      setLoading(false)
    }
  }

  // Function to request a document upload
  const requestDocumentUpload = async (invoiceId, docName, fileType = "application/pdf") => {
    const token = localStorage.getItem('token')
    if (!token) {
      toast.error("Authorization token is missing.")
      return
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/requestupload`,
        {
          leadId: invoiceId, // Using invoiceId as leadId for API compatibility
          docName,
          fileType,
          requestBy: session?.user?.id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response) {
        toast.success(`Document "${docName}" requested successfully.`)
        fetchRequestedDocuments(invoiceId)
      } else {
        toast.error('Failed to request document.')
      }
    } catch (error) {
      console.error('Error requesting document upload:', error)
      toast.error(`Error requesting document: ${error.response?.data?.message || error.message}`)
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0])
    }
  }

  // Handle file upload
  const handleUploadDocument = async () => {
    if (!fileToUpload) {
      toast.error("Please select a file to upload.")
      return
    }

    if (!selectedInvoice) {
      toast.error("Invoice information is missing.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Authorization token is missing.")
      return
    }

    // Prepare file data
    const formData = new FormData()
    formData.append("file", fileToUpload)
    formData.append("leadId", selectedInvoice.id) // Using invoice ID as lead ID

    // Get the document ID if uploading to a specific request
    const requestedDocumentId = selectedRequestedDocument ? selectedRequestedDocument._id : null

    try {
      const url = requestedDocumentId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload/${requestedDocumentId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`

      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response?.status === 200) {
        toast.success("File uploaded successfully.")
        fetchRequestedDocuments(selectedInvoice.id)
        setOpenUploadDialog(false)
        setFileToUpload(null)
        setSelectedRequestedDocument(null)
      } else {
        toast.error("Failed to upload file.")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error(`Upload failed: ${error.response?.data?.message || error.message}`)
    }
  }

  // Function to handle document deletion
  const handleDeleteDocument = async (fileId) => {
    if (!fileId) {
      toast.error("File ID is missing.")
      return
    }

    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Authorization token is missing.")
      return
    }

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/files/file/${fileId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        toast.success("Document deleted successfully.")
        fetchRequestedDocuments(selectedInvoice.id)
      } else {
        toast.error("Failed to delete the document.")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error(`Error deleting document: ${error.response?.data?.message || error.message}`)
    }
  }

  // Function to download a document
  const handleDownloadDocument = (fileUrl, fileName) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.setAttribute('download', fileName || 'document')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: '#',
        cell: ({ row }) => (
          <Typography
            component={Link}
            href={getLocalizedUrl(`/apps/invoice/preview/${row.original.id}`, locale)}
            color='primary'
          >{`#${row.original.id}`}</Typography>
        )
      }),
      columnHelper.accessor('invoiceStatus', {
        header: 'Status',
        cell: ({ row }) => (
          <Tooltip
            title={
              <div>
                <Typography variant='body2' component='span' className='text-inherit'>
                  {row.original.invoiceStatus}
                </Typography>
                <br />
                <Typography variant='body2' component='span' className='text-inherit'>
                  Balance:
                </Typography>{' '}
                {row.original.balance}
                <br />
                <Typography variant='body2' component='span' className='text-inherit'>
                  Due Date:
                </Typography>{' '}
                {row.original.dueDate}
              </div>
            }
          >
            <CustomAvatar skin='light' color={invoiceStatusObj[row.original.invoiceStatus].color} size={28}>
              <i className={classnames('text-base', invoiceStatusObj[row.original.invoiceStatus].icon)} />
            </CustomAvatar>
          </Tooltip>
        )
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: ({ row }) => <Typography>{`$${row.original.total}`}</Typography>
      }),
      columnHelper.accessor('issuedDate', {
        header: 'Issued Date',
        cell: ({ row }) => <Typography>{row.original.issuedDate}</Typography>
      }),
      columnHelper.accessor('documents', {
        header: 'Documents',
        cell: ({ row }) => (
          <div className='flex gap-2'>
            <Button
              variant='outlined'
              size='small'
              onClick={() => {
                setSelectedInvoice(row.original)
                setOpenDocsDialog(true)
              }}
              startIcon={<i className='ri-file-list-line' />}
            >
              Manage Docs
            </Button>
          </div>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center gap-0.5'>
            <IconButton onClick={() => setData(data?.filter(invoice => invoice.id !== row.original.id))} size='small'>
              <i className='ri-delete-bin-7-line text-textSecondary' />
            </IconButton>
            <IconButton size='small'>
              <Link href={getLocalizedUrl(`/apps/invoice/preview/${row.original.id}`, locale)} className='flex'>
                <i className='ri-eye-line text-textSecondary' />
              </Link>
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
                },
                {
                  text: 'Request Document',
                  icon: 'ri-file-search-line',
                  menuItemProps: {
                    className: 'flex items-center gap-2',
                    onClick: () => {
                      setSelectedInvoice(row.original)
                      setOpenDocRequestDialog(true)
                    }
                  }
                }
              ]}
            />
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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
    enableRowSelection: true,
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

      {/* Document Management Dialog */}
      <Dialog
        open={openDocsDialog}
        onClose={() => setOpenDocsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Manage Documents - Invoice #{selectedInvoice?.id}
        </DialogTitle>
        <DialogContent>
          {/* Action Buttons Row */}
          <div className="flex gap-3 mb-4">
            <Button
              variant="contained"
              color="primary"
              startIcon={<i className="ri-add-line"></i>}
              onClick={() => {
                setSelectedRequestedDocument(null)
                setOpenUploadDialog(true)
              }}
              className="flex-1"
            >
              New Document
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<i className="ri-file-search-line"></i>}
              onClick={() => {
                setOpenDocRequestDialog(true)
              }}
              className="flex-1"
            >
              Request Document
            </Button>
          </div>

          {/* Requested Documents Section */}
          <div className="mb-6">
            <Typography variant="h6" className="mb-2 font-medium flex items-center">
              <i className="ri-file-list-line mr-2"></i>
              Requested Documents
            </Typography>
            {loading ? (
              <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (requestedDocuments.filter(doc => !doc.fileUrl).length > 0) ? (
              <div className="space-y-2">
                {requestedDocuments
                  .filter(doc => !doc.fileUrl)
                  .map((doc) => (
                    <div
                      key={doc._id}
                      className="border rounded-lg p-3 bg-white flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="bg-amber-100 text-amber-700 p-2 rounded-full mr-3">
                          <i className="ri-file-warning-line"></i>
                        </div>
                        <div>
                          <Typography variant="body1" className="font-medium">
                            {doc.docName}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {doc.fileType?.split('/')[1]?.toUpperCase() || "Document"} •
                            Requested: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedRequestedDocument(doc)
                            setOpenUploadDialog(true)
                          }}
                        >
                          Upload
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDocument(doc._id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <Typography
                variant="body2"
                className="text-gray-500 italic bg-gray-50 p-3 rounded"
              >
                No pending document requests.
              </Typography>
            )}
          </div>

          {/* Uploaded Documents Section */}
          <div>
            <Typography variant="h6" className="mb-2 font-medium flex items-center">
              <i className="ri-file-list-3-line mr-2"></i>
              Uploaded Documents
            </Typography>
            {loading ? (
              <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (requestedDocuments.filter(doc => doc.fileUrl).length > 0) ? (
              <div className="space-y-2">
                {requestedDocuments
                  .filter(doc => doc.fileUrl)
                  .map((doc) => (
                    <div
                      key={doc._id}
                      className="border rounded-lg p-3 bg-white flex justify-between items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-700 p-2 rounded-full mr-3">
                          <i className="ri-file-check-line"></i>
                        </div>
                        <div>
                          <Typography variant="body1" className="font-medium">
                            {doc.docName}
                          </Typography>
                          <Typography variant="body2" className="text-gray-500">
                            {doc.fileType?.split('/')[1]?.toUpperCase() || "Document"} •
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDownloadDocument(doc.fileUrl, doc.docName)}
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteDocument(doc._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <Typography
                variant="body2"
                className="text-gray-500 italic bg-gray-50 p-3 rounded"
              >
                No documents have been uploaded yet.
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDocsDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={openUploadDialog} onClose={() => {
        setOpenUploadDialog(false)
        setFileToUpload(null)
        setSelectedRequestedDocument(null)
      }}>
        <DialogTitle>
          {selectedRequestedDocument ? 'Upload Requested Document' : 'Upload New Document'}
        </DialogTitle>
        <DialogContent>
          {selectedRequestedDocument ? (
            <Typography variant="body2" className="mb-4">
              Uploading: <strong>{selectedRequestedDocument.docName}</strong>
            </Typography>
          ) : (
            <>
              <TextField
                fullWidth
                margin="dense"
                label="Document Name"
                variant="outlined"
                value={newDocRequestName}
                onChange={(e) => setNewDocRequestName(e.target.value)}
                className="mb-3"
              />
              <TextField
                select
                fullWidth
                margin="dense"
                label="Document Type"
                variant="outlined"
                value={newDocRequestType}
                onChange={(e) => setNewDocRequestType(e.target.value)}
              >
                <MenuItem value="application/pdf">PDF Document</MenuItem>
                <MenuItem value="image/jpeg">Image (JPEG)</MenuItem>
                <MenuItem value="image/png">Image (PNG)</MenuItem>
                <MenuItem value="application/msword">Word Document</MenuItem>
                <MenuItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (DOCX)</MenuItem>
                <MenuItem value="application/vnd.ms-excel">Excel Spreadsheet</MenuItem>
                <MenuItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (XLSX)</MenuItem>
              </TextField>
            </>
          )}
          <div className="mt-4">
            <Typography variant="body2" className="mb-2">Select File</Typography>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenUploadDialog(false)
            setFileToUpload(null)
            setSelectedRequestedDocument(null)
          }} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleUploadDocument}
            color="primary"
            disabled={!fileToUpload}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Document Dialog */}
      <Dialog open={openDocRequestDialog} onClose={() => setOpenDocRequestDialog(false)}>
        <DialogTitle>Request Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Name"
            fullWidth
            variant="outlined"
            value={newDocRequestName}
            onChange={(e) => setNewDocRequestName(e.target.value)}
          />
          <TextField
            select
            margin="dense"
            label="File Type"
            fullWidth
            variant="outlined"
            value={newDocRequestType}
            onChange={(e) => setNewDocRequestType(e.target.value)}
          >
            <MenuItem value="application/pdf">PDF Document</MenuItem>
            <MenuItem value="image/jpeg">Image (JPEG)</MenuItem>
            <MenuItem value="image/png">Image (PNG)</MenuItem>
            <MenuItem value="application/msword">Word Document</MenuItem>
            <MenuItem value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word Document (DOCX)</MenuItem>
            <MenuItem value="application/vnd.ms-excel">Excel Spreadsheet</MenuItem>
            <MenuItem value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">Excel Spreadsheet (XLSX)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDocRequestDialog(false)
            setNewDocRequestName('')
            setNewDocRequestType('application/pdf')
          }} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedInvoice && selectedInvoice.id && newDocRequestName) {
                requestDocumentUpload(selectedInvoice.id, newDocRequestName, newDocRequestType)
                setOpenDocRequestDialog(false)
                setNewDocRequestName('')
                setNewDocRequestType('application/pdf')
              } else {
                toast.error("Please enter a document name.")
              }
            }}
            color="primary"
            disabled={!newDocRequestName}
          >
            Request Document
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default InvoiceListTable
