// MUI Imports

'use client'
import axios from 'axios'
import { useEffect, useState } from 'react'
import IconButton from '@mui/material/IconButton'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import CardHeader from '@mui/material/CardHeader'

import { useData } from '@/contexts/DataContext'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import Link from '@components/Link'

import Moment from 'react-moment'
import { toast } from 'react-toastify'

const ProjectListTable = ({ id }) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const { data1 } = useData()
  const { updateData } = useData()

  useEffect(() => {
    let isMounted = true // To prevent setting state after unmount
    const token = localStorage.getItem('token')

    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        if (isMounted) {
          setData(response.data)
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
      // Cleanup logic
      isMounted = false
    }
  }, [data1])

  const handleSubmit = async id => {
    try {
      const token = localStorage.getItem('token')
      // Example API call to submit the form
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/followups/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Closed' })
      })

      const data = await response.json()

      if (response.ok) {
        updateData({ refresh: true })
        toast.success('Marked as Done')
      } else {
        setError(data.message || 'An error occurred. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader title='Upcoming Activity' />
      <CardContent className='flex flex-col gap-6'>
        {data
          ?.filter(item => item.status !== 'Closed')
          .map(item => (
            <div key={item._id} className='flex items-center gap-4'>
              {/* <CustomAvatar size={38} src={item.avatar} /> */}
              <div className='flex justify-between items-center w-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-0.5'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-calendar-line text-base text-textSecondary' />
                    <Typography variant='body2'>
                      <Moment format='ddd MMM DD YYYY hh:mm A'>{item.nextFollowUpDate}</Moment>
                      <Chip label={item.status} color='warning' size='small' variant='tonal' />
                      <Tooltip title='Mark as done' arrow>
                        <IconButton aria-label='mark as done' color='success' onClick={() => handleSubmit(item._id)}>
                          <i className='ri-checkbox-circle-fill'></i>
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </div>
                  <Typography color='text.primary' className='font-medium'>
                    {item.notes}
                  </Typography>
                  <div className='flex flex-row gap-2'>
                    <Typography variant='body2'>
                      Created By: {item.createdBy?.name} &#x2192; {item.assignedTo?.name}
                    </Typography>
                  </div>
                </div>
                <Typography variant='body2'>
                  <Moment fromNow>{item.updatedAt}</Moment>
                </Typography>
              </div>
            </div>
          ))}
      </CardContent>
    </Card>
  )
}

export default ProjectListTable
