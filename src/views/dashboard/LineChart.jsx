'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

// Example steps data for a week (Sunday to Saturday)
const series = [{ data: [3200, 4800, 5000, 6700, 7200, 8500, 9000] }]

const LineChart = () => {
  const primaryColor = 'var(--mui-palette-primary-main)'

  const options = {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '14px'
      },
      y: {
        formatter: (val) => `${val} steps`
      }
    },
    grid: {
      strokeDashArray: 6,
      borderColor: 'var(--mui-palette-divider)',
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
      padding: { top: -10, left: -7, right: 5, bottom: 5 }
    },
    stroke: {
      width: 3,
      lineCap: 'round',
      curve: 'smooth'
    },
    colors: [primaryColor],
    markers: {
      size: 6,
      strokeWidth: 3,
      colors: ['#fff'],
      strokeColors: primaryColor,
      hover: { size: 8 }
    },
    xaxis: {
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      labels: { style: { colors: 'var(--mui-palette-text-secondary)' } },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: 'var(--mui-palette-text-secondary)' },
        formatter: (val) => (val >= 1000 ? `${val / 1000}k` : val)
      }
    }
  }

  // Calculate total steps for display
  const totalSteps = series[0].data.reduce((acc, val) => acc + val, 0)

  return (
    <Card>
      <CardContent className="text-center">
        <Typography variant='h4' gutterBottom>
          {totalSteps.toLocaleString()} steps
        </Typography>
        <AppReactApexCharts type='line' height={120} width='100%' options={options} series={series} />
        <Typography color='text.secondary' className='font-medium mt-2'>
          Weekly Step Count
        </Typography>
      </CardContent>
    </Card>
  )
}

export default LineChart
