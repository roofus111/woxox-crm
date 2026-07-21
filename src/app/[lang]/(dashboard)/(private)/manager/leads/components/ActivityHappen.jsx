import React, { useEffect, useState } from 'react'
import { ActivityItem, ActivityNumber } from './ResizableDrawer'
import { Box, Typography } from '@mui/material'
import axios from 'axios'
import { toast } from 'react-toastify'
import Moment from 'react-moment'

const ActivityHappen = (props) => {
    const [pipelineData, setPipelineData] = useState({})
    const [leadData, setLeadData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeStep, setActiveStep] = useState(0)

    // Fetch lead data first to get pipeline information
    const fetchLeadData = async (leadId) => {
        const token = localStorage.getItem("token")

        if (!token) {
            toast.error("Authorization token is missing.")
            setError("Authorization token is missing.")
            setLoading(false)
            return
        }

        if (!process.env.NEXT_PUBLIC_API_URL) {
            toast.error("API URL is not configured.")
            setError("API URL is not configured.")
            setLoading(false)
            return
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/leads/leads/${leadId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            if (response.status === 200) {
                // The API returns lead data nested under 'lead' property
                const leadInfo = response.data.lead
                setLeadData(leadInfo)
                console.log("Lead data:", leadInfo)
                console.log("Full response:", response.data)

                // Check if lead has pipeline information
                if (leadInfo?.campaignid?.Pipeline) {
                    setActiveStep(leadInfo?.stages || 0)
                    await fetchPipelineData(leadInfo.campaignid.Pipeline)
                } else {
                    console.log("Pipeline check failed:", {
                        leadInfo: leadInfo,
                        campaignid: leadInfo?.campaignid,
                        Pipeline: leadInfo?.campaignid?.Pipeline
                    })
                    setError("No pipeline associated with this lead.")
                    setLoading(false)
                }
            } else {
                toast.error("Failed to fetch lead data. Please try again.")
                setError("Failed to fetch lead data.")
                setLoading(false)
            }
        } catch (error) {
            console.error("Error fetching lead data:", error)
            toast.error("An error occurred while fetching lead data.")
            setError("An error occurred while fetching lead data.")
            setLoading(false)
        }
    }

    const fetchPipelineData = async (pipelineId) => {
        const token = localStorage.getItem("token")

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/api/pipelines/getpipeline/${pipelineId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )

            if (response.status === 200) {
                setPipelineData(response.data)
                console.log("pipelineData:", response.data)
                setLoading(false)
            } else {
                toast.error("Failed to fetch pipelines. Please try again.")
                setError("Failed to fetch pipelines.")
                setLoading(false)
            }
        } catch (error) {
            console.error("Error fetching pipelines:", error)
            toast.error("An error occurred while fetching pipelines.")
            setError("An error occurred while fetching pipelines.")
            setLoading(false)
        }
    }

    useEffect(() => {
        console.log("Props received:", props)
        console.log("Props.id:", props.id)

        if (props.id) {
            // Handle different types of ID input
            if (typeof props.id === 'string' || typeof props.id === 'number') {
                // Simple ID case - fetch lead data first
                fetchLeadData(props.id)
            } else if (typeof props.id === 'object' && props.id?.campaignid?.Pipeline) {
                // Complex object case - use existing logic
                setActiveStep(props.id?.stages || 0)
                fetchPipelineData(props.id.campaignid.Pipeline)
            } else {
                setError("Invalid lead data structure.")
                setLoading(false)
            }
        } else {
            setLoading(false)
            setError("No lead ID provided.")
        }
    }, [props.id])

    // Update active step when lead data changes
    useEffect(() => {
        if (leadData?.stages !== undefined) {
            setActiveStep(leadData.stages)
        }
    }, [leadData?.stages])

    if (loading) {
        return (
            <div>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 6,
                    p: 3,
                    borderRadius: 2,
                    minHeight: 120
                }}>
                    <Typography>Loading pipeline data...</Typography>
                </Box>
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 6,
                    p: 3,
                    borderRadius: 2,
                    minHeight: 120
                }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            </div>
        )
    }

    const stages = pipelineData.stages || []

    if (stages.length === 0) {
        return (
            <div>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mb: 6,
                    p: 3,
                    borderRadius: 2,
                    minHeight: 120
                }}>
                    <Typography color="text.secondary">No pipeline stages available.</Typography>
                </Box>
            </div>
        )
    }

    return (
        <div>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 6,
                p: 3,
                borderRadius: 2,
                position: 'relative',
                overflowX: 'auto',
                gap: 2
            }}>
                {stages.map((stage, index) => (
                    <ActivityItem key={stage._id || index} isActive={activeStep >= index}>
                        <ActivityNumber isActive={activeStep >= index}>
                            {index + 1}
                        </ActivityNumber>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: activeStep >= index ? 600 : 500,
                                color: activeStep >= index ? '#6366f1' : '#6b7280',
                                mb: 0.5,
                                fontSize: '14px',
                                textAlign: 'center',
                                minWidth: 80
                            }}
                        >
                            {stage.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#9ca3af',
                                fontSize: '11px',
                                textAlign: 'center'
                            }}
                        >
                            {stage.createdAt ? (
                                <Moment format="DD MMM YYYY">{stage.createdAt}</Moment>
                            ) : (
                                stage.updatedAt ? (
                                    <Moment format="DD MMM YYYY">{stage.updatedAt}</Moment>
                                ) : (
                                    `Stage ${index + 1}`
                                )
                            )}
                        </Typography>
                    </ActivityItem>
                ))}
            </Box>
        </div>
    )
}

export default ActivityHappen
