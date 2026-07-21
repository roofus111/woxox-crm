'use client'
import React, { useState, useEffect } from 'react'
import CreateSaleFormContent from './components/CreateSaleFormContent '
import axios from 'axios'
import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TableSortLabel,
  Dialog,
  Drawer,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Tabs,
  Tab,
  Avatar,
  TextField,
  Grid,
  Card,
  CardContent,
  MenuItem,
  IconButton,
  CircularProgress,
  Modal,
  Stack
} from '@mui/material'
import { useRouter } from 'next/navigation'
import AddCustomerForm from './components/AddCustomerForm'

const Customer = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [sortBy, setSortBy] = useState({ field: null, direction: 'asc' })
  const [selectedRows, setSelectedRows] = useState([])
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [customers, setCustomers] = useState([])
  const [customer, setCustomer] = useState(null)
  const [customersLoading, setCustomersLoading] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null)
  const [leadData, setLeadData] = useState([])
  const [leadsLoading, setLeadsLoading] = useState(false)
  const [leadsError, setLeadsError] = useState(null)

  const [isEditable, setIsEditable] = useState(false)
  const [customerId, setCustomerId] = useState('')

  const [salesData, setSalesData] = useState([])
  const [salesLoading, setSalesLoading] = useState(false)
  const [salesError, setSalesError] = useState(null)

  const [leadModalOpen, setLeadModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)

  const [createSaleOpen, setCreateSaleOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)

  const [activities, setActivities] = useState([])
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [activitiesError, setActivitiesError] = useState(null)

  const [documents, setDocuments] = useState([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [documentsError, setDocumentsError] = useState(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

const normalizeDocument = (d) => {
  if (!d) return null;
  return {
    _id: d._id || d.id || Math.random().toString(36).slice(2),
    fileName: d.fileName || d.docName || d.name || '',
    docName: d.docName || '',
    fileUrl: d.fileUrl || d.url || (d.Location || ''),
    fileType: d.fileType || d.type || '',
    uploadedAt: d.uploadedAt || d.lastModified || d.createdAt || null,
    createdBy: d.createdBy || (d.createdBy && typeof d.createdBy === 'object' ? d.createdBy : {}),
    raw: d
  };
};

const fetchCustomerDocuments = async (customerIdParam) => {
  setDocumentsLoading(true);
  try {
    const token = localStorage.getItem('token');
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/customer/getdocumentsbycustomer/${customerIdParam}`;
    const res = await axios.get(endpoint, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });

    console.log('FETCH RESPONSE keys:', Object.keys(res.data || {}));
    const raw = Array.isArray(res?.data?.document) ? res.data.document : [];
    const normalized = raw.map(normalizeDocument).filter(Boolean);

    const dedup = Array.from(new Map(normalized.map(d => [String(d._id), d])).values());
    setDocuments(dedup);
  } catch (err) {
    console.error('fetchCustomerDocuments error:', err);
    setDocuments([]); // keep UI consistent
  } finally {
    setDocumentsLoading(false);
  }
};

  const handleUploadSuccess = async (uploadRes, customerIdParam) => {
  console.log('UPLOAD RESPONSE:', uploadRes?.data);
  try {
    // backend returns created file at res.data.file -> add optimistically
    if (uploadRes?.data?.file) {
      const newDoc = normalizeDocument(uploadRes.data.file);
      setDocuments(prev => {
        // avoid duplicate
        if (prev.some(p => String(p._id) === String(newDoc._id))) return prev;
        return [newDoc, ...prev];
      });
    }
  } finally {
    // always re-fetch from server to reflect actual DB state
    await fetchCustomerDocuments(customerIdParam);
  }
};

  const fetchActivitiesData = async (customerIdParam) => {
    setActivitiesLoading(true)
    setActivitiesError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/getactivity/${customerIdParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      console.log('Activities Response:', response.data);
      
      if (response.data && response.data.activities) {
        setActivities(response.data.activities)
      } else {
        setActivities([])
      }
    } catch (error) {
      console.log('Error fetching activities:', error);
      setActivitiesError('Failed to fetch activities')
      setActivities([])
    } finally {
      setActivitiesLoading(false)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file || !customerId){
      alert('Please select a file and ensure customer is selected')
      return
    }

    setUploadingFile(true)
    setUploadProgress(0)

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('files', file)
      formData.append('customerId', customerId)

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/files/upload`, 
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (ProgressEvent) => {
            const percentCompleted = Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total)
            setUploadProgress(percentCompleted)
          }
        }
      )
      console.log('File upload response:', response.data);
      if (response.data.file) {
        setDocuments(prev => [ normalizeDocument(response.data.file), ...prev])
      }

    const fileInput = document.getElementById('file-upload-input')
    if (fileInput) fileInput.value = ''

    alert('File uploaded successfully!')

  } catch (error) {
    console.error('Error uploading file:', error)
    alert('Error uploading file: ' + (error.response?.data?.message || error.message))
  } finally {
    setUploadingFile(false)
    setUploadProgress(0)
  }
}

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const getFileIcon = (fileName) => {
  if (!fileName) return 'ri-file-line'
  
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return 'ri-file-pdf-line'
    case 'doc':
    case 'docx':
      return 'ri-file-word-line'
    case 'xls':
    case 'xlsx':
      return 'ri-file-excel-line'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return 'ri-image-line'
    case 'txt':
      return 'ri-file-text-line'
    default:
      return 'ri-file-line'
  }
}

const getFileTypeColor = (fileName) => {
  if (!fileName) return '#666'
  
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf':
      return '#ff4757'
    case 'doc':
    case 'docx':
      return '#2f5af0'
    case 'xls':
    case 'xlsx':
      return '#1dd1a1'
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return '#ff9f43'
    case 'txt':
      return '#a55eea'
    default:
      return '#666'
  }
}

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleViewFile = async (document) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/docs/${document._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // prefer endpoint URL, fallback to document.fileUrl
      const fileUrl = response?.data?.fileUrl || response?.data?.file?.fileUrl || document.fileUrl || document.url
      if (fileUrl) {
        window.open(fileUrl, '_blank')
      } else {
        console.error('No file URL found in response', response.data)
        alert('Unable to view file: No URL available')
      }
    } catch (error) {
      console.error('Error viewing file:', error)
      alert('Error viewing file: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleDeleteFile = async (documentId) => {
  try {
    // Show confirmation dialog
    const confirmDelete = window.confirm('Are you sure you want to delete this document? This action cannot be undone.')
    
    if (!confirmDelete) return
    
    const token = localStorage.getItem('token')
    
    // Use the API endpoint you specified: /api/files/file/{fileId}
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/files/file/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    
    console.log('File deleted successfully:', response.data)
    
    // Remove the deleted file from the documents state
    setDocuments(prev => prev.filter(doc => doc._id !== documentId))
    
    alert('Document deleted successfully!')
    
  } catch (error) {
    console.error('Error deleting file:', error)
    alert('Error deleting file: ' + (error.response?.data?.message || error.message))
  }
}

  const router = useRouter()

  // Handle sorting
  const handleSort = field => {
    const isAsc = sortBy.field === field && sortBy.direction === 'asc'
    setSortBy({ field, direction: isAsc ? 'desc' : 'asc' })
  }

  const sortedCustomers = [...customers].sort((a, b) => {
    if (!sortBy.field) return 0
    const valueA = a[sortBy.field]
    const valueB = b[sortBy.field]
    if (valueA < valueB) return sortBy.direction === 'asc' ? -1 : 1
    if (valueA > valueB) return sortBy.direction === 'asc' ? 1 : -1
    return 0
  })

  const handleOpenDrawer = customer => {
    setSelectedCustomer(customer)
    setCustomerId(customer._id)
    setDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setSelectedCustomer(null)
    setCustomerId('')
    setIsEditable(false)
    setFormData({})
    setDrawerOpen(false)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Placeholder functions for the buttons

  const invoiceData = [
    {
      id: 1,
      createdAt: '2024-06-12',
      billNumber: 'INV-2024-001',
      refId: 'REF12345',
      paymentStatus: 'Paid',
      totalAmount: '₹15,000',
      balance: '₹0'
    }
  ]

  const dummyPurchases = [
    {
      id: 'dummy-1',
      productName: 'Sony PlayStation 5 Pro',
      amount: 49999,
      date: '2025-07-01',
      category: 'PlayStation consoles',
      edition: 'Standard Edition'
    },
    {
      id: 'dummy-2',
      productName: 'Sony PlayStation 3D Wireless Headset',
      amount: 9999,
      date: '2025-06-20',
      category: 'Gaming Accessories',
      edition: 'Standard Edition'
    }
  ]

  const displayPurchases = customer?.purchases?.length > 0 ? customer.purchases : dummyPurchases

  const handleViewInvoice = () => {
    // Set the invoice details and open the modal
    setInvoiceDetails(invoiceData[0]) // Use the first item from the array
    setOpenModal(true)
  }

  const handleDownloadInvoice = async invoiceId => {
    try {
      // Simulating an API call to get the invoice file URL
      const invoiceUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/download/${invoiceId}`

      // Create anchor element to trigger the download
      const link = document.createElement('a')
      link.href = invoiceUrl // Set the file URL
      link.download = `Invoice-${invoiceId}.pdf` // Set the default filename
      link.click() // Trigger the download
    } catch (error) {
      console.error('Error downloading the invoice:', error)
    }
  }

  const fetchSalesData = async customerIdParam => {
    setSalesLoading(true)
    setSalesError(null)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/customer/${customerIdParam}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('Sales Response:', response.data)

      // Handle the new response structure
      if (response.data && response.data.success && response.data.sales && response.data.sales.length > 0) {
        const mappedSales = response.data.sales.map(sale => {
          // Calculate total amount from items if not provided
          const calculatedTotal = sale.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
          
          // Calculate total paid amount from invoices
          const totalPaidAmount = sale.invoices?.reduce((sum, invoice) => {
            return sum + (invoice.paidAmount || 0)
          }, 0) || sale.totalAmountPaid || 0;

          // Calculate balance amount
          const totalAmount = sale.totalAmount || calculatedTotal;
          const balanceAmount = totalAmount - totalPaidAmount;

          return {
            ...sale, // Keep all original data
            id: sale._id,
            
            // Map items to productIds format for display compatibility
            productIds: sale.items?.map(item => ({
              _id: item.product || item._id,
              name: item.itemName,
              description: item.description || 'No description available',
              price: item.unitPrice || 0,
              quantity: item.quantity || 1,
              total: item.total || 0
            })) || [],
            
            // Display date
            displayDate: new Date(sale.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            
            // Payment calculations
            totalAmount,
            totalPaidAmount,
            balanceAmount,
            
            // Ensure currency is set
            currency: sale.currency || 'INR'
          }
        })

        setSalesData(mappedSales)
      } else {
        console.log('No sales found or invalid response structure')
        setSalesData([]) // Set empty array if no sales
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
      setSalesError('Failed to fetch sales data')
      setSalesData([]) // Set empty array on error
    } finally {
      setSalesLoading(false)
    }
  }

  // Fetch customers dynamically
  const fetchCustomers = async () => {
    setCustomersLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomers`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log('Fetched customers:', response.data)
      response.data.customers.forEach(customer => {
        console.log('Customer ID:', customer._id)
      })
      setCustomers(response.data.customers) // Update the state with fetched data
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setCustomersLoading(false)
    }
  }

  // Function to add a new customer and update the customer list using ...prev
  const addCustomer = async customerData => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer/createcustomer`,
        customerData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      console.log('Customer added successfully:', response.data)

      // Extract the customer object from the response
      const newCustomer = response.data.customer // This is the actual customer object

      // Update customers list using spread operator to retain previous state
      setCustomers(prevCustomers => [
        ...prevCustomers, // Keep previous customers
        newCustomer // Add the newly created customer (not response.data, but response.data.customer)
      ])
      handleCloseDialog() // Close the dialog after successful submission
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const [openEditDialog, setOpenEditDialog] = useState(false)

  console.log(customerId)

  useEffect(() => {
    console.log('FormData updated:', formData)
    console.log('Gender value:', formData.gender)
    console.log('Status value:', formData.status)
  }, [formData])

  // 2. Update your useEffect for fetching customer data
  useEffect(() => {
    if (!customerId) return

    const fetchCustomerData = async () => {
      setCustomerLoading(true)
      setError(null)

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomer/${customerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        const { customer, leadIds } = response.data

        console.log('Raw customer from API:', customer) // Debug
        console.log('Customer gender:', customer.gender) // Debug
        console.log('Customer status:', customer.status) // Debug

        // Set formData with explicit handling
        const newFormData = {
          _id: customer._id,
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
          email: customer.email || '',
          phone: customer.phone || '',
          qualification: customer.qualification || '',
          occupation: customer.occupation || '',
          notes: customer.notes || '',
          dateOfBirth: customer.dateOfBirth || '',

          // Address fields
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          postalCode: customer.address?.postalCode || '',
          country: customer.address?.country || '',

          // These are the problematic fields - handle them explicitly
          gender: customer.gender || '', // Don't set a default like "Male"
          status: customer.status || '', // Don't set a default like "Active"

          leadIds: leadIds || []
        }

        console.log('New form data being set:', newFormData) // Debug

        // Force a state update
        setFormData(newFormData)

        // Fetch related data
        await Promise.all([
          fetchLeadsData(customerId), 
          fetchSalesData(customerId), 
          fetchActivitiesData(customerId), 
          fetchCustomerDocuments(customerId)
        ])
      } catch (err) {
        console.error('Error fetching customer:', err)
        setError('Failed to fetch customer data')
      } finally {
        setCustomerLoading(false)
      }
    }

    fetchCustomerData()
  }, [customerId])

  const getRandomColor = name => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9'
    ]
    const charCode = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0)
    return colors[charCode % colors.length]
  }

  console.log('=== DEBUG INFO ===')
  console.log('leadData state:', leadData)
  console.log('leadsLoading:', leadsLoading)
  console.log('leadsError:', leadsError)
  console.log('customerId:', customerId)

  // STEP 2: Replace your ENTIRE fetchLeadsData function with this one:
  const fetchLeadsData = async customerIdParam => {
    console.log('fetchLeadsData called with customerIdParam:', customerIdParam)
    setLeadsLoading(true)
    setLeadsError(null)

    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token ? 'exists' : 'missing')

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/leads/customer/${customerIdParam}`
      console.log('Making request to:', url)

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log('Raw API Response:', response.data)

      if (response.data?.success && response.data?.data?.leads?.length > 0) {
        const rawLeads = response.data.data.leads
        console.log('Raw leads from API:', rawLeads)

        const mappedLeads = rawLeads.map((lead, index) => {
          console.log(`Processing lead ${index}:`, lead)

          // Create the mapped lead object with ALL original data preserved
          const mappedLead = {
            // Spread ALL original properties first
            ...lead,

            // Add/override computed properties
            id: lead._id,
            displayName: lead.name || 'Unknown Lead',

            // Keep assignedTo data intact but add computed fields
            assignedTo: lead.assignedTo
              ? {
                  ...lead.assignedTo,
                  displayName:
                    `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim() || 'Unassigned',
                  initials: (lead.assignedTo.firstName?.charAt(0) || '') + (lead.assignedTo.lastName?.charAt(0) || '')
                }
              : null,

            // Add display date
            displayDate: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'
          }

          console.log(`Mapped lead ${index}:`, mappedLead)
          return mappedLead
        })

        console.log('Final mapped leads:', mappedLeads)
        setLeadData(mappedLeads)
      } else {
        console.log('No leads found or invalid response structure')
        setLeadData([])
      }
    } catch (error) {
      console.error('Error in fetchLeadsData:', error)
      setLeadsError(`Failed to fetch leads: ${error.message}`)
      setLeadData([])
    } finally {
      setLeadsLoading(false)
    }
  }

  // useEffect(() => {
  //     if (!customerId) return;

  //     const fetchCustomerData = async () => {
  //         setCustomerLoading(true);
  //         setError(null);

  //         try {
  //             const token = localStorage.getItem("token");
  //             if (!token) throw new Error("No token found in localStorage");

  //             const response = await axios.get(
  //                 `${process.env.NEXT_PUBLIC_API_URL}/api/customer/getcustomer/${customerId}`,
  //                 {
  //                     headers: {
  //                         Authorization: `Bearer ${token}`,
  //                     },
  //                 }
  //             );

  //             console.log("Response Data:", response.data);

  //             const { leadIds, customer } = response.data;
  //             const flattenedData = {
  //                 ...customer,
  //                 leadIds,
  //             };

  //             setFormData(flattenedData);

  //             // Map `leadIds` to match `leadsData` structure
  //             const mappedLeads = leadIds.map((lead) => ({
  //                 id: lead._id, // ID from API
  //                 Date: lead.createdAt, // Map `createdAt` to `createdDate`
  //                 Name: lead.name || "Unknown Campaign", // Default value
  //                 Description: lead.description || "No description available", // Default value
  //                 status: lead.status || "Inactive", // Default value
  //                 assignedTo: lead.assignedTo
  //                     ? {
  //                         name: lead.assignedTo.name || "Unassigned",
  //                         avatar: lead.assignedTo.avatar || "https://i.pravatar.cc/150?img=1",
  //                     }
  //                     : { name: "Unassigned", avatar: "https://i.pravatar.cc/150?img=1" },
  //             }));

  //             setLeadData(mappedLeads); // Update `leadsData` state with mapped leads

  //         } catch (error) {
  //             console.error("Error fetching customer data:", error);
  //             setError("Failed to fetch customer data");
  //         } finally {
  //             setCustomerLoading(false);
  //         }
  //     };

  //     fetchCustomerData();
  // }, [customerId]);

  // handleChange function
  const handleChange = ({ target: { name, value } }) => {
    console.log(`Changing ${name} to:`, value) // Debug log

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        [addressField]: value
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  // Handle "Edit" button click
  const handleEdit = () => {
    setIsEditable(true) // Enable the fields for editing
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token')

      const customerIdToUpdate = customerId || selectedCustomer?._id

      if (!customerIdToUpdate) {
        console.error('No customer ID available for update')
        alert('Error: Customer ID not found')
        return
      }

      console.log('Using customer ID:', customerIdToUpdate)

      const updatedData = {
        ...formData,
        address: {
          street: formData.street || '',
          city: formData.city || '',
          state: formData.state || '',
          postalCode: formData.postalCode || '',
          country: formData.country || ''
        }
      }

      // Remove flat address fields from the main object
      const { street, city, state, postalCode, country, leadIds, ...restData } = updatedData
      const finalData = { ...restData, address: updatedData.address }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customer/updatecustomer/${customerIdToUpdate}`,
        finalData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      console.log('Customer updated successfully:', response.data)

      // Update the specific customer in the list instead of refetching all
      setCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer._id === customerIdToUpdate ? { ...customer, ...response.data.customer } : customer
        )
      )

      // Update selectedCustomer if it exists
      if (selectedCustomer && selectedCustomer._id === customerIdToUpdate) {
        setSelectedCustomer(prev => ({ ...prev, ...response.data.customer }))
      }

      setIsEditable(false)
      // DON'T call fetchCustomers() here - this was causing the reload
    } catch (error) {
      console.error('Error updating customer:', error.response?.data || error.message)
      alert('Error updating customer: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleOpenEditDialog = id => {
    setCustomerId(id)
    setOpenEditDialog(true)
  }

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false)
    setCustomerId('')
    setFormData({})
    setIsEditable(false)
  }

  const handleCustomerSuccess = responseData => {
    // Extract the customer from the response data
    const newCustomer = responseData.customer || responseData

    // Ensure the new customer has the right structure
    const customerWithId = {
      ...newCustomer,
      _id: newCustomer._id || newCustomer.id, // Ensure _id exists
      id: newCustomer._id || newCustomer.id // Add id field for compatibility
    }

    setCustomers(prevCustomers => [...prevCustomers, customerWithId])
    setOpenAddDialog(false)
    console.log('Customer added to list:', customerWithId)
  }

  // Update row selection functions to use _id consistently
  const handleRowSelect = id => {
    setSelectedRows(prev => (prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedRows.length === customers.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(customers.map(customer => customer._id)) // Use _id here
    }
  }

  // const updateCustomer = async (id, updatedData) => {
  //     try {
  //         const token = localStorage.getItem('token');
  //         await axios.put(
  //             `${process.env.NEXT_PUBLIC_API_URL}/api/customer/updatecustomer/${_id}`,
  //             updatedData,
  //             {
  //                 headers: {
  //                     Authorization: `Bearer ${token}`,
  //                 },
  //             }
  //         );
  //         setCustomers((prev) =>
  //             prev.map((customer) =>
  //                 customer._id === id ? { ...customer, ...updatedData } : customer
  //             )
  //         );
  //         setOpenEditDialog(false); // Close the dialog after successful update
  //     } catch (error) {
  //         console.error("Error updating customer:", error);
  //     }
  // };

  // Delete a customer
  const deleteCustomer = async _id => {
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/deletecustomer/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCustomers(prev => prev.filter(customer => customer._id !== _id)) // Use _id to filter customers
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  useEffect(() => {
    fetchCustomers() // Fetch data when the component mounts
  }, [])

  // Handle Tab Change

  // Function to open the dialog
  const handleOpenDialog = () => {
    setOpenAddDialog(true)
  }

  // Function to close the dialog
  const handleCloseDialog = () => {
    setOpenAddDialog(false)
  }

  // Handle sorting

  const handleViewLead = id => console.log(`Viewing lead with ID: ${id}`)
  const handleEditLead = id => console.log(`Editing lead with ID: ${id}`)

  const refreshCustomers = () => {
    fetchCustomers() 
  }

const fetchProducts = async () => {
  setLoadingProducts(true)
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/productservice/getallproductservices`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    console.log('Products API Response:', response.data) // Debug log
    
    let products = [];
    
    if (response.data.success && response.data.data) {
      products = response.data.data;
    } else if (response.data.products) {
      products = response.data.products;
    } else if (Array.isArray(response.data)) {
      products = response.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      products = [];
    }
    
    console.log('Processed products:', products)
    setAvailableProducts(products)
    
  } catch (err) {
    console.error('Error fetching products:', err)
    setAvailableProducts([]) 
  } finally {
    setLoadingProducts(false)
  }
}


  const handleCreateSale = async (saleData) => {
    try {
      console.log('creating sale -> payload (before clean):', saleData);

      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      const payload = {
        ...saleData,
      };
      if (!payload.leadId) {
        delete payload.leadId;
      }

      console.log('creating sale -> payload (final):', payload);

      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/sales/create`, payload, { headers });
      const data = res.data;
      console.log('create sale response:', data);

      // Process the response data to match the expected format
      if (data.success && data.sales && Array.isArray(data.sales)) {
        const processedSales = data.sales.map(sale => {
          // Calculate total amount from items if not provided
          const calculatedTotal = sale.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

          // Calculate total paid amount from invoices
          const totalPaidAmount = sale.invoices?.reduce((sum, invoice) => {
            return sum + (invoice.paidAmount || 0)
          }, 0) || 0;

          // Calculate balance
          const totalAmount = sale.totalAmount || calculatedTotal;
          const balanceAmount = totalAmount - totalPaidAmount;

          return {
            ...sale,
            id: sale._id,
            // Map items to productIds format for display compatibility
            productIds: sale.items?.map(item => ({
              _id: item.product,
              name: item.itemName,
              description: item.description || 'No description available',
              price: item.unitPrice || 0,
              quantity: item.quantity || 1,
              total: item.total || 0
            })) || [],

            // Display date
            displayDate: new Date(sale.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),

            // Payment calculations
            totalAmount,
            totalPaidAmount,
            balanceAmount,

            // Ensure currency is set
            currency: sale.currency || 'INR'
          }
        });

        // Update the sales data state
        setSalesData(prevSales => {
          const existingIds = new Set(processedSales.map(s => s._id));
          const filteredPrev = prevSales.filter(s => !existingIds.has(s._id));
          return [...processedSales, ...filteredPrev];
        });

        setTabValue(4); // Switch to Sales tab
        setCreateSaleOpen(false);

        console.log('Sales updated successfully with new data:', processedSales);
      } else {
        console.warn('Unexpected response structure:', data);
        await fetchSalesData(customerId); // fallback
      }

    } catch (err) {
      console.error('Error creating sale:', err);
      const message = err.response?.data?.message || err.message || 'Failed to create sale';
      alert('Error creating sale: ' + message);
    }
  };

  return (
    <div>
      {/* Add Customer Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} fullWidth maxWidth='sm'>
        <DialogTitle>Add New Customer</DialogTitle>
        <DialogContent>
          <AddCustomerForm companyId={null} userId={null} onSuccess={handleCustomerSuccess} />
        </DialogContent>
      </Dialog>

      <Box
        sx={{
          borderRadius: 2,
          p: 3,
          mb: 3,
          backgroundColor: '#f8f9ff'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography
            variant='h4'
            sx={{
              fontWeight: 600,
              color: '#007bff',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            Customer Management
            <i className='ri-arrow-right-line' style={{ fontSize: 24 }} />
          </Typography>
          <Button
            variant='contained'
            onClick={() => setOpenAddDialog(true)}
            sx={{
              backgroundColor: '#007bff',
              '&:hover': { backgroundColor: '#0056b3' },
              px: 3,
              py: 2
            }}
            startIcon={<i className='ri-add-line' />}
          >
            Add Customer
          </Button>
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 400 }}>
          <TextField
            fullWidth
            placeholder='Search Here...'
            variant='outlined'
            size='small'
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 3
              }
            }}
            InputProps={{
              startAdornment: (
                <i
                  className='ri-search-line'
                  style={{
                    marginRight: 8,
                    color: '#666',
                    fontSize: 18
                  }}
                />
              )
            }}
          />
        </Box>
      </Box>

      {/* Table */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'white'
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: '#f8f9ff' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#333' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customersLoading ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              sortedCustomers.map(customer => {
                const initials = `${customer.firstName?.charAt(0) || ''}${customer.lastName?.charAt(0) || ''}`
                const avatarColor = getRandomColor(customer.firstName || 'Unknown')

                return (
                  <TableRow
                    key={customer._id || customer.id}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f8f9ff'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: avatarColor,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '14px'
                          }}
                        >
                          {initials || 'NA'}
                        </Avatar>
                        <Typography variant='body1' sx={{ fontWeight: 500 }}>
                          {(customer.firstName || '') + ' ' + (customer.lastName || '')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ color: '#666' }}>
                        {customer.email || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ color: '#666' }}>
                        {customer.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={customer.status || 'Active'}
                        sx={{
                          backgroundColor: customer.status === 'Active' ? '#d4edda' : '#f8d7da',
                          color: customer.status === 'Active' ? '#155724' : '#721c24',
                          fontWeight: 500,
                          fontSize: '12px',
                          height: 24
                        }}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleOpenDrawer(customer)}
                          sx={{
                            color: '#666',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              color: '#007bff'
                            }
                          }}
                          size='small'
                        >
                          <i className='ri-eye-line' style={{ fontSize: 18 }} />
                        </IconButton>

                        <IconButton
                          onClick={() => deleteCustomer(customer._id)}
                          sx={{
                            color: '#666',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              color: '#dc3545'
                            }
                          }}
                          size='small'
                        >
                          <i className='ri-delete-bin-line' style={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Box>

      <Drawer
        anchor='right'
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{
          sx: {
            width: {
              xs: '100%', // Full width for extra-small devices
              sm: '90%', // 90% for small devices
              md: '50%', // Half width for medium devices
              lg: '50%' // 40% for larger devices
            },
            padding: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #ffffff, #f8f9fa)', // Subtle premium gradient
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)', // Stronger shadow for depth
            borderRadius: { xs: 0, sm: '16px 0 0 16px' } // Rounded corners only on larger screens
          }
        }}
      >
        <Box>
          {/* Top Section */}
          <Box
            sx={{
              backgroundColor: 'white',
              p: 3,
              borderBottom: '1px solid #e0e0e0',
              position: 'relative'
            }}
          >
            {/* Customer Details Title */}
            <Typography
              variant='h5'
              sx={{
                fontWeight: 600,
                color: '#007bff',
                mb: 3
              }}
            >
              Customer Details
            </Typography>

            {/* Customer Info Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: getRandomColor(selectedCustomer?.firstName || 'U'),
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 600
                }}
              >
                {selectedCustomer?.firstName?.charAt(0) || 'U'}
                {selectedCustomer?.lastName?.charAt(0) || 'S'}
              </Avatar>

              {/* Customer Details */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    mb: 0.5
                  }}
                >
                  {selectedCustomer?.firstName} {selectedCustomer?.lastName}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', mb: 0.5 }}>
                  {selectedCustomer?.email}
                </Typography>
                <Typography variant='body2' sx={{ color: '#666' }}>
                  {selectedCustomer?.phone || 'Not available'}
                </Typography>
              </Box>

              {/* Premium Member Badge */}
              <Chip
                label='Premium Member'
                sx={{
                  background: 'linear-gradient(135deg, #ffd700, #ffb347)',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '12px',
                  height: 28,
                  '& .MuiChip-label': {
                    color: '#000'
                  }
                }}
              />
            </Box>
          </Box>

          {/* User Details (Name, Email, Phone, Address) - Horizontal Row */}
          {/* <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 4, // Add space between the items
                        paddingBottom: 2,
                    }}
                    >
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Name
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.name}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Email
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.email}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Phone
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.phone}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: "#212529" }}>
                        Address
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#495057" }}>
                        {selectedCustomer?.address}
                        </Typography>
                    </Box>
                    </Box> */}

          {/* Tabs for Additional Customer Details */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor='primary'
            textColor='primary'
            centered
            sx={{ marginBottom: 2, marginTop: 6 }}
          >
            <Tab label='Basic' />
            <Tab label='Lead' />
            <Tab label='Documents' />
            <Tab label='Activity' />
            <Tab label='Sales' />
          </Tabs>

          {/* Display content based on active tab */}
          <Box
            sx={{
              paddingTop: 2,
              overflowY: 'auto', // Ensure scrolling for content if it's long
              maxHeight: '60vh' // Limit the height of the content to avoid overflow
            }}
          >
            {tabValue === 0 && (
              <Box sx={{ width: '100%', padding: 2, border: '1px solid #ccc', borderRadius: 1 }}>
                <Typography variant='h6' className='mb-4'>
                  Basic Information
                </Typography>
                <Box sx={{ padding: 2 }}>
                  {/* Render form fields dynamically */}
                  <form>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='First Name'
                          name='firstName'
                          disabled={!isEditable}
                          value={formData.firstName || ''}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Last Name'
                          name='lastName'
                          disabled={!isEditable}
                          value={formData.lastName || ''}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Email'
                          name='email'
                          type='email'
                          disabled={!isEditable}
                          value={formData.email || ''}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Phone'
                          name='phone'
                          disabled={!isEditable}
                          value={formData.phone || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Street'
                          name='address.street'
                          disabled={!isEditable}
                          value={formData.street || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='City'
                          name='address.city'
                          disabled={!isEditable}
                          value={formData.city || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='State'
                          name='address.state'
                          disabled={!isEditable}
                          value={formData.state || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Postal Code'
                          name='address.postalCode'
                          disabled={!isEditable}
                          value={formData.postalCode || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label='Country'
                          name='address.country'
                          disabled={!isEditable}
                          value={formData.country || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Date of Birth'
                          name='dateOfBirth'
                          type='date'
                          disabled={!isEditable}
                          InputLabelProps={{ shrink: true }}
                          value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label='Gender'
                          name='gender'
                          disabled={!isEditable}
                          value={formData.gender || ''}
                          onChange={handleChange}
                        >
                          <MenuItem value=''>Select</MenuItem>
                          <MenuItem value='Male'>Male</MenuItem>
                          <MenuItem value='Female'>Female</MenuItem>
                          <MenuItem value='Other'>Other</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          select
                          label='Status'
                          name='status'
                          disabled={!isEditable}
                          value={formData.status || ''}
                          onChange={handleChange}
                        >
                          <MenuItem value='Active'>Active</MenuItem>
                          <MenuItem value='Inactive'>Inactive</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Occupation'
                          name='occupation'
                          disabled={!isEditable}
                          value={formData.occupation || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Qualification'
                          name='qualification'
                          disabled={!isEditable}
                          value={formData.qualification || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label='Notes'
                          name='notes'
                          multiline
                          rows={3}
                          disabled={!isEditable}
                          value={formData.notes || ''}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </form>

                  {/* Edit/Save Buttons */}
                  <Box sx={{ marginTop: 3, display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                    {!isEditable && (
                      <Button variant='outlined' onClick={handleEdit}>
                        <i className='ri-edit-line' style={{ fontSize: 20 }} />
                      </Button>
                    )}
                    {isEditable && (
                      <Button variant='contained' onClick={handleSave}>
                        Save
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* Updated Lead Tab */}
            {tabValue === 1 && (
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: 'white',
                  p: 4,
                  mx: 1
                }}
              >
                {leadsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', padding: 6 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading leads...</Typography>
                  </Box>
                ) : leadsError ? (
                  <Box sx={{ textAlign: 'center', padding: 6 }}>
                    <Typography variant='body1' color='error'>
                      Error: {leadsError}
                    </Typography>
                  </Box>
                ) : leadData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', padding: 6 }}>
                    <Typography variant='h6' sx={{ color: '#666', mb: 1 }}>
                      No Leads Found
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#999' }}>
                      There are currently no leads associated with this customer.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {leadData.map((lead, index) => (
                      <Box key={lead._id || index} sx={{ mb: index < leadData.length - 1 ? 6 : 0 }}>
                        {/* Lead Information Fields */}
                        <Box sx={{ mb: 4 }}>
                          <Grid container spacing={3}>
                            {/* Email Field */}
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 500,
                                  color: '#333',
                                  mb: 2
                                }}
                              >
                                Email
                              </Typography>
                              <TextField
                                fullWidth
                                size='small'
                                value={lead.email || 'Not provided'}
                                disabled
                                sx={{
                                  '& .MuiInputBase-root': {
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 1
                                  }
                                }}
                              />
                            </Grid>

                            {/* Phone Field */}
                            <Grid item xs={12} sm={6}>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 500,
                                  color: '#333',
                                  mb: 2
                                }}
                              >
                                Phone
                              </Typography>
                              <TextField
                                fullWidth
                                size='small'
                                value={lead.phone || 'Not provided'}
                                disabled
                                sx={{
                                  '& .MuiInputBase-root': {
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 1
                                  }
                                }}
                              />
                            </Grid>

                            {/* Source Field */}
                            <Grid item xs={12}>
                              <Typography
                                variant='body2'
                                sx={{
                                  fontWeight: 500,
                                  color: '#333',
                                  mb: 2
                                }}
                              >
                                Source
                              </Typography>
                              <TextField
                                fullWidth
                                size='small'
                                value={lead.source || 'Unknown'}
                                disabled
                                sx={{
                                  '& .MuiInputBase-root': {
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: 1
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Campaign Card */}
                        {lead.campaignid && (
                          <Card
                            sx={{
                              mb: 3,
                              position: 'relative',
                              borderRadius: 1,
                              overflow: 'visible',
                              boxShadow: 'none'
                            }}
                          >
                            {/* Status Badge */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -10,
                                right: 20,
                                backgroundColor:
                                  lead.status === 'New'
                                    ? '#28a745'
                                    : lead.status === 'Active'
                                      ? '#007bff'
                                      : lead.status === 'Converted'
                                        ? '#28a745'
                                        : lead.status === 'Lost'
                                          ? '#dc3545'
                                          : '#6c757d',
                                color: 'white',
                                px: 3,
                                py: 1,
                                borderRadius: 2,
                                fontSize: '12px',
                                fontWeight: 600,
                                zIndex: 1
                              }}
                            >
                              {lead.status || 'Unknown'}
                            </Box>

                            <CardContent sx={{ p: 4 }}>
                              <Typography
                                variant='h6'
                                sx={{
                                  fontWeight: 600,
                                  color: '#333',
                                  mb: 3
                                }}
                              >
                                {lead.campaignid.name || 'Unnamed Campaign'}
                              </Typography>

                              <Typography
                                variant='body2'
                                sx={{
                                  color: '#666',
                                  lineHeight: 1.8,
                                  mb: 4,
                                  fontSize: '14px'
                                }}
                              >
                                {lead.campaignid.description || 'No campaign description available'}
                              </Typography>

                              {/* Assigned Person */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  pt: 2,
                                  borderTop: '1px solid #e0e0e0'
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      backgroundColor: getRandomColor(lead.assignedTo?.firstName || 'U'),
                                      fontSize: '14px',
                                      fontWeight: 600,
                                      color: 'white'
                                    }}
                                  >
                                    {lead.assignedTo?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                  </Avatar>
                                  <Typography
                                    variant='body2'
                                    sx={{
                                      fontWeight: 500,
                                      color: '#333'
                                    }}
                                  >
                                    {lead.assignedTo
                                      ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`.trim()
                                      : 'Unassigned'}
                                  </Typography>
                                </Box>

                                <Typography
                                  variant='body2'
                                  sx={{
                                    color: '#666',
                                    fontWeight: 500
                                  }}
                                >
                                  {lead.createdAt
                                    ? new Date(lead.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    : 'Unknown date'}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  backgroundColor: 'white',
                  p: 4,
                  mx: 1
                }}
              >
                {/* Customer Documents Header */}
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    mb: 4
                  }}
                >
                  Customer Documents ({documents.length})
                </Typography>

                {/* Upload Progress */}
                {uploadingFile && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant='body2' sx={{ mb: 1, color: '#666' }}>
                      Uploading... {uploadProgress}%
                    </Typography>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${uploadProgress}%`,
                          height: '100%',
                          backgroundColor: '#007bff',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                )}

                {/* Documents List */}
                <Box sx={{ mb: 4 }}>
                  {documentsLoading ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <CircularProgress />
                      <Typography variant='body2' sx={{ color: '#888', mt: 2 }}>
                        Loading documents...
                      </Typography>
                    </Box>
                  ) : documentsError ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant='body2' sx={{ color: '#ff4757', mb: 2 }}>
                        Error: {documentsError}
                      </Typography>
                      <Button 
                        variant='outlined' 
                        size='small'
                        onClick={() => fetchCustomerDocuments(customerId)}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : documents.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant='h6' sx={{ color: '#666', mb: 1 }}>
                        No Documents Found
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#999' }}>
                        Upload documents to get started
                      </Typography>
                    </Box>
                  ) : (
                    documents.map((document, index) => (
                      <Box
                        key={document._id || index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 3,
                          mb: 2,
                          borderRadius: 2,
                          border: '1px solid #e0e0e0',
                          '&:hover': {
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            borderColor: '#007bff'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {/* File Type Icon */}
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: getFileTypeColor(document.originalName || document.fileName),
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i 
                              className={getFileIcon(document.originalName || document.fileName)} 
                              style={{ color: 'white', fontSize: 20 }} 
                            />
                          </Box>

                          <Box>
                            <Typography variant='body1' sx={{ fontWeight: 600, color: '#333', mb: 0.5 }}>
                              {document.originalName || document.fileName || 'Unnamed File'}
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#666' }}>
                              {document.uploadedAt ? 
                                `Uploaded ${new Date(document.uploadedAt).toLocaleDateString()}` : 
                                'Upload date unknown'
                              } • {formatFileSize(document.size || 0)}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size='small' 
                            sx={{ color: 'blue' }}
                            onClick={() => handleViewFile(document)}
                          >
                            <i className='ri-eye-line' style={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton 
                            size='small' 
                            sx={{ color: '#666' }}
                             onClick={() => {
                                if (document.fileUrl || document.url) {
                                  const link = document.createElement('a')
                                  link.href = document.fileUrl || document.url
                                  link.download = document.originalName || document.fileName || 'download'
                                  link.click()
                                }
                              }}
                            >
                            <i className='ri-download-line' style={{ fontSize: 18 }} />
                          </IconButton>
                          <IconButton 
                            size='small' 
                            sx={{ color: 'red' }}
                            onClick={() => handleDeleteFile(document._id)}
                          >
                            <i className='ri-delete-bin-line' style={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>

                {/* Upload Document Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  {/* Hidden File Input */}
                  <input
                    id="file-upload-input"
                    type="file"
                    accept="*/*"
                    style={{ display: 'none' }}
                    onChange={handleFileInputChange}
                    disabled={uploadingFile}
                  />
                  
                  {/* Upload Button */}
                  <Button
                    variant='contained'
                    component="label"
                    startIcon={uploadingFile ? <CircularProgress size={20} color="inherit" /> : <i className='ri-upload-line' />}
                    disabled={uploadingFile}
                    sx={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#0056b3'
                      },
                      '&:disabled': {
                        backgroundColor: '#ccc'
                      }
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById('file-upload-input')
                      if (fileInput) fileInput.click()
                    }}
                  >
                    {uploadingFile ? 'Uploading...' : 'Upload Document'}
                  </Button>
                  
                  <Typography variant='caption' sx={{ color: '#999', textAlign: 'center' }}>
                    Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, TXT and more
                  </Typography>
                </Box>
              </Box>
            )}

            {tabValue === 3 && (
              <Box sx={{ p: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 700, color: '#212529', mb: 2 }}>
                  Activity ({activities.length})
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'white',
                  }}
                >
                  {activitiesLoading ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <CircularProgress />
                      <Typography variant='body2' sx={{ color: '#888', mt: 2 }}>
                        Loading activities...
                      </Typography>
                    </Box>
                  ) : activitiesError ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant='body2' sx={{ color: '#ff4757', mb: 2 }}>
                        Error: {activitiesError}
                      </Typography>
                      <Button 
                        variant='outlined' 
                        size='small'
                        onClick={() => fetchActivitiesData(customerId)}
                      >
                        Retry
                      </Button>
                    </Box>
                  ) : activities.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Typography variant='body2' sx={{ color: '#888' }}>
                        No activities to show
                      </Typography>
                    </Box>
                  ) : (
                    activities.map((activity, idx) => (
                      <Box
                        key={activity._id || idx}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          alignItems: 'flex-start',
                          mb: idx < activities.length - 1 ? 3 : 0,
                          padding: 3,
                          borderRadius: 2,
                          backgroundColor: '#fff',
                          border: '1px solid #e9ecef',
                        }}
                      >
                        {/* Left: Avatar and Action */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                          {/* User Avatar */}
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: getRandomColor(activity.performedBy?.firstName || 'U'),
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: 600
                            }}
                          >
                            {activity.performedBy?.firstName?.charAt(0) || 'U'}
                            {activity.performedBy?.lastName?.charAt(0) || ''}
                          </Avatar>

                          {/* Activity Details */}
                          <Box sx={{ flex: 1 }}>
                            {/* Action Title */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#333' }}>
                                {activity.performedBy?.firstName} {activity.performedBy?.lastName}
                              </Typography>
                              <Typography variant='body2' sx={{ color: '#666' }}>
                                {activity.action === 'updated' ? 'updated customer' : 
                                activity.action === 'created' ? 'created customer' :
                                activity.action === 'deleted' ? 'deleted customer' :
                                activity.action || 'performed action'}
                              </Typography>
                              <Chip
                                label={activity.action?.toUpperCase() || 'ACTION'}
                                size='small'
                                sx={{
                                  height: 20,
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  backgroundColor: 
                                    activity.action === 'updated' ? '#e3f2fd' :
                                    activity.action === 'created' ? '#e8f5e8' :
                                    activity.action === 'deleted' ? '#ffebee' : '#f5f5f5',
                                  color:
                                    activity.action === 'updated' ? '#1976d2' :
                                    activity.action === 'created' ? '#388e3c' :
                                    activity.action === 'deleted' ? '#d32f2f' : '#666',
                                  '& .MuiChip-label': {
                                    px: 1
                                  }
                                }}
                              />
                            </Box>

                            {/* Activity Details */}
                            {/* <Typography
                              variant='body2'
                              sx={{
                                color: '#666',
                                fontSize: 13,
                                lineHeight: 1.5,
                                backgroundColor: '#f8f9fa',
                                padding: 2,
                                borderRadius: 1,
                                border: '1px solid #e9ecef',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre-wrap',
                                maxHeight: 100,
                                overflow: 'auto'
                              }}
                            >
                              {activity.details || 'No details available'}
                            </Typography> */}

                            {/* Performed By Email */}
                            <Typography
                              variant='caption'
                              sx={{
                                color: '#999',
                                fontSize: 11,
                                mt: 1,
                                display: 'block'
                              }}
                            >
                              by {activity.performedBy?.email || 'Unknown user'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Right: Timestamp */}
                        <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                          <Typography variant='caption' sx={{ color: '#999', display: 'block', fontSize: 11 }}>
                            {activity.performedAt ? 
                              new Date(activity.performedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
                          </Typography>
                          <Typography variant='caption' sx={{ color: '#999', fontSize: 11 }}>
                            {activity.performedAt ? 
                              new Date(activity.performedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            )}

            {tabValue === 4 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 2 }}>
                {/* Add Sale Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant='contained'
                    onClick={() => {
                      fetchProducts()
                      setCreateSaleOpen(true)
                    }}
                    startIcon={<i className='ri-add-line' />}
                    sx={{
                      backgroundColor: '#007bff',
                      '&:hover': { backgroundColor: '#0056b3' }
                    }}
                  >
                    Create Sale
                  </Button>
                </Box>

                {/* Create Sale Dialog */}
                <Dialog open={createSaleOpen} onClose={() => setCreateSaleOpen(false)} maxWidth='md' fullWidth>
                  <DialogTitle>
                    <Typography variant='h5' fontWeight={600} color='#007bff'>
                      Create New Sale
                    </Typography>
                  </DialogTitle>

                  <CreateSaleFormContent
                    customerId={customerId}
                    availableProducts={availableProducts}
                    loadingProducts={loadingProducts}
                    leads={leadData}
                    onCreateSale={handleCreateSale}
                    onClose={() => setCreateSaleOpen(false)}
                  />
                </Dialog>

                {salesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Loading sales data...</Typography>
                  </Box>
                ) : salesError ? (
                  <Box sx={{ textAlign: 'center', padding: 4 }}>
                    <Typography variant='body1' color='error'>
                      {salesError}
                    </Typography>
                  </Box>
                ) : salesData.length === 0 ? (
                  <Box sx={{ textAlign: 'center', padding: 4 }}>
                    <Typography variant='h6' sx={{ color: '#666', mb: 1 }}>
                      No Sales Found
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#999' }}>
                      There are currently no sales records associated with this customer.
                    </Typography>
                  </Box>
                ) : (
                  salesData.map(sale => (
                    <Card
                      key={sale._id}
                      sx={{
                        borderRadius: 2,
                        border: '1px solid #e0e0e0',
                        overflow: 'hidden',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {/* Sales Header with Invoice ID */}
                      <Box
                        sx={{
                          // background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: 'white',
                          boxShadow: 'none',
                          p: 3
                        }}
                      >
                        {/* Invoice ID as main heading */}
                        <Typography variant='h5' sx={{ fontWeight: 700, mb: 1 }}>
                          Invoice #{sale.invoices?.[0]?.invoiceNumber || sale.salesId}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Box>
                            <Typography variant='body2' sx={{ opacity: 0.9, mb: 8 }}>
                              Sales ID: {sale.salesId}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right', mt: -8 }}>
                            <Chip
                              label={sale.status?.replace('-', ' ').toUpperCase() || 'PENDING'}
                              color={
                                sale.status === 'completed'
                                  ? 'success'
                                  : sale.status === 'in-progress'
                                    ? 'warning'
                                    : sale.status === 'pending'
                                      ? 'info'
                                      : 'default'
                              }
                              sx={{
                                fontWeight: 500,
                                color: 'white',
                                size: 'small',
                                height: 24,
                                mb: 1,
                                '& .MuiChip-label': { color: 'white' }
                              }}
                            />
                            <Typography variant='h4' sx={{ fontWeight: 700 }}>
                              {sale.currency === 'USD' ? '$' : '₹'}
                              {(sale.totalAmount || 0).toLocaleString()}
                            </Typography>
                            <Typography variant='body2' sx={{ opacity: 0.9 }}>
                              {sale.displayDate}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <CardContent sx={{ p: 0, mt: -6 }}>
                        {/* Products Section */}
                        <Box sx={{ p: 3, pb: 2 }}>
                          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                            Products ({sale.productIds?.length || 0})
                          </Typography>

                          <Stack spacing={2}>
                            {sale.productIds?.map((product, index) => (
                              <Box
                                key={product._id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 2.5,
                                  borderRadius: 1,
                                  border: '1px solid #e9ecef'
                                }}
                              >
                                {/* Product Details */}
                                <Box
                                  sx={{ flex: 1, cursor: 'pointer' }}
                                  onClick={() => router.push(`/manager/customer-module/purchase/${customerId}`)}
                                >
                                  <Typography variant='h6' sx={{ fontWeight: 600, color: '#212529', mb: 0.5 }}>
                                    {product.name}
                                  </Typography>
                                  <Typography variant='body2' sx={{ color: '#6c757d', mb: 1 }}>
                                    {product.description || 'No description available'}
                                  </Typography>

                                  {/* Price and Quantity Info */}
                                  <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                        UNIT PRICE
                                      </Typography>
                                      <Typography variant='body1' sx={{ fontWeight: 600, color: '#28a745' }}>
                                        {sale.currency === 'USD' ? '$' : '₹'}
                                        {product.price?.toLocaleString() || '0'}
                                      </Typography>
                                    </Box>

                                    <Box>
                                      <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                        QUANTITY
                                      </Typography>
                                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                                        {product.quantity || 1}
                                      </Typography>
                                    </Box>

                                    <Box>
                                      <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                        SUBTOTAL
                                      </Typography>
                                      <Typography variant='body1' sx={{ fontWeight: 600, color: '#007bff' }}>
                                        {sale.currency === 'USD' ? '$' : '₹'}
                                        {((product.price || 0) * (product.quantity || 1)).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>

                                {/* Product Icon */}
                                <Box
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    backgroundColor: '#fff',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    ml: 2,
                                    border: '2px solid #dee2e6'
                                  }}
                                >
                                  <i className='ri-product-hunt-line' style={{ fontSize: 28, color: '#6c757d' }}></i>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        {/* Payment Summary */}
                        <Box
                          sx={{
                            borderTop: '1px solid #e9ecef',
                            p: 3
                          }}
                        >
                          <Typography variant='h6' sx={{ fontWeight: 600, mb: 2, color: '#333' }}>
                            Payment Summary
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                                <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                  TOTAL AMOUNT
                                </Typography>
                                <Typography variant='h5' sx={{ fontWeight: 700, color: '#212529' }}>
                                  {sale.currency === 'USD' ? '$' : '₹'}
                                  {(sale.totalAmount || 0).toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                                <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                  PAID AMOUNT
                                </Typography>
                                <Typography variant='h5' sx={{ fontWeight: 700, color: '#28a745' }}>
                                  {sale.currency === 'USD' ? '$' : '₹'}
                                  {(sale.totalPaidAmount || 0).toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>

                            <Grid item xs={4}>
                              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                                <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                  BALANCE AMOUNT
                                </Typography>
                                <Typography
                                  variant='h5'
                                  sx={{
                                    fontWeight: 700,
                                    color: (sale.balanceAmount || 0) > 0 ? '#dc3545' : '#28a745'
                                  }}
                                >
                                  {sale.currency === 'USD' ? '$' : '₹'}
                                  {Math.abs(
                                    sale.balanceAmount || sale.totalAmount - sale.totalPaidAmount || 0
                                  ).toLocaleString()}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Additional Information */}
                        <Box
                          sx={{
                            px: 3,
                            pb: 2,
                            backgroundColor: '#f8f9fa',
                            mx: 2,
                            mb: 2,
                            borderRadius: 2,
                            border: '1px solid #e9ecef'
                          }}
                        >
                          {sale.notes && (
                            <Box sx={{ borderTop: '1px solid #e9ecef', pt: 2 }}>
                              <Typography variant='caption' sx={{ color: '#6c757d', fontWeight: 500 }}>
                                NOTES
                              </Typography>
                              <Typography variant='body2' sx={{ color: '#495057', fontStyle: 'italic', mt: 0.5 }}>
                                {sale.notes}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      <Modal
        open={leadModalOpen}
        onClose={() => {
          setLeadModalOpen(false)
          setSelectedLead(null)
        }}
        aria-labelledby='lead-details-title'
        aria-describedby='lead-details-description'
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: 480 },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            outline: 'none'
          }}
        >
          {selectedLead && (
            <>
              {/* Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: '1px solid #f0f0f0',
                  position: 'relative'
                }}
              >
                <IconButton
                  onClick={() => setLeadModalOpen(false)}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    color: '#666',
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                  }}
                >
                  <i className='ri-close-line' style={{ fontSize: 20 }} />
                </IconButton>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                  <IconButton sx={{ color: '#666' }}>
                    <i className='ri-time-line' style={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton sx={{ color: '#666' }}>
                    <i className='ri-star-line' style={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton sx={{ color: '#666' }}>
                    <i className='ri-more-2-line' style={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    pr: 2
                  }}
                >
                  {selectedLead.name || 'Unnamed Lead'}
                </Typography>
              </Box>

              {/* Content */}
              <Box sx={{ p: 3 }}>
                {/* Lead Details */}
                <Box sx={{ mb: 4 }}>
                  {/* Created Time */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1 }}>
                      <i className='ri-time-line' style={{ color: '#666', marginRight: 8, fontSize: 16 }} /> Created
                      time
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#333', fontWeight: 500 }}>
                      {selectedLead.createdAt
                        ? new Date(selectedLead.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Not available'}
                    </Typography>
                  </Box>

                  {/* Status */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1 }}>
                      <i className='ri-checkbox-circle-line' style={{ color: '#666', marginRight: 8, fontSize: 16 }} />
                      Status
                    </Typography>
                    <Chip
                      label={selectedLead.status || 'Unknown'}
                      sx={{
                        backgroundColor:
                          selectedLead.status === 'Active' || selectedLead.status === 'Converted'
                            ? '#4caf50'
                            : selectedLead.status === 'New' || selectedLead.status === 'Pending'
                              ? '#ff9800'
                              : selectedLead.status === 'Lost'
                                ? '#f44336'
                                : '#9e9e9e',
                        color: 'white',
                        height: 24,
                        fontSize: '12px',
                        fontWeight: 500,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                      size='small'
                    />
                  </Box>

                  {/* Source */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1 }}>
                      <i className='ri-flag-line' style={{ color: '#666', marginRight: 8, fontSize: 16 }} /> Source
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: '#333',
                        fontWeight: 500
                      }}
                    >
                      {selectedLead.source || 'Unknown'}
                    </Typography>
                  </Box>

                  {/* Email & Phone */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1 }}>
                      <i className='ri-mail-line' style={{ color: '#666', marginRight: 8, fontSize: 16 }} />
                      Email
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#333', fontWeight: 500 }}>
                      {selectedLead.email || 'Not provided'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1 }}>
                      <i className='ri-phone-line' style={{ color: '#666', marginRight: 8, fontSize: 16 }} /> Phone
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#333', fontWeight: 500 }}>
                      {selectedLead.phone || 'Not provided'}
                    </Typography>
                  </Box>

                  {/* Campaign */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1, mt: 0.25 }}>
                      <i
                        className='ri-price-tag-3-line'
                        style={{ color: '#666', marginRight: 8, fontSize: 16, marginTop: 2 }}
                      />
                      Campaign
                    </Typography>
                    <Box>
                      <Chip
                        label={selectedLead.campaignid?.name || 'No Campaign'}
                        sx={{
                          backgroundColor: '#f5f5f5',
                          color: '#666',
                          height: 24,
                          fontSize: '12px',
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                        size='small'
                      />
                      {selectedLead.campaignid?.description && (
                        <Typography variant='body2' sx={{ color: '#999', fontSize: '11px', mt: 0.5 }}>
                          {selectedLead.campaignid.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Assigned To */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                    <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mr: 1 }}>
                      <i className='ri-user-line' style={{ color: '#666', marginRight: 8, fontSize: 16 }} />
                      Assignees
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          fontSize: '14px',
                          backgroundColor: getRandomColor(selectedLead.assignedTo?.firstName || 'U'),
                          color: 'white',
                          border: '2px solid white'
                        }}
                      >
                        {selectedLead.assignedTo?.firstName?.charAt(0) || 'U'}
                      </Avatar>
                      <Typography
                        variant='body2'
                        sx={{ color: '#333', fontWeight: 500, justifyContent: 'space-between' }}
                      >
                        {selectedLead.assignedTo
                          ? `${selectedLead.assignedTo.firstName || ''} ${selectedLead.assignedTo.lastName || ''}`.trim() ||
                            'Unnamed'
                          : 'Unassigned'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Customer Information */}
                {selectedLead.Customer && (
                  <Box>
                    <Typography variant='h6' sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                      Customer Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                        <strong>Name:</strong>{' '}
                        {`${selectedLead.Customer.firstName || ''} ${selectedLead.Customer.lastName || ''}`.trim() ||
                          'Not provided'}
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#666', fontWeight: 500, mb: 1 }}>
                        <strong>Email:</strong> {selectedLead.Customer.email || 'Not provided'}
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#666', fontWeight: 500 }}>
                        <strong>Phone:</strong> {selectedLead.Customer.phone || 'Not provided'}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Lead Description */}
                {selectedLead.description && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant='h6' sx={{ fontWeight: 600, color: '#333', mb: 2 }}>
                      Lead Description
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#666', lineHeight: 1.6 }}>
                      {selectedLead.description}
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </div>
  )
}

export default Customer
