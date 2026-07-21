'use client'

import React, { useState, useEffect } from 'react'
import { Box, CircularProgress, Typography } from "@mui/material"

import { DataProvider } from '@/contexts/DataContext'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'

import ResizableDrawer from '../../components/ResizableDrawer'

const OverViewTab = dynamic(() => import('@views/apps/leadView/view/user-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/leadView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/leadView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/leadView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/leadView/view/user-right/connections'))

const LeadsById = () => {
    const params = useParams()
    const router = useRouter()
    const leadsId = params.leadId

    const [viewItem, setViewItem] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [drawerOpen, setDrawerOpen] = useState(true) // Controls drawer visibility

    const tabContentList = data => ({
        overview: <OverViewTab props={data} />,
        security: <SecurityTab props={data} />,
        // 'billing-plans': <BillingPlans data={data} />,
        notifications: <NotificationsTab props={data} />,
        connections: <ConnectionsTab props={data} />
    })
    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoading(true)

        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadsId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                const leadData = response.data.lead || response.data;

                console.log("API Response: ", response.data);
                console.log("Lead Data: ", leadData);
                
                setViewItem(leadData)
                setIsLoading(false)
            })
            .catch(error => {
                console.error('Failed to fetch data:', error)
                setIsLoading(false)
            })
    }, [leadsId])

    const handleDrawerClose = () => {
        setDrawerOpen(false)
        // Navigate back to leads list or previous page
        router.back() // or router.push('/leads') depending on your routing structure
    }

    // Show loading state
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading lead information...</Typography>
            </Box>
        )
    }

    // Show error state if no data
    if (!viewItem || Object.keys(viewItem).length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column'
                }}
            >
                <Typography variant="h6" color="error">
                    Lead not found
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Unable to load lead information
                </Typography>
            </Box>
        )
    }

    return (
        <DataProvider>
            <ResizableDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                title="Lead Details"
                leadData={viewItem}
                leadId={leadsId}
                profileImage={viewItem.profileImage}
                userName={viewItem.name || "Unknown Lead"}
                defaultWidth={1200}
                minWidth={600}
                maxWidth={1800}
            />
        </DataProvider>

    )
}

export default LeadsById
