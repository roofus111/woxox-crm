
'use client'
import Grid from '@mui/material/Grid'
import axios from 'axios'
import { useState, useEffect } from 'react'
// Component Imports
import InvoiceListTable from './InvoiceListTable'



const Transaction = () => {
    const [data, setData] = useState([])


    useEffect(() => {
        const token = localStorage.getItem('token')
        axios
            .get('https://app.canbridge.in/api/payment/', {
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
            <Grid item xs={12}>
                <InvoiceListTable invoiceData={data} />
            </Grid>
        </Grid>
    )
}

export default Transaction
