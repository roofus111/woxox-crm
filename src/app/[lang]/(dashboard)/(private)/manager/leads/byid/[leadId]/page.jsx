'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Grid } from "@mui/material"
import { DataProvider } from '@/contexts/DataContext'
import UserLeftOverview from '@views/apps/leadView/view/user-left-overview'
import UserRight from '@views/apps/leadView/view/user-right'
import dynamic from 'next/dynamic'
import axios from 'axios'
const OverViewTab = dynamic(() => import('@views/apps/leadView/view/user-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/leadView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/leadView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/leadView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/leadView/view/user-right/connections'))
import { useParams } from 'next/navigation'
const LeadsById = () => {
    const params = useParams()
    const leadsId = params.leadId

    const tabContentList = data => ({
        overview: <OverViewTab props={data} />,
        security: <SecurityTab props={data} />,
        // 'billing-plans': <BillingPlans data={data} />,
        notifications: <NotificationsTab props={data} />,
        connections: <ConnectionsTab />
    })

    const [viewItem, setViewItem] = useState({})

    useEffect(() => {
        const token = localStorage.getItem('token')
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadsId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                setViewItem(response.data) // Update data if component is still mounted
                console.log(response.data)
            })
            .catch(error => {
                console.error('Failed to fetch data:', error)
            })
    }, [])
    return (
        <><h1>Lead By id Page</h1>
            <Grid container spacing={6}>
                <DataProvider>
                    <Grid item xs={12} lg={4} md={5}>
                        <UserLeftOverview data={viewItem} />
                    </Grid>
                    <Grid item xs={12} lg={8} md={7}>
                        <UserRight tabContentList={tabContentList({ viewItem })} />
                    </Grid>
                </DataProvider>
            </Grid></>
    )
}
export default LeadsById
