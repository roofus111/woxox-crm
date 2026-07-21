"use client"

import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab'
import { IconButton, Tooltip, ToggleButton, ToggleButtonGroup, FormControlLabel, Switch, Stack } from '@mui/material'
import DonutChart from '@/views/dashboards/crm/DonutChart'
import { CircularProgress } from '@mui/material'
import { LinearProgress } from '@mui/material'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import React from 'react'
import { Collapse } from '@mui/material'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { alpha } from '@mui/material/styles'
import { debounce } from 'lodash'


// Constants with enhanced styling
const ACTIVITY_COLORS = {
  note_added: 'primary',
  followUp: 'secondary',
  assigned: 'success',
  Rescheduled: 'warning',
  default: 'grey'
}

const ACTIVITY_ICONS = {
  note_added: 'ri-sticky-note-line',
  followUp: 'ri-time-line',
  assigned: 'ri-user-line',
  Rescheduled: 'ri-phone-line'
}

const STATUS_COLORS = {
  Interested: 'success',
  'Not Interested': 'error',
  Contacted: 'info',
  default: 'default'
}

const initialKpiState = {
  timeline: [],
  historical: {},
  todayStatusChanges: {
    total: 0,
    byStatus: {}
  },
  totalActivities: 0,
  activeHours: 0,
  actionBreakdown: {},
  leadsInteracted: 0,
  firstActivity: null,
  lastActivity: null,
  loading: true,
  error: null,
  userInfo: null,
  userData: {
    summary: {
      leadStats: {
        todayStatusChanges: {
          total: 0,
          byStatus: {}
        }
      }
    }
  }
}

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add new performance scoring constants
const PERFORMANCE_METRICS = {
  activityWeights: {
    note_added: 1,
    followUp: 2.5,
    assigned: 1.5,
    Rescheduled: 1,
    conversion: 8,
    interested_status: 4,
    call_scheduled: 2,
    meeting_completed: 3,
    email_sent: 1.5,
    response_received: 2
  },
  timeBlockScoring: {
    earlyMorningBonus: 1.3,  // 8AM-9AM
    morningPrime: 1.4,       // 9AM-11AM
    lunchPenalty: 0.7,       // 12PM-1PM
    afternoonStandard: 1.0,  // 2PM-4PM
    lateAfternoonBonus: 1.2  // 4PM-5PM
  },
  qualityFactors: {
    followUpCompletion: 1.8,
    missedFollowUpPenalty: -3,
    multipleInteractions: {
      twoPerLead: 1.2,
      threePerLead: 1.4,
      fourPlusPerLead: 1.6
    },
    responseTime: {
      under5min: 1.5,
      under15min: 1.3,
      under30min: 1.1,
      under1hour: 1.0,
      under2hours: 0.9,
      over2hours: 0.7
    },
    conversionBonus: 10,
    interestedStatusBonus: 5
  },
  consistencyMetrics: {
    minActivitiesPerHour: 3,
    optimalActivitiesPerHour: 6,
    maxGapMinutes: 45,
    gapPenalty: -1
  }
}

// Add these utility functions before the PERFORMANCE_METRICS constant

// Utility functions for performance calculations
const utils = {
  calculateFollowUpCompletionRate: (activities) => {
    const followUps = activities.filter(activity => activity.action === 'followUp')
    if (!followUps.length) return 0

    const completedFollowUps = followUps.filter(activity =>
      activity.status === 'completed' || activity.status === 'done'
    )

    return (completedFollowUps.length / followUps.length) * 100
  },

  calculateActivityDensity: (activities) => {
    if (!activities.length) return 0
    const firstActivity = activities[0].timestamp
    const lastActivity = activities[activities.length - 1].timestamp
    const activeHours = Math.max((lastActivity - firstActivity) / (1000 * 60 * 60), 1)
    return activities.length / activeHours
  },

  calculateResponseTime: (activity) => {
    return activity.responseTime || 0
  },

  getTimeBlockMultiplier: (hour) => {
    if (hour >= 8 && hour < 9) return PERFORMANCE_METRICS.timeBlockScoring.earlyMorningBonus
    if (hour >= 9 && hour < 11) return PERFORMANCE_METRICS.timeBlockScoring.morningPrime
    if (hour >= 12 && hour < 13) return PERFORMANCE_METRICS.timeBlockScoring.lunchPenalty
    if (hour >= 14 && hour < 16) return PERFORMANCE_METRICS.timeBlockScoring.afternoonStandard
    if (hour >= 16 && hour < 17) return PERFORMANCE_METRICS.timeBlockScoring.lateAfternoonBonus
    return 1.0
  },

  getResponseTimeMultiplier: (responseTime) => {
    if (responseTime < 5) return PERFORMANCE_METRICS.qualityFactors.responseTime.under5min
    if (responseTime < 15) return PERFORMANCE_METRICS.qualityFactors.responseTime.under15min
    if (responseTime < 30) return PERFORMANCE_METRICS.qualityFactors.responseTime.under30min
    if (responseTime < 60) return PERFORMANCE_METRICS.qualityFactors.responseTime.under1hour
    if (responseTime < 120) return PERFORMANCE_METRICS.qualityFactors.responseTime.under2hours
    return PERFORMANCE_METRICS.qualityFactors.responseTime.over2hours
  },

  calculateQualityScore: (avgResponseTime, followUpRate, leadInteractions) => {
    const responseTimeScore = utils.getResponseTimeMultiplier(avgResponseTime) * 30
    const followUpScore = followUpRate * 0.4
    const leadEngagementScore = utils.calculateLeadEngagementScore(leadInteractions)
    return Math.min(responseTimeScore + followUpScore + leadEngagementScore, 100)
  },

  calculateEfficiencyScore: (activityDensity, timeGaps) => {
    const densityScore = Math.min(
      (activityDensity / PERFORMANCE_METRICS.consistencyMetrics.optimalActivitiesPerHour) * 70,
      70
    )
    const gapPenalty = utils.calculateTimeGapPenalty(timeGaps)
    return Math.max(Math.min(densityScore - gapPenalty, 100), 0)
  },

  calculateConsistencyScore: (activities, timeGaps) => {
    if (!activities.length) return 0
    const hourlyDistribution = new Array(24).fill(0)
    activities.forEach(activity => {
      hourlyDistribution[activity.hourOfDay]++
    })
    const activeHours = hourlyDistribution.filter(count => count > 0).length
    const distributionScore = Math.min((activeHours / 8) * 60, 60)
    const gapPenalty = Math.min(timeGaps.length * 5, 40)
    const avgActivitiesPerHour = activities.length / activeHours
    const paceScore = Math.min(
      (avgActivitiesPerHour / PERFORMANCE_METRICS.consistencyMetrics.minActivitiesPerHour) * 40,
      40
    )
    return Math.max(distributionScore + paceScore - gapPenalty, 0)
  },

  calculateTimeGapPenalty: (timeGaps) => {
    if (!timeGaps.length) return 0
    return timeGaps.reduce((penalty, gap) => {
      const gapHours = gap / 60
      let gapPenalty = PERFORMANCE_METRICS.consistencyMetrics.gapPenalty
      if (gapHours >= 2) gapPenalty *= 1.5
      if (gapHours >= 4) gapPenalty *= 2
      return penalty + gapPenalty
    }, 0)
  },

  calculateLeadEngagementScore: (leadInteractions) => {
    if (!Object.keys(leadInteractions).length) return 0
    return Object.values(leadInteractions).reduce((score, interaction) => {
      let interactionScore = 1
      if (interaction.count >= 4) {
        interactionScore *= PERFORMANCE_METRICS.qualityFactors.multipleInteractions.fourPlusPerLead
      } else if (interaction.count >= 3) {
        interactionScore *= PERFORMANCE_METRICS.qualityFactors.multipleInteractions.threePerLead
      } else if (interaction.count >= 2) {
        interactionScore *= PERFORMANCE_METRICS.qualityFactors.multipleInteractions.twoPerLead
      }
      interactionScore *= (1 + (interaction.types.size * 0.1))
      return score + interactionScore
    }, 0)
  },

  calculateMetricsBatch: (activities) => {
    const metrics = {
      followUps: 0,
      completedFollowUps: 0,
      totalResponseTime: 0,
      responseTimeCount: 0,
      activityTypes: new Set(),
      hourlyDistribution: new Array(24).fill(0)
    }

    activities.forEach(activity => {
      // Process follow-ups
      if (activity.action === 'followUp') {
        metrics.followUps++
        if (activity.status === 'completed' || activity.status === 'done') {
          metrics.completedFollowUps++
        }
      }

      // Process response times
      if (activity.responseTime) {
        metrics.totalResponseTime += activity.responseTime
        metrics.responseTimeCount++
      }

      // Track activity types
      metrics.activityTypes.add(activity.action)

      // Update hourly distribution
      metrics.hourlyDistribution[activity.hourOfDay]++
    })

    return metrics
  },

  calculateLeadInteractionsBatch: (activities) => {
    const interactions = {}

    activities.forEach(activity => {
      if (activity.lead?.id) {
        if (!interactions[activity.lead.id]) {
          interactions[activity.lead.id] = {
            count: 0,
            firstInteraction: activity.timestamp,
            lastInteraction: activity.timestamp,
            types: new Set()
          }
        }

        const leadStats = interactions[activity.lead.id]
        leadStats.count++
        leadStats.types.add(activity.action)
        leadStats.lastInteraction = activity.timestamp
      }
    })

    return interactions
  },

  normalizeScores: (scores) => {
    return Object.entries(scores).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: Math.min(Math.max(Math.round(value), 0), 100)
    }), {})
  },

  calculatePercentageChange: (current, previous) => {
    if (!previous) return 0
    return Math.round(((current - previous) / previous) * 100)
  },

  getScoreColor: (score) => {
    if (score >= 80) return 'success.main'
    if (score >= 60) return 'primary.main'
    if (score >= 40) return 'warning.main'
    return 'error.main'
  },

  formatMetricName: (metric) => {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  },

  formatMetricValue: (metric, value) => {
    switch (metric) {
      case 'responseTimeAvg':
        return `${Math.round(value)} min`
      case 'followUpCompletion':
        return `${Math.round(value)}%`
      case 'activityDensity':
        return `${value.toFixed(1)}/hr`
      default:
        return value
    }
  }
}

// Add performance optimization constants
const CACHE_DURATION = 60000 // 1 minute cache duration
const BATCH_SIZE = 50 // Process activities in batches

// Add performance optimization utilities
const performanceUtils = {
  cache: new Map(),

  memoize: (key, callback, duration = CACHE_DURATION) => {
    const cached = performanceUtils.cache.get(key)
    if (cached && Date.now() - cached.timestamp < duration) {
      return cached.value
    }

    const value = callback()
    performanceUtils.cache.set(key, {
      value,
      timestamp: Date.now()
    })
    return value
  },

  processBatch: (items, processor, batchSize = BATCH_SIZE) => {
    const results = []
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      results.push(...batch.map(processor))
    }
    return results
  },

  debounce: (func, wait) => {
    let timeout
    return (...args) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  },

  calculateMetricsBatch: (activities) => {
    return performanceUtils.memoize(
      `metrics-${activities.length}-${activities[0]?.timestamp}`,
      () => {
        const metrics = {
          followUps: 0,
          completedFollowUps: 0,
          totalResponseTime: 0,
          responseTimeCount: 0,
          activityTypes: new Set(),
          hourlyDistribution: new Array(24).fill(0)
        }

        performanceUtils.processBatch(activities, activity => {
          // Process follow-ups
          if (activity.action === 'followUp') {
            metrics.followUps++
            if (activity.status === 'completed' || activity.status === 'done') {
              metrics.completedFollowUps++
            }
          }

          // Process response times
          if (activity.responseTime) {
            metrics.totalResponseTime += activity.responseTime
            metrics.responseTimeCount++
          }

          // Track activity types
          metrics.activityTypes.add(activity.action)

          // Update hourly distribution
          metrics.hourlyDistribution[activity.hourOfDay]++
        })

        return metrics
      }
    )
  },

  calculateLeadInteractionsBatch: (activities) => {
    return performanceUtils.memoize(
      `lead-interactions-${activities.length}-${activities[0]?.timestamp}`,
      () => {
        const interactions = {}

        performanceUtils.processBatch(activities, activity => {
          if (activity.lead?.id) {
            if (!interactions[activity.lead.id]) {
              interactions[activity.lead.id] = {
                count: 0,
                firstInteraction: activity.timestamp,
                lastInteraction: activity.timestamp,
                types: new Set()
              }
            }

            const leadStats = interactions[activity.lead.id]
            leadStats.count++
            leadStats.types.add(activity.action)
            leadStats.lastInteraction = activity.timestamp
          }
        })

        return interactions
      }
    )
  }
}

const ActivityBarGraph = ({ activities }) => {
  const [hoveredBar, setHoveredBar] = useState(null)
  const [view, setView] = useState('count')
  const [showIdlePeriods, setShowIdlePeriods] = useState(true)

  // Find first activity time
  const firstActivityTime = useMemo(() => {
    if (!activities.length) return null
    return new Date(activities.sort((a, b) =>
      new Date(a.timestamp) - new Date(b.timestamp)
    )[0].timestamp)
  }, [activities])

  // Check if first activity is after 9:40 AM
  const isLateStart = useMemo(() => {
    if (!firstActivityTime) return false
    const hours = firstActivityTime.getHours()
    const minutes = firstActivityTime.getMinutes()
    return hours > 9 || (hours === 9 && minutes > 40)
  }, [firstActivityTime])

  // Format for displaying time
  const formatFirstActivityTime = (date) => {
    if (!date) return '--:--'
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Add warning alert at the top
  const LateStartWarning = () => {
    if (!isLateStart) return null

    return (
      <Alert
        severity="warning"
        sx={{ mb: 2 }}
        action={
          <Tooltip title="Expected start time is before 9:40">
            <IconButton size="small" color="inherit">
              <i className="ri-information-line" />
            </IconButton>
          </Tooltip>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="ri-time-line" style={{ fontSize: '16px' }} />
          Late start detected - First activity at {formatFirstActivityTime(firstActivityTime)}
        </Box>
      </Alert>
    )
  }

  // Group activities by 15-minute intervals
  const intervals = useMemo(() => {
    // Initialize intervals array (9 AM to 6 PM = 36 intervals)
    const intervalData = Array(36).fill().map((_, i) => {
      const startHour = Math.floor(i / 4) + 9
      const startMinute = (i % 4) * 15
      const start = new Date()
      start.setHours(startHour, startMinute, 0, 0)

      const end = new Date(start)
      end.setMinutes(start.getMinutes() + 14, 59, 999)

      return {
        start,
        end,
        count: 0,
        activities: [],
        isIdle: true,
        types: {}
      }
    })

    // Populate intervals with activities
    activities.forEach(activity => {
      const date = new Date(activity.timestamp)
      const hour = date.getHours()
      const minutes = date.getMinutes()
      const index = ((hour - 9) * 4) + Math.floor(minutes / 15)

      if (index >= 0 && index < 36) {
        intervalData[index].count++
        intervalData[index].isIdle = false
        intervalData[index].activities.push(activity)
        intervalData[index].types[activity.action] = (intervalData[index].types[activity.action] || 0) + 1
      }
    })

    return intervalData
  }, [activities])

  const maxCount = Math.max(...intervals.map(int => int.count), 1)

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // Calculate productivity score for each interval (0-100)
  const getProductivityScore = (interval) => {
    if (interval.count === 0) return 0

    const typeVariety = Object.keys(interval.types).length
    const activityDensity = interval.count / 15 // activities per minute
    const score = Math.min((typeVariety * 20) + (activityDensity * 50), 100)
    return Math.round(score)
  }

  // Get color based on productivity score
  const getBarColor = (interval) => {
    const score = getProductivityScore(interval)
    if (score >= 80) return 'success.main'
    if (score >= 50) return 'primary.main'
    if (score >= 30) return 'warning.main'
    return 'grey.400'
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <LateStartWarning />

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, px: 2 }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(e, newView) => newView && setView(newView)}
          size="small"
        >
          <ToggleButton value="count">
            <Tooltip title="Show activity count">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-bar-chart-line" />
                Count
              </Box>
            </Tooltip>
          </ToggleButton>
          <ToggleButton value="type">
            <Tooltip title="Show activity types">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-pie-chart-line" />
                Types
              </Box>
            </Tooltip>
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControlLabel
          control={
            <Switch
              checked={showIdlePeriods}
              onChange={(e) => setShowIdlePeriods(e.target.checked)}
              size="small"
            />
          }
          label="Show Idle Periods"
        />
      </Box>

      <Box sx={{ position: 'relative', p: 2, mt: 2 }}>
        {/* Y-axis labels */}
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column-reverse',
          justifyContent: 'space-between',
          pr: 1
        }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Typography key={i} variant="caption" color="text.secondary">
              {Math.round((maxCount * i) / 4)}
            </Typography>
          ))}
        </Box>

        {/* Bar graph */}
        <Box sx={{
          display: 'flex',
          height: 200,
          pl: 4,
          alignItems: 'flex-end',
          gap: 0.5,
          position: 'relative'
        }}>
          {/* Idle period overlay */}
          {showIdlePeriods && intervals.map((interval, i) => {
            const currentTime = new Date()
            // Only show idle periods for intervals before current time
            const shouldShowIdle = interval.end < currentTime && interval.isIdle

            return shouldShowIdle ? (
              <Box
                key={`idle-${i}`}
                sx={{
                  position: 'absolute',
                  left: `${(i / 36) * 100}%`,
                  width: `${(1 / 36) * 100}%`,
                  height: '100%',
                  bgcolor: 'error.main',
                  opacity: 0.1,
                  zIndex: 0
                }}
              />
            ) : null
          })}

          {intervals.map((interval, i) => {
            const isHovered = hoveredBar === i
            const score = getProductivityScore(interval)

            return (
              <Tooltip
                key={i}
                open={isHovered}
                onClose={() => setHoveredBar(null)}
                title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: 'common.white' }}>
                      {`${formatTime(interval.start)} - ${formatTime(interval.end)}`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'common.white', display: 'block' }}>
                      {`${interval.count} activities`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'common.white', display: 'block' }}>
                      {`Productivity Score: ${score}`}
                    </Typography>
                    {/* {Object.entries(interval.types).map(([type, count]) => (
                      <Typography key={type} variant="caption" sx={{ color: 'common.white', display: 'block' }}>
                        {`${type}: ${count}`}
                      </Typography>
                    ))} */}
                  </Box>
                }
              >
                <Box
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                  sx={{
                    flex: 1,
                    height: `${(interval.count / maxCount) * 100}%`,
                    minHeight: interval.count > 0 ? 4 : 0,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    '&:hover': {
                      transform: 'scaleY(1.05)',
                    }
                  }}
                >
                  {view === 'count' ? (
                    <Box
                      sx={{
                        height: '100%',
                        bgcolor: getBarColor(interval),
                        opacity: isHovered ? 1 : 0.8,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  ) : (
                    Object.entries(interval.types).map(([type, count], typeIndex, array) => {
                      const height = (count / interval.count) * 100
                      const bottom = array
                        .slice(0, typeIndex)
                        .reduce((acc, [, c]) => acc + ((c / interval.count) * 100), 0)

                      return (
                        <Box
                          key={type}
                          sx={{
                            position: 'absolute',
                            bottom: `${bottom}%`,
                            height: `${height}%`,
                            width: '100%',
                            bgcolor: ACTIVITY_COLORS[type] || ACTIVITY_COLORS.default,
                            opacity: isHovered ? 1 : 0.8,
                            transition: 'opacity 0.3s ease'
                          }}
                        />
                      )
                    })
                  )}
                </Box>
              </Tooltip>
            )
          })}
        </Box>

        {/* X-axis labels */}
        <Box sx={{
          display: 'flex',
          pl: 4,
          mt: 1,
          gap: 0.5
        }}>
          {intervals.map((interval, i) => {
            const showLabel = i % 4 === 0
            return (
              <Typography
                key={i}
                variant="caption"
                color="text.secondary"
                sx={{
                  flex: 1,
                  textAlign: 'center',
                  visibility: showLabel ? 'visible' : 'hidden',
                  height: showLabel ? 'auto' : 0
                }}
              >
                {formatTime(interval.start)}
              </Typography>
            )
          })}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: 0.5 }} />
          <Typography variant="caption">High Productivity</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: 0.5 }} />
          <Typography variant="caption">Medium Productivity</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: 'warning.main', borderRadius: 0.5 }} />
          <Typography variant="caption">Low Productivity</Typography>
        </Box>
        {showIdlePeriods && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', opacity: 0.1, borderRadius: 0.5 }} />
            <Typography variant="caption">Idle Period</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

const ActivityStats = ({ activities }) => {
  // Calculate stats for each activity type
  const stats = activities.reduce((acc, activity) => {
    const type = activity.action
    if (!acc[type]) {
      acc[type] = {
        count: 0,
        times: [],
        color: ACTIVITY_COLORS[type] || ACTIVITY_COLORS.default,
        icon: ACTIVITY_ICONS[type] || 'ri-notification-line'
      }
    }
    acc[type].count++
    acc[type].times.push(new Date(activity.timestamp))
    return acc
  }, {})

  // Calculate additional statistics
  const totalActivities = activities.length
  const activityTypes = Object.keys(stats).length

  // Find most active periods
  const hourCounts = activities.reduce((acc, activity) => {
    const hour = new Date(activity.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  const mostActiveHour = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0]

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Activity Statistics
      </Typography>

      {/* Overall Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {totalActivities}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                Total Activities
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {activityTypes}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                Activity Types
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {`${mostActiveHour[0]}:00`}
              </Typography>
              <Typography color="text.secondary" variant="subtitle2">
                Peak Hour ({mostActiveHour[1]} activities)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const ActivityDateSelector = ({ selectedDate, onDateChange }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <IconButton
        onClick={() => {
          const newDate = new Date(selectedDate)
          newDate.setDate(newDate.getDate() - 1)
          onDateChange(newDate)
        }}
      >
        <i className="ri-arrow-left-s-line" />
      </IconButton>

      <Typography variant="subtitle1">
        {selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Typography>

      <IconButton
        onClick={() => {
          const newDate = new Date(selectedDate)
          newDate.setDate(newDate.getDate() + 1)
          const today = new Date()
          onDateChange(newDate > today ? today : newDate)
        }}
        disabled={isToday(selectedDate)}
      >
        <i className="ri-arrow-right-s-line" />
      </IconButton>
    </Box>
  )
}

const ActivityAnalysis = ({ activities, historicalData }) => {
  // Calculate daily patterns
  const getDailyPatterns = () => {
    const hourlyDistribution = Array(24).fill(0)
    activities.forEach(activity => {
      const hour = new Date(activity.timestamp).getHours()
      hourlyDistribution[hour]++
    })

    const peakHours = hourlyDistribution
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    return {
      hourlyDistribution,
      peakHours,
      mostProductiveBlock: peakHours[0]
    }
  }

  // Calculate activity trends
  const getActivityTrends = () => {
    const typeDistribution = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1
      return acc
    }, {})

    const comparisonWithAverage = Object.entries(typeDistribution).map(([type, count]) => {
      const avgCount = historicalData?.averages?.[type] || count
      const trend = ((count - avgCount) / avgCount) * 100
      return { type, count, trend }
    })

    return comparisonWithAverage
  }

  // Calculate productivity score (0-100)
  const getProductivityScore = () => {
    const totalActivities = activities.length
    const uniqueTypes = new Set(activities.map(a => a.action)).size
    const patterns = getDailyPatterns()
    const timeSpread = patterns.hourlyDistribution.filter(count => count > 0).length

    // Calculate lead engagement score (25 points max)
    const uniqueLeads = new Set(activities.map(a => a.lead?.id)).size
    const leadsPerHour = uniqueLeads / (timeSpread || 1)
    const leadEngagementScore = Math.min(leadsPerHour * 10, 25)

    // Calculate follow-up effectiveness and penalties (25 points max)
    const followUps = activities.filter(a => a.action === 'followUp')
    const completedFollowUps = followUps.filter(a => a.status === 'completed')
    const missedFollowUps = followUps.filter(a => a.status === 'missed')
    const followUpRate = followUps.length ? (completedFollowUps.length / followUps.length) : 0
    const followUpScore = Math.max(
      (followUpRate * 25) - (missedFollowUps.length * 5), // -5 points per missed follow-up
      0
    )

    // Calculate activity consistency and inactivity penalties (20 points max)
    const activeHours = timeSpread
    let consistencyScore = Math.min((activeHours / 8) * 20, 20)

    // Calculate inactivity penalties
    const inactivePeriods = []
    let currentInactivePeriod = null

    // Check for 30+ minute gaps in activity
    activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    for (let i = 1; i < activities.length; i++) {
      const gap = new Date(activities[i].timestamp) - new Date(activities[i - 1].timestamp)
      const gapMinutes = gap / (1000 * 60)

      if (gapMinutes >= 30) {
        inactivePeriods.push({
          duration: gapMinutes,
          penalty: Math.min(Math.floor(gapMinutes / 30) * 2, 5) // -2 points per 30 mins, max -5 per gap
        })
      }
    }

    // Apply inactivity penalties
    const totalInactivityPenalty = Math.min(
      inactivePeriods.reduce((sum, period) => sum + period.penalty, 0),
      10 // Cap total inactivity penalty at 10 points
    )
    consistencyScore = Math.max(consistencyScore - totalInactivityPenalty, 0)

    // Calculate activity diversity (15 points max)
    const diversityScore = Math.min((uniqueTypes / 5) * 15, 15)

    // Calculate activity volume with time distribution (15 points max)
    const volumeScore = Math.min((totalActivities / 30) * 15, 15)

    // Additional penalties for poor distribution
    const hourlyDistribution = patterns.hourlyDistribution
    const maxActivitiesPerHour = Math.max(...hourlyDistribution)
    const distributionPenalty = maxActivitiesPerHour > 10 ?
      Math.min((maxActivitiesPerHour - 10) * 2, 5) : 0 // Penalty for cramming too many activities in one hour

    // Combine all scores and penalties
    const totalScore = Math.round(
      leadEngagementScore +    // 25 points max
      followUpScore +         // 25 points max (with missed follow-up penalties)
      consistencyScore +      // 20 points max (with inactivity penalties)
      diversityScore +        // 15 points max
      volumeScore -          // 15 points max
      distributionPenalty    // Up to -5 points for poor distribution
    )

    return Math.min(Math.max(totalScore, 0), 100) // Ensure score is between 0 and 100
  }

  const { peakHours, mostProductiveBlock } = getDailyPatterns()
  const activityTrends = getActivityTrends()
  const productivityScore = getProductivityScore()

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Activity Analysis
      </Typography>

      <Grid container spacing={3}>
        {/* Productivity Score */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Productivity Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={productivityScore}
                    size={80}
                    thickness={4}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6">{productivityScore}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Peak Hours */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Peak Activity Hours
              </Typography>
              {peakHours.map((peak, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: index === 0 ? 'primary.main' : 'primary.light',
                      mr: 1
                    }}
                  />
                  <Typography variant="body2">
                    {`${peak.hour}:00 - ${peak.hour + 1}:00`}
                    <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                      ({peak.count} activities)
                    </Typography>
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Trends */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Activity Trends
              </Typography>
              {activityTrends.map(({ type, trend }) => (
                <Box key={type} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {type.replace(/_/g, ' ')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <i
                      className={trend > 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'}
                      style={{
                        color: trend > 0 ? 'green' : 'red',
                        marginRight: '4px'
                      }}
                    />
                    <Typography
                      variant="body2"
                      color={trend > 0 ? 'success.main' : 'error.main'}
                    >
                      {Math.abs(trend).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Patterns */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Activity Insights
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Most Productive Time Block
                    </Typography>
                    <Typography variant="body1">
                      {`${mostProductiveBlock.hour}:00 - ${mostProductiveBlock.hour + 1}:00`}
                      <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                        ({mostProductiveBlock.count} activities)
                      </Typography>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Activity Distribution
                    </Typography>
                    <Typography variant="body1">
                      {`${new Set(activities.map(a => a.action)).size} different types of activities`}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Consistency Score
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((activities.length / 50) * 100, 100)}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

const ActivityDashboard = ({ kpiData: initialKpiData }) => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [kpiData, setKpiData] = useState(initialKpiData)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const fetchDateData = useCallback(async (date) => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const formattedDate = date.toISOString().split('T')[0]
      const response = await api.get('/api/leadactivity/get/activityKPI', {
        params: {
          userId: session.user.id,
          startDate: formattedDate,
          endDate: formattedDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })

      const dailyActivity = response.data?.dailyActivities?.[0]
      const userData = dailyActivity?.users?.[0]

      if (userData?.summary) {
        setKpiData({
          timeline: response.data.timeline || [],
          firstActivity: response.data.firstActivity,
          lastActivity: response.data.lastActivity,
          activeHours: response.data.activeHours,
          historical: response.data.historical,
          ...userData.summary
        })
      }
      // else {
      //   throw new Error('Invalid data structure')
      // }
    } catch (error) {
      console.error('Failed to fetch KPI data:', error)
      // Set default state on error
      setKpiData({
        timeline: [],
        firstActivity: date,
        lastActivity: date,
        activeHours: 0,
        historical: {},
        totalActivities: 0,
        leadsInteracted: 0,
        actionBreakdown: {}
      })
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  // Fetch data when date or session changes
  useEffect(() => {
    fetchDateData(selectedDate)
  }, [selectedDate, fetchDateData])

  const handleDateChange = useCallback((newDate) => {
    setSelectedDate(newDate)
  }, [])

  // Memoize components to prevent unnecessary rerenders
  const dateSelector = useMemo(() => (
    <ActivityDateSelector
      selectedDate={selectedDate}
      onDateChange={handleDateChange}
    />
  ), [selectedDate, handleDateChange])

  const headerChips = useMemo(() => (
    <Box sx={{ mt: 1 }}>
      <Chip
        icon={<i className="ri-time-line" style={{ fontSize: '16px' }} />}
        label={`First Activity: ${formatTime(kpiData.firstActivity)}`}
        sx={{ mr: 1 }}
      />
      <Chip
        icon={<i className="ri-time-line" style={{ fontSize: '16px' }} />}
        label={`Last Activity: ${formatTime(kpiData.lastActivity)}`}
        sx={{ mr: 1 }}
      />
      <Chip
        icon={<i className="ri-time-line" style={{ fontSize: '16px' }} />}
        label={`Active Hours: ${Number(kpiData.activeHours).toFixed(1)}`}
      />
    </Box>
  ), [kpiData.firstActivity, kpiData.lastActivity, kpiData.activeHours])

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (!kpiData.timeline?.length) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No activities found for this date
          </Typography>
        </Box>
      )
    }

    return (
      <>
        <ActivityBarGraph activities={kpiData.timeline} />
        <ActivityStats activities={kpiData.timeline} />
        <ActivityAnalysis
          activities={kpiData.timeline}
          historicalData={kpiData.historical}
        />
        {/* <Box sx={{ mt: 4 }}>
          <Timeline>
            {kpiData.timeline.map((activity, index) => (
              <TimelineActivity
                key={`${activity.timestamp}-${index}`}
                activity={activity}
              />
            ))}
          </Timeline>
        </Box> */}
      </>
    )
  }, [isLoading, kpiData])

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Activity Timeline</Typography>
            {dateSelector}
          </Box>
        }
        subheader={headerChips}
      />
      <Divider />
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}

// Helper function to check if a date is today
const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

// Helper function to format time
const formatTime = (timestamp) => {
  if (!timestamp) return '--:--'
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Enhanced UI Components
const UserInfoHeader = ({ userInfo }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
    <Avatar
      sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}
    >
      <i className="ri-user-line" style={{ fontSize: '32px' }} />
    </Avatar>
    <Box>
      <Typography variant="h5">{userInfo.name}</Typography>
      <Typography variant="body2" color="textSecondary">{userInfo.email}</Typography>
    </Box>
  </Box>
)

const MetricCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={icon} style={{ fontSize: '24px', color: `var(--mui-color-${color}-main)` }} />
      </Box>
      <Box>
        <Typography variant="h6" component="div">
          {value}
        </Typography>
        <Typography color="textSecondary" variant="body2">
          {title}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

const TimelineActivity = ({ activity }) => {
  const activityIcon = ACTIVITY_ICONS[activity.action] || 'ri-notification-line'

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot color={ACTIVITY_COLORS[activity.action] || ACTIVITY_COLORS.default}>
          <i className={activityIcon} style={{ fontSize: '16px' }} />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent>
        <Box sx={{
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          boxShadow: 1,
          '&:hover': { boxShadow: 2 }
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {activity.action.charAt(0).toUpperCase() + activity.action.slice(1).replace(/_/g, ' ')}
            </Typography>
            <Tooltip title={new Date(activity.timestamp).toLocaleString()}>
              <Typography variant="caption" color="textSecondary">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </Typography>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.875rem' }}>
              {activity.lead?.name?.charAt(0) || '?'}
            </Avatar>
            <Typography variant="body2">
              {activity.lead?.name || 'Unknown Lead'}
            </Typography>
            <Chip
              icon={<i className="ri-flag-line" style={{ fontSize: '16px' }} />}
              size="small"
              label={activity.lead?.status || 'Unknown'}
              color={STATUS_COLORS[activity.lead?.status] || STATUS_COLORS.default}
              sx={{ ml: 1 }}
            />
          </Box>

          {activity.details && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                mt: 1,
                bgcolor: 'grey.50',
                p: 1,
                borderRadius: 1,
                borderLeft: 3,
                borderColor: 'primary.main'
              }}
            >
              <i className="ri-double-quotes-l" style={{ marginRight: '4px' }} />
              {activity.details}
              <i className="ri-double-quotes-r" style={{ marginLeft: '4px' }} />
            </Typography>
          )}
        </Box>
      </TimelineContent>
    </TimelineItem>
  )
}

// Enhanced skeleton loader
const DashboardSkeleton = () => (
  <Box sx={{ p: 3 }}>
    <Skeleton variant="rectangular" height={80} sx={{ mb: 4, borderRadius: 1 }} />
    <Grid container spacing={3}>
      {[1, 2, 3, 4].map(i => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 1 }} />
      </Grid>
    </Grid>
  </Box>
)

const CROWN_ICONS = [
  { icon: '🥇', color: '#FFD700', label: 'Gold' },
  { icon: '🥈', color: '#C0C0C0', label: 'Silver' },
  { icon: '🥉', color: '#CD7F32', label: 'Bronze' }
]

const LeaderboardTable = ({ rankings }) => {
  const [expanded, setExpanded] = useState(null)

  const pointsInfo = [
    { action: 'Activity/Interaction', points: '+1 point' },
    { action: 'Unique Lead Contact', points: '+2 points' },
    { action: 'Follow-up Completion Rate', points: '+0.5 points per %' },
    { action: 'Missed Follow-up', points: '-2 points' },
    { action: 'Lead Interested', points: '+5 points' },
    { action: 'Lead Conversion', points: '+25 points' },
  ]

  // Calculate weighted points and sort users
  const users = [...rankings.byTotalInteractions]
    .map(user => ({
      ...user,
      weightedPoints: Math.round(
        (user.metrics.totalInteractions * 1) +         // Base weight for interactions
        (user.metrics.uniqueLeads * 2) +               // Higher weight for unique leads
        (user.metrics.followUpCompletionRate * 0.5) -  // Weight for follow-up completion
        ((user.metrics.followUps?.missed || 0) * 2) +  // Penalty for missed follow-ups
        ((user.metrics.statusChanges?.Interested || 0) * 5) +  // Bonus for Interested status
        ((user.metrics.conversions || 0) * 25)         // Bonus for conversions
      )
    }))
    .sort((a, b) => b.weightedPoints - a.weightedPoints)
    .slice(0, 5) // Only take top 5

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Rank</TableCell>
            <TableCell>Name</TableCell>
            <TableCell
              align="center"
              sx={{
                bgcolor: '#d3b81e',
                color: 'white',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                Points
                <Tooltip title={
                  <Box sx={{ p: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Points System:</Typography>
                    <Table size="small">
                      <TableBody>
                        {pointsInfo.map((info, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ border: 'none', color: 'white', py: 0.5 }}>
                              {info.action}
                            </TableCell>
                            <TableCell sx={{ border: 'none', color: 'white', py: 0.5 }}>
                              {info.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                }>
                  <IconButton size="small" sx={{ ml: 1, color: 'white' }}>
                    <i className="ri-information-line" style={{ fontSize: '16px' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell align="center">Total Activities</TableCell>
            <TableCell align="center">Unique Leads</TableCell>
            <TableCell align="center">Follow-up %</TableCell>
            <TableCell align="center">Missed F/U</TableCell>
            <TableCell align="center">Breakdown</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((entry, idx) => (
            <React.Fragment key={entry.user.id}>
              <TableRow
                sx={{
                  bgcolor: idx === 0 ? '#fffbe6' : idx === 1 ? '#f5f5f5' : idx === 2 ? '#fdf6f0' : undefined
                }}
              >
                <TableCell align="center">
                  {idx < 3 ? (
                    <Tooltip title={CROWN_ICONS[idx].label}>
                      <span style={{ fontSize: 24, color: CROWN_ICONS[idx].color }}>
                        {CROWN_ICONS[idx].icon}
                      </span>
                    </Tooltip>
                  ) : (
                    idx + 1
                  )}
                </TableCell>
                <TableCell>{entry.user.name}</TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: '#e6e6e667',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                >
                  <Typography variant="body1" fontWeight="bold">
                    {entry.weightedPoints}
                  </Typography>
                </TableCell>
                <TableCell align="center">{entry.metrics.totalInteractions}</TableCell>
                <TableCell align="center">{entry.metrics.uniqueLeads}</TableCell>
                <TableCell align="center">
                  {Math.round(entry.metrics.followUpCompletionRate)}%
                </TableCell>
                <TableCell align="center">
                  {entry.metrics.followUps?.missed || 0}
                  {entry.metrics.followUps?.missed > 0 && (
                    <Chip size="small" color="error" label="Missed" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => setExpanded(expanded === entry.user.id ? null : entry.user.id)}
                  >
                    <i className={expanded === entry.user.id ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                  <Collapse in={expanded === entry.user.id} timeout="auto" unmountOnExit>
                    <Box sx={{ m: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Action Breakdown</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {Object.entries(entry.metrics.actionBreakdown).map(([action, count]) => (
                          <Chip key={action} label={`${action}: ${count}`} />
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const Leaderboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dateRange, setDateRange] = useState('daily') // 'daily', 'weekly', 'monthly'
  const [leaderboardData, setLeaderboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  const getDateRange = useCallback((date, range) => {
    const start = new Date(date)
    const end = new Date(date)

    switch (range) {
      case 'weekly':
        // Set to start of week (Sunday)
        start.setDate(start.getDate() - start.getDay())
        // Set to end of week (Saturday)
        end.setDate(end.getDate() + (6 - end.getDay()))
        break
      case 'monthly':
        // Set to start of month
        start.setDate(1)
        // Set to end of month
        end.setMonth(end.getMonth() + 1)
        end.setDate(0)
        break
      default: // daily
        // No changes needed for daily view
        break
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  }, [])

  const fetchLeaderboardData = useCallback(async (date, range) => {
    if (!session?.user?.id) return

    setIsLoading(true)
    try {
      const { startDate, endDate } = getDateRange(date, range)
      const response = await api.get('/api/leadactivity/get/leaderboard', {
        params: {
          startDate,
          endDate
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setLeaderboardData(response.data)
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id, getDateRange])

  useEffect(() => {
    fetchLeaderboardData(selectedDate, dateRange)
  }, [selectedDate, dateRange, fetchLeaderboardData])

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
  }

  if (isLoading) {
    return <CircularProgress />
  }

  if (!leaderboardData) {
    return null
  }

  const { rankings, teamTotals } = leaderboardData

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Team Performance
        </Typography>

        {/* Date Range Selector */}
        <ToggleButtonGroup
          value={dateRange}
          exclusive
          onChange={(e, newRange) => newRange && handleDateRangeChange(newRange)}
          size="small"
        >
          <ToggleButton value="daily">
            <i className="ri-calendar-line" style={{ marginRight: '8px' }} />
            Daily
          </ToggleButton>
          <ToggleButton value="weekly">
            <i className="ri-calendar-week-line" style={{ marginRight: '8px' }} />
            Weekly
          </ToggleButton>
          <ToggleButton value="monthly">
            <i className="ri-calendar-month-line" style={{ marginRight: '8px' }} />
            Monthly
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Team Summary */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {teamTotals?.totalInteractions}
              </Typography>
              <Typography color="text.secondary">
                Total Team Interactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {teamTotals.uniqueLeads}
              </Typography>
              <Typography color="text.secondary">
                Unique Leads Contacted
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {(teamTotals.totalInteractions / (teamTotals.uniqueLeads || 1)).toFixed(1)}
              </Typography>
              <Typography color="text.secondary">
                Avg. Interactions per Lead
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {teamTotals.convertedLeads}
              </Typography>
              <Typography color="text.secondary">
                Total Conversions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Consolidated Leaderboard */}
      <LeaderboardTable rankings={rankings} />
    </Box>
  )
}

const FollowUpStats = ({ stats }) => {
  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <i className="ri-calendar-check-line" style={{ fontSize: '24px', color: 'var(--mui-color-info-main)' }} />
            <Typography variant="h6">Follow-up Overview</Typography>
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <CircularProgress
                variant="determinate"
                value={(stats.todayCompleted / stats.todayTotal) * 100}
                size={80}
                thickness={4}
                sx={{ color: 'success.main' }}
              />
              <Typography variant="h6" sx={{ mt: 2 }}>
                {stats.todayCompleted}/{stats.todayTotal}
              </Typography>
              <Typography color="text.secondary">
                Today's Progress
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={8}>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <i className="ri-time-line" style={{ fontSize: '20px', color: 'var(--mui-color-warning-main)' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Pending Today</Typography>
                      <Chip
                        label={stats.todayPending}
                        color="warning"
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <i className="ri-check-double-line" style={{ fontSize: '20px', color: 'var(--mui-color-success-main)' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Completed Today</Typography>
                      <Chip
                        label={stats.todayCompleted}
                        color="success"
                        size="small"
                      />
                    </Box>
                  }
                />
              </ListItem>

              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <i className="ri-error-warning-line" style={{ fontSize: '20px', color: 'var(--mui-color-error-main)' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography>Missed Follow-ups</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={`Today: ${stats.todayMissed}`}
                          color="error"
                          size="small"
                        />
                        <Chip
                          label={`Total: ${stats.totalMissed}`}
                          color="error"
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<i className="ri-calendar-line" />}
            size="small"
          >
            View Schedule
          </Button>
          <Button
            variant="outlined"
            startIcon={<i className="ri-notification-line" />}
            size="small"
            color="warning"
          >
            Pending ({stats.todayPending})
          </Button>
          <Button
            variant="outlined"
            startIcon={<i className="ri-error-warning-line" />}
            size="small"
            color="error"
          >
            Missed ({stats.totalMissed})
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

const LeadAnalytics = ({ leadData }) => {
  const [upcomingTasks, setUpcomingTasks] = useState({ missed: [], upcoming: [] })
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)
  const { data: session } = useSession()

  // Fetch upcoming tasks
  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      if (!session?.user?.id) return

      setIsLoadingTasks(true)
      try {
        const response = await api.get('/api/followups/stats/get/recentandupcoming', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
        setUpcomingTasks(response.data)
      } catch (error) {
        console.error('Failed to fetch upcoming tasks:', error)
      } finally {
        setIsLoadingTasks(false)
      }
    }

    fetchUpcomingTasks()
  }, [session?.user?.id])

  // Format date/time helper
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Calculate trend percentages
  const calculateTrend = (current, previous) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  // Process daily lead counts for trend
  const sortedDates = Object.entries(leadData.dailyLeadCounts)
    .sort(([a], [b]) => new Date(a) - new Date(b))

  const currentLeads = sortedDates[sortedDates.length - 1]?.[1] || 0
  const previousLeads = sortedDates[sortedDates.length - 2]?.[1] || 0
  const leadTrend = calculateTrend(currentLeads, previousLeads)

  // Calculate engagement rate
  const engagementRate = ((leadData.totalLeads - leadData.untouchedLeads) / leadData.totalLeads) * 100

  // Combine and sort all tasks
  const allTasks = useMemo(() => {
    const combined = [
      ...upcomingTasks.missed.map(task => ({ ...task, type: 'missed' })),
      ...upcomingTasks.upcoming.map(task => ({ ...task, type: 'upcoming' }))
    ]

    return combined.sort((a, b) => {
      const dateA = new Date(a.type === 'missed' ? a.followUpDate : a.nextFollowUpDate)
      const dateB = new Date(b.type === 'missed' ? b.followUpDate : b.nextFollowUpDate)
      return dateA - dateB
    })
  }, [upcomingTasks])

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>Lead Analytics</Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary" variant="subtitle2">
                  Total Leads
                </Typography>
                <Chip
                  size="small"
                  label={`${leadTrend > 0 ? '+' : ''}${leadTrend.toFixed(1)}%`}
                  color={leadTrend > 0 ? 'success' : 'error'}
                />
              </Box>
              <Typography variant="h4">{leadData.totalLeads}</Typography>
              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Contacted
              </Typography>
              <Typography variant="h4">
                {leadData.byStatus.contacted}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={engagementRate}
                color="success"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Interested Leads
              </Typography>
              <Typography variant="h4">
                {leadData.byStatus.interested}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(leadData.byStatus.interested / leadData.totalLeads) * 100}
                color="warning"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" variant="subtitle2" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h4">
                {leadData.conversionRate.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={leadData.conversionRate}
                color="info"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Distribution */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="ri-list-check-2" style={{ fontSize: '24px', color: 'primary.main' }} />
                  <Typography variant="h6">Follow-up Statistics</Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                {/* Left Column */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      My Follow-ups
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'primary.lighter',
                        border: 1,
                        borderColor: 'primary.light'
                      }}>
                        <Typography variant="h4" color="primary.main">
                          {upcomingTasks?.counts?.assignedToMe}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Escalated to Me
                        </Typography>
                      </Box>
                      <Box sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'info.lighter',
                        border: 1,
                        borderColor: 'info.light'
                      }}>
                        <Typography variant="h4" color="info.main">
                          {upcomingTasks?.counts?.createdByMeForOthers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Created for Others
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                {/* Right Column */}
                <Grid item xs={12} md={6} >
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Timeline
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'warning.lighter',
                        border: 1,
                        borderColor: 'warning.light'
                      }}>
                        <Typography variant="h4" color="warning.main">    {upcomingTasks?.counts?.today}
                        </Typography>


                        <Typography variant="body2" color="text.secondary">
                          Due Today
                        </Typography>
                      </Box>
                      <Box sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'success.lighter',
                        border: 1,
                        borderColor: 'success.light'
                      }}>
                        <Typography variant="h4" color="success.main">
                          {upcomingTasks?.counts?.upcoming}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upcoming
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Grid>

                {/* Total Pending Banner */}
                <Grid item xs={12}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'error.lighter',
                    border: 1,
                    borderColor: 'error.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="h4" color="error.main">
                        {upcomingTasks?.counts?.totalPending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Pending Follow-ups
                      </Typography>
                    </Box>
                    <i className="ri-error-warning-line" style={{ fontSize: '32px', color: 'var(--mui-color-error-main)' }} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <br />  <Card>
            <CardHeader
              title="Top Lead Tags"
              subheader="Most common lead categories"
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(leadData.byTags)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([tag, count]) => (
                    <Chip
                      key={tag}
                      label={`${tag} (${count})`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))
                }
              </Box>
            </CardContent>
          </Card>

        </Grid>

        {/* Lead Acquisition Timeline */}
        {/* <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Lead Acquisition Timeline"
              subheader="Daily lead count trends"
            />
            <CardContent>
              <Box sx={{ height: 300, p: 2 }}>
                {Object.entries(leadData.dailyLeadCounts)
                  .sort(([a], [b]) => new Date(a) - new Date(b))
                  .map(([date, count], index) => (
                    <Box key={date} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ width: 100 }}>
                        {new Date(date).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(count / Math.max(...Object.values(leadData.dailyLeadCounts))) * 100}
                          sx={{ height: 20, borderRadius: 2 }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ ml: 2, width: 50 }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </CardContent>
          </Card>
        </Grid> */}
        <Grid item xs={12} md={6} sx={{ mb: 5 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="ri-calendar-todo-line" style={{ fontSize: '1.5rem', color: 'var(--mui-color-primary-main)' }} />
                  <Typography variant="h6">Follow-up Tasks</Typography>
                </Box>
              }
              action={
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Missed follow-ups require immediate attention">
                    <Chip
                      icon={<i className="ri-error-warning-line" />}
                      label={`Missed: ${upcomingTasks.missed.length}`}
                      color="error"
                      size="small"
                      sx={{
                        '& .MuiChip-icon': { fontSize: '1rem' },
                        fontWeight: 500
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Upcoming follow-ups scheduled">
                    <Chip
                      icon={<i className="ri-calendar-check-line" />}
                      label={`Upcoming: ${upcomingTasks.upcoming.length}`}
                      color="primary"
                      size="small"
                      sx={{
                        '& .MuiChip-icon': { fontSize: '1rem' },
                        fontWeight: 500
                      }}
                    />
                  </Tooltip>
                </Stack>
              }
            />
            <Divider />
            <CardContent sx={{ p: 0 }}>
              {isLoadingTasks ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <List sx={{
                  maxHeight: "520px",
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                  }
                }}>
                  <VirtualizedList
                    items={allTasks}
                    itemHeight={'100'}
                    renderItem={(task) => {
                      const isMissed = task.type === 'missed'
                      const taskDate = isMissed ? task.followUpDate : task.nextFollowUpDate
                      const isToday = new Date(taskDate).toDateString() === new Date().toDateString()

                      const getStatusColor = () => {
                        if (isMissed) return 'error'
                        if (isToday) return 'warning'
                        return 'primary'
                      }

                      const statusColor = getStatusColor()

                      return (
                        <ListItem
                          key={task._id}
                          sx={{
                            p: 3,
                            // bgcolor: (theme) => alpha(
                            //   theme.palette[statusColor].main,
                            //   0.05
                            // ),
                            borderLeft: 2,

                            borderColor: `${statusColor}.main`,
                            mb: 2,
                            mx: 5,
                            width: '95%',
                            borderRadius: 1,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: (theme) => alpha(
                                theme.palette[statusColor].main,
                                0.1
                              ),
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{
                                color: 'white',
                                width: 32,
                                height: 32,
                                bgcolor: `${statusColor}.main`,
                                fontSize: '0.875rem'
                              }}
                            >
                              {task.leadId.name.charAt(0)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {task.leadId.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={task.leadId.status}
                                  color={task.leadId.status === 'Contacted' ? 'primary' : 'default'}
                                  sx={{ height: 20 }}
                                />
                                {task.leadId.phone && (
                                  <Tooltip title="Click to call">
                                    <Chip
                                      size="small"
                                      icon={<i className="ri-phone-line" />}
                                      label={task.leadId.phone}
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                      }}
                                      onClick={() => window.open(`tel:${task.leadId.phone}`)}
                                    />
                                  </Tooltip>
                                )}
                                <Tooltip title={new Date(taskDate).toLocaleString()}>
                                  <Chip
                                    size="small"
                                    icon={<i className="ri-time-line" />}
                                    label={formatDateTime(taskDate)}
                                    color={statusColor}
                                    variant="outlined"
                                    sx={{ height: 20 }}
                                  />
                                </Tooltip>
                              </Stack>
                            }
                            secondary={
                              task.notes && (
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    mt: 1,
                                    p: 1,
                                    // bgcolor: 'background.default',
                                    // borderColor: `${statusColor}.light`
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {task.notes}
                                  </Typography>
                                </Paper>
                              )
                            }
                          />
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Call lead">
                              <IconButton
                                size="small"
                                color={statusColor}
                                sx={{
                                  bgcolor: 'background.paper',
                                  boxShadow: 1,
                                  '&:hover': { transform: 'scale(1.1)' }
                                }}
                                onClick={() => window.open(`tel:${task.leadId.phone}`)}
                              >
                                <i className="ri-phone-line" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reschedule">
                              <IconButton
                                size="small"
                                color={statusColor}
                                sx={{
                                  bgcolor: 'background.paper',
                                  boxShadow: 1,
                                  '&:hover': { transform: 'scale(1.1)' }
                                }}
                              >
                                <i className="ri-calendar-event-line" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </ListItem>
                      )
                    }}
                  />
                  {allTasks.length === 0 && (
                    <Box sx={{
                      textAlign: 'center',
                      py: 4,
                      color: 'text.secondary'
                    }}>
                      <i className="ri-calendar-check-line" style={{ fontSize: '2rem', marginBottom: '8px' }} />
                      <Typography variant="body2">
                        No follow-up tasks scheduled
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Add Upcoming Tasks Section */}


    </Box>
  )
}

// Add new performance analysis component
const AdvancedPerformanceAnalysis = ({ activities = [], historicalData = {}, leadStats = {} }) => {
  // Memoize processed activities with batching
  const processedActivities = useMemo(() => {
    return performanceUtils.processBatch(activities, activity => ({
      ...activity,
      timestamp: new Date(activity.timestamp),
      hourOfDay: new Date(activity.timestamp).getHours(),
      responseTime: utils.calculateResponseTime(activity),
      weight: PERFORMANCE_METRICS.activityWeights[activity.action] || 1
    })).sort((a, b) => a.timestamp - b.timestamp)
  }, [activities])

  // Memoize metrics calculation
  const metrics = useMemo(() => {
    return utils.calculateMetricsBatch(processedActivities)
  }, [processedActivities])

  // Memoize lead interactions
  const leadInteractions = useMemo(() => {
    return utils.calculateLeadInteractionsBatch(processedActivities)
  }, [processedActivities])

  // Memoize performance scores
  const performanceScore = useMemo(() => {
    if (!processedActivities.length) {
      return {
        totalScore: 0,
        qualityScore: 0,
        efficiencyScore: 0,
        consistencyScore: 0,
        detailedMetrics: {
          responseTimeAvg: 0,
          followUpCompletion: 0,
          activityDensity: 0,
          leadEngagement: 0
        }
      }
    }

    const avgResponseTime = metrics.responseTimeCount ?
      metrics.totalResponseTime / metrics.responseTimeCount : 0

    const followUpCompletionRate = metrics.followUps ?
      (metrics.completedFollowUps / metrics.followUps) * 100 : 0

    const activityDensity = utils.calculateActivityDensity(processedActivities)

    // Calculate time gaps efficiently
    const timeGaps = processedActivities.reduce((gaps, activity, index) => {
      if (index === 0) return gaps
      const gap = (activity.timestamp - processedActivities[index - 1].timestamp) / (1000 * 60)
      if (gap > PERFORMANCE_METRICS.consistencyMetrics.maxGapMinutes) {
        gaps.push(gap)
      }
      return gaps
    }, [])

    const qualityScore = utils.calculateQualityScore(
      avgResponseTime,
      followUpCompletionRate,
      leadInteractions
    )

    const efficiencyScore = utils.calculateEfficiencyScore(
      activityDensity,
      timeGaps
    )

    const consistencyScore = utils.calculateConsistencyScore(
      processedActivities,
      timeGaps
    )

    const baseScore = (qualityScore + efficiencyScore + consistencyScore) / 3

    return {
      totalScore: Math.round(baseScore),
      qualityScore,
      efficiencyScore,
      consistencyScore,
      detailedMetrics: {
        responseTimeAvg: avgResponseTime,
        followUpCompletion: followUpCompletionRate,
        activityDensity,
        leadEngagement: Object.keys(leadInteractions).length
      }
    }
  }, [processedActivities, metrics, leadInteractions])

  // Memoize historical comparison with debouncing
  const historicalComparison = useMemo(() => {
    return performanceUtils.memoize(
      `historical-${performanceScore.totalScore}-${historicalData?.averages?.totalScore}`,
      () => {
        if (!historicalData?.averages) return null

        return {
          totalScore: utils.calculatePercentageChange(
            performanceScore.totalScore,
            historicalData.averages.totalScore
          ),
          qualityScore: utils.calculatePercentageChange(
            performanceScore.qualityScore,
            historicalData.averages.qualityScore
          ),
          efficiencyScore: utils.calculatePercentageChange(
            performanceScore.efficiencyScore,
            historicalData.averages.efficiencyScore
          ),
          consistencyScore: utils.calculatePercentageChange(
            performanceScore.consistencyScore,
            historicalData.averages.consistencyScore
          )
        }
      }
    )
  }, [performanceScore, historicalData])

  // Optimize rendering with virtualization for large datasets
  const renderMetrics = useCallback(() => {
    return Object.entries(performanceScore)
      .filter(([key]) => key !== 'detailedMetrics')
      .map(([metric, score]) => (
        <Box key={metric} sx={{ mb: 2 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="body2">
              {utils.formatMetricName(metric)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {score}
              </Typography>
              {historicalComparison?.[metric] && (
                <Chip
                  label={`${historicalComparison[metric]}%`}
                  size="small"
                  color={historicalComparison[metric] >= 0 ? "success" : "error"}
                  sx={{ height: 20 }}
                />
              )}
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={score}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: 'grey.100',
              '& .MuiLinearProgress-bar': {
                bgcolor: utils.getScoreColor(score),
                borderRadius: 4
              }
            }}
          />
        </Box>
      ))
  }, [performanceScore, historicalComparison])

  return (
    <Card sx={{ mt: 4 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Advanced Performance Analytics</Typography>
            <Tooltip title="Performance score based on activity quality, efficiency, and consistency">
              <IconButton size="small">
                <i className="ri-information-line" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Main Score Display */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              textAlign: 'center',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <CircularProgress
                variant="determinate"
                value={performanceScore.totalScore}
                size={160}
                thickness={8}
                sx={{
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                  color: utils.getScoreColor(performanceScore.totalScore)
                }}
              />
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <Typography variant="h4">
                  {performanceScore.totalScore}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Overall Score
                </Typography>
              </Box>
              {historicalComparison && (
                <Chip
                  icon={
                    <i className={
                      historicalComparison.totalScore >= 0
                        ? "ri-arrow-up-line"
                        : "ri-arrow-down-line"
                    } />
                  }
                  label={`${Math.abs(historicalComparison.totalScore)}% vs avg`}
                  color={historicalComparison.totalScore >= 0 ? "success" : "error"}
                  size="small"
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          </Grid>

          {/* Detailed Metrics */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              {renderMetrics()}
            </Box>
          </Grid>

          {/* Detailed Metrics Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {Object.entries(performanceScore.detailedMetrics).map(([metric, value]) => (
                <Grid item xs={12} sm={6} md={3} key={metric}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        {utils.formatMetricName(metric)}
                      </Typography>
                      <Typography variant="h6">
                        {utils.formatMetricValue(metric, value)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// Add new predictive analytics component
const PredictiveAnalytics = ({ historicalData }) => {
  // Calculate performance predictions
  const predictions = useMemo(() => {
    // Implement your prediction logic here
    return {
      expectedActivities: 0,
      projectedScore: 0,
      recommendations: []
    }
  }, [historicalData])

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title="Performance Predictions"
        subheader="AI-powered insights and recommendations"
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Expected Performance
            </Typography>
            {/* Add prediction visualizations */}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Recommendations
            </Typography>
            <List>
              {predictions.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <i className="ri-lightbulb-line" />
                  </ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// Add lead status constants
const LEAD_STATUS_COLORS = {
  New: 'info.main',
  Contacted: 'primary.main',
  Interested: 'success.main',
  'Not Interested': 'error.main',
  Converted: 'secondary.main',
  Lost: 'error.light',
  Won: 'success.dark'
}

const LEAD_STATUS_ICONS = {
  New: 'ri-user-add-line',
  Contacted: 'ri-phone-line',
  Interested: 'ri-thumb-up-line',
  'Not Interested': 'ri-thumb-down-line',
  Converted: 'ri-exchange-line',
  Lost: 'ri-close-circle-line',
  Won: 'ri-trophy-line'
}

// Add LeadStatusAnalytics component
const LeadStatusAnalytics = ({ leadStats }) => {
  // Directly use the todayStatusChanges from props
  const todayStatusChanges = leadStats?.todayStatusChanges || {
    total: 0,
    byStatus: {}
  }

  // Calculate percentages with null checks
  const percentages = useMemo(() => {
    const total = todayStatusChanges?.total || 0
    if (total === 0) return {}

    return Object.entries(todayStatusChanges?.byStatus || {}).reduce((acc, [status, count]) => ({
      ...acc,
      [status]: Math.round((count / total) * 100)
    }), {})
  }, [todayStatusChanges])

  // Calculate positive outcome rate with null checks
  const positiveOutcomeRate = useMemo(() => {
    if (!todayStatusChanges?.total) return 0

    const positiveStatuses = ['Interested', 'Won', 'Converted']
    const positiveCount = Object.entries(todayStatusChanges?.byStatus || {})
      .reduce((sum, [status, count]) =>
        positiveStatuses.includes(status) ? sum + count : sum,
        0
      )
    return Math.round((positiveCount / todayStatusChanges.total) * 100)
  }, [todayStatusChanges])

  // Get actual status data
  const statusData = useMemo(() => {
    if (!todayStatusChanges?.byStatus) return []

    return Object.entries(todayStatusChanges.byStatus)
      .map(([status, count]) => ({
        status,
        count,
        percentage: percentages[status] || 0,
        color: LEAD_STATUS_COLORS[status] || 'grey.main',
        icon: LEAD_STATUS_ICONS[status] || 'ri-question-line'
      }))
      .sort((a, b) => b.count - a.count) // Sort by count in descending order
  }, [todayStatusChanges, percentages])

  // Update the condition to check the actual data structure
  if (!todayStatusChanges?.byStatus || Object.keys(todayStatusChanges.byStatus).length === 0) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" align="center">
            No lead status data available for today
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ mt: 3, mb: 5 }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Lead Status Distribution</Typography>
            <Chip
              label={`${positiveOutcomeRate}% Positive Outcomes`}
              color={positiveOutcomeRate >= 50 ? "success" : "warning"}
              size="small"
            />
          </Box>
        }
        subheader={`Total Status Changes Today: ${todayStatusChanges.total}`}
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Status Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 300, position: 'relative' }}>
              <DonutChart
                series={statusData.map(item => item.count)}
                labels={statusData.map(item => item.status)}
                colors={statusData.map(item => item.color)}
              />
            </Box>
          </Grid>

          {/* Status Breakdown List */}
          <Grid item xs={12} md={6}>
            <List>
              {statusData.map(({ status, count, percentage, color, icon }) => (
                <ListItem
                  key={status}
                  sx={{
                    borderLeft: 3,
                    borderColor: color,
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <ListItemIcon>
                    <i className={icon} style={{ fontSize: '1.5rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{status}</Typography>
                        <Chip
                          label={`${percentage}%`}
                          size="small"
                          sx={{ bgcolor: color, color: 'white' }}
                        />
                      </Box>
                    }
                    secondary={`${count} leads`}
                  />
                  <Box sx={{ minWidth: 100, textAlign: 'right' }}>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: color
                        }
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Status Change Trends */}
          <Grid item xs={12}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusData.map(({ status, count, percentage, color, icon }) => (
                    <TableRow key={status}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <i className={icon} />
                          {status}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">{percentage}%</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              width: 100,
                              height: 6,
                              borderRadius: 1,
                              bgcolor: 'grey.100',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: color
                              }
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

// Add this component for virtualized list rendering
const VirtualizedList = memo(({ items, itemHeight, renderItem }) => {
  const containerRef = useRef(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })

  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight

    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      Math.ceil((scrollTop + containerHeight) / itemHeight),
      items.length
    )

    setVisibleRange({ start: Math.max(0, start - 5), end: end + 5 })
  }, [itemHeight, items.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = debounce(updateVisibleRange, 100)
    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [updateVisibleRange])

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', overflowY: 'auto' }}
    >
      <div style={{ height: items.length * itemHeight }}>
        <div style={{
          position: 'relative',
          top: visibleRange.start * itemHeight
        }}>
          {items
            .slice(visibleRange.start, visibleRange.end)
            .map(renderItem)}
        </div>
      </div>
    </div>
  )
})

VirtualizedList.displayName = 'VirtualizedList'

export default function DashboardCRM() {
  const { data: session } = useSession()
  const [kpiData, setKpiData] = useState(initialKpiState)
  const [leadData, setLeadData] = useState({})
  const [followUpStats, setFollowUpStats] = useState({
    todayTotal: 0,
    todayPending: 0,
    todayCompleted: 0,
    todayMissed: 0,
    totalMissed: 0
  })

  // Fetch KPI data including follow-up stats
  const fetchKPIData = useCallback(async () => {
    if (!session?.user?.id) return

    try {
      const response = await api.get('/api/leadactivity/get/activityKPI', {
        params: {
          userId: session.user.id,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setLeadData(response.data?.leadStats || {
        totalLeads: 0,
        byStatus: {},
        byTags: {},
        conversionRate: 0,
        untouchedLeads: 0,
        resharedLeads: 0
      })
      const dailyActivity = response.data?.dailyActivities?.[0]
      const userData = dailyActivity?.users?.[0]

      // if (!userData?.summary) {
      //   throw new Error('Invalid data structure')
      // }

      setKpiData({
        ...userData?.summary,
        userInfo: userData?.userInfo,
        loading: false,
        error: null
      })

      // Set follow-up stats
      setFollowUpStats(response.data.followUpStats || {
        todayTotal: 0,
        todayPending: 0,
        todayCompleted: 0,
        todayMissed: 0,
        totalMissed: 0
      })

    } catch (error) {
      console.error('Failed to fetch KPI data:', error)
      setKpiData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load activity data'
      }))
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchKPIData()
  }, [fetchKPIData])

  // Memoized metrics calculations
  const activityMetrics = useMemo(() => [
    {
      title: 'Total Activities',
      value: kpiData.totalActivities || 0,
      icon: 'ri-bar-chart-line',
      color: 'primary'
    },
    {
      title: 'Active Hours',
      value: Number(kpiData.activeHours || 0).toFixed(1),
      icon: 'ri-time-line',
      color: 'success'
    },
    {
      title: 'Leads Interacted',
      value: kpiData.leadsInteracted || 0,
      icon: 'ri-team-line',
      color: 'info'
    },
    {
      title: 'Activities/Hour',
      value: kpiData.activeHours ?
        (Number(kpiData.totalActivities || 0) / Number(kpiData.activeHours)).toFixed(1) :
        '0',
      icon: 'ri-speed-line',
      color: 'warning'
    }
  ], [kpiData.totalActivities, kpiData.activeHours, kpiData.leadsInteracted])

  // Memoized chart data
  const chartData = useMemo(() => {
    return Object.entries(kpiData.actionBreakdown || {}).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      value: value || 0
    }))
  }, [kpiData.actionBreakdown])

  if (kpiData.loading) return <DashboardSkeleton />
  if (kpiData.error) return <Alert severity="error">{kpiData.error}</Alert>

  return (
    <Box sx={{ p: 3 }}>
      {kpiData.userInfo && <UserInfoHeader userInfo={kpiData.userInfo} />}

      <LeadAnalytics leadData={leadData} />
      <LeadStatusAnalytics leadStats={leadData} />
      <Grid container spacing={3}>
        {/* Activity Metrics */}
        {activityMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}

        {/* Follow-up Stats */}


        {/* Activity Timeline */}
        <Grid item xs={12}>
          <ActivityDashboard kpiData={kpiData} />
        </Grid>
      </Grid>

      {/* Add Leaderboard component */}
      <Leaderboard />

      {/* Add the LeadAnalytics component */}
      {/* <LeadAnalytics leadData={leadData} /> */}

      {/* Add new advanced analytics components */}
      <AdvancedPerformanceAnalysis
        activities={kpiData.timeline}
        historicalData={kpiData.historical}
        leadStats={kpiData}  // Pass kpiData directly
      />
      <PredictiveAnalytics historicalData={kpiData.historical} />

      {/* Add Lead Status Analytics */}

    </Box>
  )
}
