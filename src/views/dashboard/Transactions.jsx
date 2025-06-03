'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

// Components
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

const calculateHealthScore = data => {
  if (!data) return 0
  let score = 100

  const {
    steps,
    sleep,
    hydration,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    sugarLevel,
    heartRate,
    mood,
    stress,
    exercise,
    bodyWeight,
    height
  } = data

  if (steps < 5000) score -= 10
  if (sleep < 6 || sleep > 9) score -= 10
  if (hydration < 2) score -= 5
  if (bloodPressureSystolic > 130 || bloodPressureDiastolic > 85) score -= 10
  if (sugarLevel > 140) score -= 10
  if (heartRate < 60 || heartRate > 100) score -= 5
  if (mood < 5) score -= 5
  if (stress > 6) score -= 5
  if (exercise < 0.5) score -= 10

  const heightInMeters = height / 100
  const bmi = bodyWeight / (heightInMeters * heightInMeters)
  if (bmi < 18.5 || bmi > 25) score -= 10

  return Math.max(score, 0)
}

const Transactions = ({ healthData }) => {
  const healthScore = calculateHealthScore(healthData)
  const isHealthy = healthScore >= 75

const overviewData = [
  {
    stats: healthData?.heartRate != null ? `${healthData.heartRate} bpm` : 'N/A',
    title: 'Heart Rate',
    color: 'error',
    icon: 'ri-heart-line'
  },
  {
    stats: healthData?.sleep != null ? `${healthData.sleep} hrs` : 'N/A',
    title: 'Sleep',
    color: 'info',
    icon: 'ri-moon-line'
  },
  {
    stats:
      healthData?.steps != null
        ? `${(Number(healthData.steps) / 1000).toFixed(1)}k`
        : '0k',
    title: 'Steps',
    color: 'success',
    icon: 'ri-walk-line'
  },
  {
    stats: healthData?.calories != null ? `${healthData.calories} kcal` : '0 kcal',
    title: 'Calories Burned',
    color: 'warning',
    icon: 'ri-fire-line'
  }
]


  return (
    <Card className='bs-full'>
      <CardHeader
        title='Health Overview'
        // action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <p className='mbs-3'>
            <span className='font-medium text-textPrimary'>
              {isHealthy ? 'You are doing great! 💪' : 'Keep improving 💡'}
            </span>
            <span className='text-textSecondary'>Daily summary</span>
          </p>
        }
      />
      <CardContent className='!pbs-5'>
        <Grid container spacing={2}>
          {overviewData.map((item, index) => (
            <Grid item xs={6} md={3} key={index}>
              <div className='flex items-center gap-3'>
                <CustomAvatar variant='rounded' color={item.color} className='shadow-xs'>
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div>
                  <Typography className='text-textSecondary'>{item.title}</Typography>
                  <Typography variant='h5'>{item.stats}</Typography>
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default Transactions
