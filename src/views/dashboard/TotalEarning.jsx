'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

// Component Imports
import OptionMenu from '@core/components/option-menu'

// Utility
const calculateProgress = (value, goal) => Math.min((value / goal) * 100, 100)

const TotalEarning = ({ data }) => {
  const hydrationGoal = 2000 // in mL
  const exerciseGoal = 50 // in minutes
  const sleepGoal = 8 // in hours

  const totalDays = data.length || 1

  const totals = data.reduce(
    (acc, entry) => {
      acc.hydration += Number(entry.hydration || 0)
      acc.exercise += Number(entry.exercise || 0)
      acc.sleep += Number(entry.sleep || 0)
      return acc
    },
    { hydration: 0, exercise: 0, sleep: 0 }
  )

  const avgHydration = totals.hydration / totalDays
  const avgExercise = totals.exercise / totalDays
  const avgSleep = totals.sleep / totalDays

  const progressData = [
    {
      progress: calculateProgress(avgHydration, hydrationGoal),
      title: 'Hydration',
      amount: `${(avgHydration / 1000).toFixed(1)}L / 2L`,
      subtitle: 'Avg daily water intake',
      imgSrc: '/images/health/water.png'
    },
    {
      progress: calculateProgress(avgExercise, exerciseGoal),
      color: 'info',
      title: 'Exercise',
      amount: `${avgExercise.toFixed(0)} min / 50 min`,
      subtitle: 'Avg workout duration',
      imgSrc: '/images/health/exercise.png'
    },
    {
      progress: calculateProgress(avgSleep, sleepGoal),
      title: 'Sleep',
      color: 'secondary',
      amount: `${avgSleep.toFixed(1)} hrs / 8 hrs`,
      subtitle: 'Avg sleep duration',
      imgSrc: '/images/health/sleep.png'
    }
  ]

  const overallProgress = Math.round(
    progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length || 0
  )

  return (
    <Card>
      <CardHeader
        title='Health Progress'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Today', 'This Week', 'This Month']} />}
      />
      <CardContent className='flex flex-col gap-4 md:mbs-2.5'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h3'>{overallProgress}%</Typography>
            <i className='ri-arrow-up-s-line align-bottom text-success'></i>
            <Typography component='span' color='success.main' className='ml-1'>
              Improved
            </Typography>
          </div>
          <Typography>Compared to last week</Typography>
        </div>
        <div className='flex flex-col gap-6'>
          {progressData.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <Avatar src={item.imgSrc} variant='rounded' className='bg-actionHover' />
              <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-0.5'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.title}
                  </Typography>
                  <Typography>{item.subtitle}</Typography>
                </div>
                <div className='flex flex-col gap-2 items-center min-w-[120px]'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.amount}
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={item.progress}
                    className='is-20 bs-1 w-full'
                    color={item.color || 'primary'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TotalEarning
