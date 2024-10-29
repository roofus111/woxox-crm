'use client'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import Typography from '@mui/material/Typography'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import { useRouter } from 'next/navigation'
import Moment from 'react-moment'

// Component Imports
import CustomAvatarAvatar from '@core/components/mui/Avatar'
import { toast } from 'react-toastify'
import { useData } from '@/contexts/DataContext'

// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

const UserActivityTimeLine = ({ id }) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const { data1 } = useData()

  useEffect(() => {
    let isMounted = true // To prevent setting state after unmount
    const token = localStorage.getItem('token')

    if (!token) {
      setError('No authorization token found.')
      setLoading(false)
      return
    }

    axios
<<<<<<< HEAD
      .get(`https://app.canbridge.in/api/leadactivity/${id}`, {
=======
      .get(`http://13.127.160.185:8000/api/leadactivity/${id}`, {
>>>>>>> production
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

  return (
    <Card>
      <CardHeader title='User Activity Timeline' />
      <CardContent>
        <Timeline>
          {data?.map((item, index) => {
            return (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot
                    color={item.action === 'note_added' ? `info` : item.action === 'followUp' ? `warning` : 'success'}
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                    <Typography className='font-medium' color='text.primary'>
                      {item.action === 'note_added'
                        ? `${item.userId.name} added a Note`
                        : item.action === 'followUp'
                          ? `${item.userId.name} created a new followup`
                          : item.action === 'status_change'
                            ? `${item.userId.name}  Closed a followup`
                            : 'Other Title '}
                    </Typography>
                    <Typography variant='caption'>
                      <Moment fromNow>{item.timestamp}</Moment>
                    </Typography>
                  </div>
                  {item.action === 'note_added' ? (
                    <Typography padding={3} bgcolor={'#fffeee'} className='mbe-2'>
                      {item.details}
                    </Typography>
                  ) : item.action === 'followUp' ? (
                    []
                  ) : item.action === 'status_change' ? (
                    []
                  ) : (
                    <Typography padding={3} bgcolor={'#fffeee'} className='mbe-2'>
                      {item.details}
                    </Typography>
                  )}

                  {/* <div className='flex items-center gap-2.5 is-fit bg-actionHover rounded-lg plb-[5px] pli-2.5'>
                    <img height={20} alt='invoice.pdf' src='/images/icons/pdf-document.png' />
                    <Typography className='font-medium'>invoices.pdf</Typography>
                  </div> */}
                </TimelineContent>
              </TimelineItem>
            )
          })}

          {/* <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color='primary' />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                <Typography className='font-medium' color='text.primary'>
                  12 Invoices have been paid
                </Typography>
                <Typography variant='caption'>12 min ago</Typography>
              </div>
              <Typography className='mbe-2'>Invoices have been paid to the company</Typography>
              <div className='flex items-center gap-2.5 is-fit bg-actionHover rounded-lg plb-[5px] pli-2.5'>
                <img height={20} alt='invoice.pdf' src='/images/icons/pdf-document.png' />
                <Typography className='font-medium'>invoices.pdf</Typography>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color='success' />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                <Typography className='font-medium' color='text.primary'>
                  Client Meeting
                </Typography>
                <Typography variant='caption'>45 min ago</Typography>
              </div>
              <Typography className='mbe-2'>Project meeting with john @10:15am</Typography>
              <div className='flex items-center gap-2.5'>
                <CustomAvatarAvatar src='/images/avatars/2.png' size={32} />
                <div className='flex flex-col flex-wrap'>
                  <Typography variant='body2' className='font-medium'>
                    Lester McCarthy (Client)
                  </Typography>
                  <Typography variant='body2'>CEO of Pixinvent</Typography>
                </div>
              </div>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineSeparator>
              <TimelineDot color='info' />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                <Typography className='font-medium' color='text.primary'>
                  Create a new project for client
                </Typography>
                <Typography variant='caption'>2 Day Ago</Typography>
              </div>
              <Typography className='mbe-2'>6 team members in a project</Typography>
              <AvatarGroup total={6} className='pull-up'>
                <Avatar alt='Travis Howard' src='/images/avatars/3.png' />
                <Avatar alt='Agnes Walker' src='/images/avatars/6.png' />
                <Avatar alt='John Doe' src='/images/avatars/4.png' />
              </AvatarGroup>
            </TimelineContent>
          </TimelineItem> */}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default UserActivityTimeLine
