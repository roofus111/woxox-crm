'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Grid, Button } from "@mui/material"
import { DataProvider } from '@/contexts/DataContext'
import UserLeftOverview from '@views/apps/leadView/view/user-left-overview'
import UserRight from '@views/apps/leadView/view/user-right'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
const OverViewTab = dynamic(() => import('@views/apps/leadView/view/user-right/overview'))
const SecurityTab = dynamic(() => import('@views/apps/leadView/view/user-right/security'))
const BillingPlans = dynamic(() => import('@views/apps/leadView/view/user-right/billing-plans'))
const NotificationsTab = dynamic(() => import('@views/apps/leadView/view/user-right/notifications'))
const ConnectionsTab = dynamic(() => import('@views/apps/leadView/view/user-right/connections'))

const LeadsById = () => {
    const params = useParams()
    const router = useRouter()
    const leadsId = params.leadId

    const tabContentList = data => ({
        overview: <OverViewTab props={data} />,
        security: <SecurityTab props={data} />,
        // 'billing-plans': <BillingPlans data={data} />,
        notifications: <NotificationsTab props={data} />,
        connections: <ConnectionsTab props={data} />
    })

    const [viewItem, setViewItem] = useState({})
    const [navigation, setNavigation] = useState({ prev: null, next: null })
    const [isLoading, setIsLoading] = useState(true);

    const handleNavigation = async (leadId) => {
        setIsLoading(true);
        // const token = localStorage.getItem('token');
        try {
            // const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadId}`, {
            //     headers: {
            //         Authorization: `Bearer ${token}`,
            //     },
            // });
            // setViewItem(response.data.lead);
            // setNavigation(response.data.navigation);
            router.push(`/en/manager/leads/byid/${leadId}`, { shallow: true });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoading(true);
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadsId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                setViewItem(response.data.lead);
                setNavigation(response.data.navigation);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Failed to fetch data:', error);
                setIsLoading(false);
            });
    }, []);

    return (
        <>
            {isLoading ? "...loading" : (
                <>
                    {/* <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item>
                            <Button
                                variant="outlined"
                                disabled={!navigation.next}
                                onClick={() => handleNavigation(navigation.next._id)}
                            >
                                {navigation.next?.name || 'Previous'} →
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="outlined"
                                disabled={!navigation.prev}
                                onClick={() => handleNavigation(navigation.prev._id)}
                            >
                                ← {navigation.prev?.name || 'Next'}
                            </Button>
                        </Grid>

                    </Grid> */}
                    <Grid container spacing={6}>
                        <DataProvider>
                            <Grid item xs={12} lg={4} md={5}>
                                <UserLeftOverview data={viewItem} />
                            </Grid>
                            <Grid item xs={12} lg={8} md={7}>
                                <UserRight tabContentList={tabContentList({ viewItem })} />
                            </Grid>
                        </DataProvider>
                    </Grid>
                </>
            )}
        </>
    )
}
export default LeadsById
