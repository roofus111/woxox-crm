'use client'

// React Imports
import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useParams } from 'next/navigation'
// MUI Imports

import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

// Style Imports
import styles from '@core/styles/table.module.css'

// Data Imports
import defaultData from './data'

import { Card, CardContent, CardActions, Button, Typography, Grid, Chip, Avatar, Box, Divider } from '@mui/material'

import React from 'react'
import { getLocalizedUrl } from '@/utils/i18n'
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
  const { lang: locale } = useParams()
  return (
    <>
      {data.map((followUp, index) => {
        return (
          <Card key={index} sx={{ maxWidth: 600, m: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography
                variant='h6'
                color='primary'
                gutterBottom
                sx={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box sx={{ mr: 2 }}>
                  {' '}
                  {/* Adds right margin to the text */}
                  {followUp.leadId.name}
                </Box>
                <Chip
                  size='small'

                  label={`${followUp.status}`}
                  color='secondary'
                  variant='contained'
                />
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary'>
                    <i className='bi bi-calendar-event' style={{ verticalAlign: 'middle', marginRight: 8 }}></i>
                    Date: <b> {new Date(followUp.nextFollowUpDate).toLocaleString()} </b>
                  </Typography>
                </Grid>
                <Divider sx={{ my: 1.5 }} />
                <Grid item xs={12}>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    <i className='bi bi-sticky-note' style={{ verticalAlign: 'middle', marginRight: 8 }}></i>
                    Notes: {followUp.notes}
                  </Typography>
                </Grid>
                {/* <Grid item xs={6}>
                  <Typography color='text.secondary' sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 24, height: 24, mr: 1 }}>
                      {followUp.assignedTo.name.charAt(0)}
                    </Avatar>
                    {followUp.assignedTo.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    size='small'
                    icon={<Box component='i' className='bi bi-sticky-note-2-line' />}
                    label={`${followUp.leadId.campaign}`}
                    color='primary'
                    variant='outlined'
                  />
                </Grid> */}
              </Grid>
            </CardContent>
            <CardActions style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size='small' color='success' variant='contained'>
                Close
              </Button> <Button
                startIcon={<Box component='i' className='bi bi-pencil-square' />}
                size='small'
                color='primary'
                variant='contained'
              >
                <Link href={getLocalizedUrl(`/leads?Userid=${followUp.leadId._id}`, locale)} className='flex'>
                  View
                </Link>
              </Button>
            </CardActions>
          </Card>
        )
      })}

      {/* <Card>
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
       */}
    </>
  )
}

export default BasicDataTables
