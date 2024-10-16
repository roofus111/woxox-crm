'use client'
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'

// Component Imports
import AddCard from '@views/apps/manager/invoice/add/AddCard'
import AddActions from '@views/apps/manager/invoice/add/AddActions'

// Data Imports
import { getInvoiceData } from '@/app/server/actions'

const InvoiceAdd = () => {
    // Vars

    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const [data, setData] = useState([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios
            .get(`http://localhost:8000/api/leads/leads/${id}`, {
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
        <Grid container spacing={6}>
            <Grid item xs={12} md={12}>
                <AddCard data={data} />
            </Grid>
            {/* <Grid item xs={12} md={3}>
                <AddActions />
            </Grid> */}
        </Grid>
    )
}

export default InvoiceAdd
