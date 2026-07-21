// MUI Imports
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Link from 'next/link'
import { getLocalizedUrl } from '@/utils/i18n'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'
import { useParams } from 'next/navigation'
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'

// Data Imports
import defaultData from './data'

// Column Definitions

const NotificationsTab = ({ id, leadData }) => {  // Changed props destructuring

  const columnHelper = createColumnHelper()
  const { lang: locale } = useParams()
  const columns = [
    columnHelper.accessor('paymentId', {
      header: 'Payment ID',
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='flex flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {row.original.paymentId}
            </Typography>
            <Typography variant='body2'>RefID {row.original.invoice?.invoiceNumber}</Typography>
          </div>
        </div>
      )
    }),
    columnHelper.accessor('createdAt', {
      cell: info => info.getValue(),
      header: 'Date'
    }),
    columnHelper.accessor('paymentMethod', {
      cell: info => info.getValue(),
      header: 'Method'
    }),
    columnHelper.accessor('amount', {
      cell: info => info.getValue(),
      header: 'Amount'
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center gap-0.5'>
          <IconButton size='small' onClick={() => setData(data?.filter(invoice => invoice.id !== row.original.id))}>
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
                  className: 'flex items-center is-full plb-2 pli-5 gap-2'
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
  ]

  // States
  const [data, setData] = useState(() => [])

  // Hooks
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: () => false
    }
  })

  // Vars
  const data1 = [
    {
      stats: '8,458',
      color: 'primary',
      title: 'Customers',
      icon: 'ri-user-star-line'
    },
    {
      stats: '$28.5k',
      color: 'warning',
      icon: 'ri-pie-chart-2-line',
      title: 'Total Profit'
    },
    {
      color: 'info',
      stats: '2,450k',
      title: 'Transactions',
      icon: 'ri-arrow-left-right-line'
    }
  ]

  console.log('Lead ID:', id);  // Fixed console log
  console.log('Lead Data:', leadData);  // Optional: if you need the full lead data

  useEffect(() => {
    // Check if id exists before making API call
    if (!id) {
      console.error('No lead ID provided');
      return;
    }

    const token = localStorage.getItem('token')
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/bylead/${id}`, {  // Use id directly
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data) // Update data if component is still mounted
        console.log("Payment data:", response.data)
      })
      .catch(error => {
        console.error('Failed to fetch payment data:', error)
      })
  }, [id])  // Add id to dependency array

  return (
    <>
      {/* <Card>
      <CardHeader
        title='Sales Overview'
        action={<OptionMenu options={['Refresh', 'Share', 'Update']} />}
        subheader={<div className='flex items-center gap-2'>
          <span>Total 42.5k Sales</span>
          <span className='flex items-center text-success font-medium'>
            +18%
            <i className='ri-arrow-up-s-line text-xl' />
          </span>
        </div>} />
      <CardContent>
        <div className='flex flex-wrap justify-between gap-4'>
          {data1.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <CustomAvatar variant='rounded' skin='light' color={item.color}>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography>{item.title}</Typography>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card> */}
      <br />
      <Card>
        <CardHeader title='Transaction History' />
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
    </>
  )
}

export default NotificationsTab
