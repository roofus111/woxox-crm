'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useMemo } from 'react'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const DonutChart = ({ series = [], labels = [], colors }) => {
  const theme = useTheme()

  // Calculate total only once
  const total = useMemo(() => series.reduce((sum, val) => sum + (val || 0), 0), [series])

  // Memoize options to prevent unnecessary re-renders
  const options = useMemo(() => ({
    legend: { show: false },
    stroke: { width: 5, colors: [theme.palette.background.paper] },
    grid: {
      padding: {
        top: 10,
        left: 0,
        right: 0,
        bottom: 13
      }
    },
    colors: colors || [
      theme.palette.primary.main,
      '#69A8F5',
      '#F59000',
      '#00F407',
      '#F53B00'
    ],
    labels,
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: val => `${val} Leads`,
        title: {
          formatter: seriesName => `${seriesName}:`
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: { show: false },
            total: {
              show: true,
              fontWeight: 600,
              fontSize: '1rem',
              color: theme.palette.text.secondary,
              formatter: () => `${total}`
            },
            value: {
              offsetY: 6,
              fontWeight: 600,
              fontSize: '0.9375rem',
              formatter: val => `${val}`,
              color: theme.palette.text.primary
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1309,
        options: {
          plotOptions: {
            pie: {
              offsetY: 20
            }
          }
        }
      },
      {
        breakpoint: 900,
        options: {
          plotOptions: {
            pie: {
              offsetY: 0
            }
          }
        }
      },
      {
        breakpoint: theme.breakpoints.values.sm,
        options: {
          chart: {
            height: 165
          }
        }
      }
    ]
  }), [colors, labels, theme, total])

  // Don't render if no data
  if (!series.length) {
    return (
      <Card className='bs-full'>
        <CardContent className='flex items-center justify-center min-h-[250px]'>
          <Typography color='text.secondary'>No data available</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bs-full'>
      <CardContent className='pbe-0'>
        <div className='flex flex-wrap items-center gap-1'>
          <Typography variant='h5'>Total: </Typography>
          <Typography color='success.main'>{total}</Typography>
        </div>
        <Typography variant='subtitle1' className='mbe-4'>Distribution</Typography>
        <AppReactApexCharts
          type='donut'
          height={127}
          width='100%'
          options={options}
          series={series}
        />
      </CardContent>
    </Card>
  )
}

export default DonutChart
