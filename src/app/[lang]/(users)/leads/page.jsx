// React Imports
'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import MeetingSchedule from '@views/user/MeetingSchedule'
const Leads = () => {
  const [data, setData] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios
      .get('http://localhost:8000/api/user-profiles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(response => {
        setData(response.data) // Update data if component is still mounted
        console.log(response.data)
      })
      .catch(error => {
        console.error('Failed to fetch data:', error)
      })
  }, [])
  return (
    <MeetingSchedule user={data} />
  )
}

export default Leads
