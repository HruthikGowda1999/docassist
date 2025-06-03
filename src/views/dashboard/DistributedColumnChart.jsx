'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Helper function to calculate BMI
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm) return null
  const heightM = heightCm / 100
  return (weightKg / (heightM * heightM)).toFixed(1)
}

// Get BMI status
const getBMIStatus = bmi => {
  if (!bmi) return 'Unknown'
  if (bmi < 18.5) return 'Underweight'
  if (bmi >= 18.5 && bmi < 24.9) return 'Normal weight'
  if (bmi >= 25 && bmi < 29.9) return 'Overweight'
  return 'Obese'
}

const BMIStatusCard = ({ healthData }) => {
  const theme = useTheme()

  const height = healthData?.height
  const weight = healthData?.bodyWeight
  const bmi = calculateBMI(weight, height)
  const status = getBMIStatus(bmi)

  const colorMap = {
    Underweight: theme.palette.warning.main,
    'Normal weight': theme.palette.success.main,
    Overweight: theme.palette.error.light,
    Obese: theme.palette.error.main,
    Unknown: theme.palette.text.secondary
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6'>BMI Status</Typography>
        <Typography variant='h4' sx={{ color: colorMap[status], mt: 2, mb: 1 }}>
          {status}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Height: {height ? `${height} cm` : 'N/A'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Weight: {weight ? `${weight} kg` : 'N/A'}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          BMI: {bmi || 'N/A'}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default BMIStatusCard
