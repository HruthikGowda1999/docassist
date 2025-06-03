'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

const calculateHealthScore = data => {
  if (!data) return 0

  let score = 100

  const {
    steps,
    sleep,
    calories,
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

const Award = ({ healthData }) => {
  const healthScore = calculateHealthScore(healthData)
  const isHealthy = healthScore >= 75

  return (
    <Card>
      <CardContent className='flex flex-col items-center justify-center gap-4'>
        <Typography variant='h6'>Health Status</Typography>

        <Box position='relative' display='inline-flex'>
          <CircularProgress
            variant='determinate'
            value={healthScore}
            size={100}
            thickness={5}
            color={isHealthy ? 'success' : healthScore >= 50 ? 'warning' : 'error'}
          />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position='absolute'
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            <Typography variant='h6' component='div' color='text.primary'>
              {`${healthScore}%`}
            </Typography>
          </Box>
        </Box>

        <Typography variant='body2' color='text.secondary'>
          {isHealthy ? 'You are healthy! ✅' : 'Needs attention. ⚠️'}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default Award
