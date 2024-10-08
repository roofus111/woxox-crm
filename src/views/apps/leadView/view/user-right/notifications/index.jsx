// MUI Imports
'use client'

// React Imports
import { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'

// Data Imports
import defaultData from './data'

// Column Definitions

const NotificationsTab = () => {
  const columnHelper = createColumnHelper()

  const columns = [
    columnHelper.accessor('id', {
      cell: info => info.getValue(),
      header: 'ID'
    }),
    columnHelper.accessor('fullName', {
      cell: info => info.getValue(),
      header: 'Name'
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


  // States

  const [data, setData] = useState(() => [...defaultData])

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

  return (
    <><Card>
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
    </Card>
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
      </Card></>
  )
}

export default NotificationsTab
