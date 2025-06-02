// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// Health Data
const data = [
  {
    stats: '72 bpm',
    title: 'Heart Rate',
    color: 'error',
    icon: 'ri-heart-line'
  },
  {
    stats: '7.5 hrs',
    title: 'Sleep',
    color: 'info',
    icon: 'ri-moon-line'
  },
  {
    stats: '10.2k',
    title: 'Steps',
    color: 'success',
    icon: 'ri-walk-line'
  },
  {
    stats: '1,950 kcal',
    title: 'Calories Burned',
    color: 'warning',
    icon: 'ri-fire-line'
  }
]

const Transactions = () => {
  return (
    <Card className='bs-full'>
      <CardHeader
        title='Health Overview'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Refresh', 'Share', 'Update']} />}
        subheader={
          <p className='mbs-3'>
            <span className='font-medium text-textPrimary'>You are doing great! 💪</span>
            <span className='text-textSecondary'>Daily summary</span>
          </p>
        }
      />
      <CardContent className='!pbs-5'>
        <Grid container spacing={2}>
          {data.map((item, index) => (
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
