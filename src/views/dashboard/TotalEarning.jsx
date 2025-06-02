// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Sample health data
const data = [
  {
    progress: 75,
    title: 'Hydration',
    amount: '1.5L / 2L',
    subtitle: 'Daily water intake',
    imgSrc: '/images/health/water.png' // you can replace this with your health icons/images
  },
  {
    progress: 60,
    color: 'info',
    title: 'Exercise',
    amount: '30 min / 50 min',
    subtitle: 'Workout duration',
    imgSrc: '/images/health/exercise.png'
  },
  {
    progress: 40,
    title: 'Sleep',
    color: 'secondary',
    amount: '4 hrs / 8 hrs',
    subtitle: 'Sleep duration',
    imgSrc: '/images/health/sleep.png'
  }
]

const TotalEarning = () => {
  return (
    <Card>
      <CardHeader
        title='Health Progress'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Today', 'This Week', 'This Month']} />}
      />
      <CardContent className='flex flex-col gap-4 md:mbs-2.5'>
        <div>
          <div className='flex items-center'>
            <Typography variant='h3'>68%</Typography>
            <i className='ri-arrow-up-s-line align-bottom text-success'></i>
            <Typography component='span' color='success.main' className='ml-1'>
              Improved
            </Typography>
          </div>
          <Typography>Compared to last week</Typography>
        </div>
        <div className='flex flex-col gap-6'>
          {data.map((item, index) => (
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

