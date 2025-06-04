'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Paper from '@mui/material/Paper'
import Grow from '@mui/material/Grow'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/material'
import { Dialog } from '@mui/material'

// React + Other Imports
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

// Firebase
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/utils/firebaseConfig'

// Component Imports
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import HealthDataModal from '@/components/HealthDataModal'
import toast from 'react-hot-toast'

// Video Section Component with Animation and Info
const VideoSection = ({ title, videoUrls, description }) => (
  <Grid item xs={12}>
    <Typography variant='h5' gutterBottom>
      {title}
    </Typography>
    <Typography variant='body2' gutterBottom sx={{ mb: 3 }}>
      {description}
    </Typography>
    <Grid container spacing={4}>
      {videoUrls.map((url, index) => (
        <Grow in={true} timeout={500 + index * 300} key={index}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper
              elevation={4}
              sx={{
                overflow: 'hidden',
                borderRadius: 4,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: 6
                }
              }}
            >
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={url}
                  title={`Video ${index + 1}`}
                  frameBorder='0'
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%'
                  }}
                ></iframe>
              </div>
            </Paper>
          </Grid>
        </Grow>
      ))}
    </Grid>
  </Grid>
)

const DashboardAnalytics = () => {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [userRole, setUserRole] = useState(null)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [healthData, setHealthData] = useState(null)
  const [weeklySteps, setWeeklySteps] = useState([])
  const [weeklyHealthData, setWeeklyHealthData] = useState([])
  const [openImage, setOpenImage] = useState(null)

  useEffect(() => {
    const userId = Cookies.get('user_id')
    const role = Cookies.get('user_role')

    if (!userId) {
      router.push('/login')
    } else {
      setUserRole(role)
      setCheckingAuth(false)
    }
  }, [router])

  useEffect(() => {
    const fetchWeeklyHealthData = async () => {
      const userId = Cookies.get('user_id')
      if (!userId) return

      const today = dayjs()
      const pastWeekDates = []

      for (let i = 6; i >= 0; i--) {
        pastWeekDates.push(today.subtract(i, 'day').format('YYYY-MM-DD'))
      }

      const healthQuery = query(collection(db, 'healthData'), where('userId', '==', userId))
      const snapshot = await getDocs(healthQuery)
      const allDocs = snapshot.docs.map(doc => doc.data())

      const filtered = allDocs.filter(doc => pastWeekDates.includes(doc.date))
      setWeeklyHealthData(filtered)

      const todayData = filtered.find(d => d.date === today.format('YYYY-MM-DD'))
      if (!todayData) setShowHealthModal(true)
    }

    if (!checkingAuth) fetchWeeklyHealthData()
  }, [checkingAuth])

  useEffect(() => {
    const fetchWeeklySteps = async () => {
      const userId = Cookies.get('user_id')
      if (!userId) return

      const today = dayjs()
      const pastWeek = []

      for (let i = 6; i >= 0; i--) {
        pastWeek.push(today.subtract(i, 'day').format('YYYY-MM-DD'))
      }

      const healthQuery = query(collection(db, 'healthData'), where('userId', '==', userId))
      const snapshot = await getDocs(healthQuery)
      const allDocs = snapshot.docs.map(doc => doc.data())

      const weeklyData = pastWeek.map(date => {
        const doc = allDocs.find(d => d.date === date)
        return doc?.steps ? parseFloat((doc.steps / 1000).toFixed(1)) : 0
      })

      setWeeklySteps(weeklyData)
    }

    if (!checkingAuth) fetchWeeklySteps()
  }, [checkingAuth])

  useEffect(() => {
    const fetchHealthData = async () => {
      const userId = Cookies.get('user_id')
      if (!userId) return

      const today = dayjs().format('YYYY-MM-DD')
      const healthQuery = query(collection(db, 'healthData'), where('userId', '==', userId), where('date', '==', today))

      const snapshot = await getDocs(healthQuery)

      if (snapshot.empty) {
        setShowHealthModal(true)
      } else {
        const docData = snapshot.docs[0].data()
        setHealthData(docData)
      }
    }

    if (!checkingAuth) fetchHealthData()
  }, [checkingAuth])

  const handleSaveHealthData = async data => {
    const userId = Cookies.get('user_id')
    if (!userId) return toast.error('No user ID found in cookies.')

    const allFieldsFilled = Object.entries(data).every(([_, val]) => val.toString().trim() !== '')
    if (!allFieldsFilled) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const newData = {
        userId,
        ...data,
        date: dayjs().format('YYYY-MM-DD'),
        timestamp: new Date()
      }

      await addDoc(collection(db, 'healthData'), newData)
      toast.success('Health data saved successfully')
      setHealthData(newData)
      setShowHealthModal(false)
    } catch (err) {
      toast.error('Error saving health data')
      console.error(err)
    }
  }

  if (checkingAuth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </Box>
    )
  }

  const relaxationVideos = ['https://www.youtube.com/embed/ZToicYcHIOU']
  const parentingTipsVideos = ['https://www.youtube.com/embed/J0yn7jzEXDM']
  const nutritionalGuideVideos = ['https://www.youtube.com/embed/9fNCIiFbHbY']

  // Example blog cards data for Relaxation Videos
  const relaxationBlogs = [
     {
                    title: 'Breathing Exercises for Calmness',
                    image: '/images/relaxation/breathing.jpg',
                    content:
                      'Learn simple breathing techniques that help reduce anxiety and improve oxygen flow for you and your baby.'
                  },
                  {
                    title: 'Prenatal Yoga Poses',
                    image: '/images/relaxation/yoga-poses.jpg',
                    content:
                      'Explore gentle yoga poses designed specifically for pregnant women to increase flexibility and relieve tension.'
                  },
                  {
                    title: 'Meditation for Expecting Moms',
                    image: '/images/relaxation/meditation.avif',
                    content:
                      'Practice mindfulness meditation to stay grounded, lower blood pressure, and foster emotional balance.'
                  }
  ]

  const parentingTipsBlogs = [
    {
                  title: 'Creating a Sleep Routine for Newborns',
                  image: '/images/parenting/readyforsleep.png',
                  content:
                    'Learn how to establish a consistent bedtime routine that supports your baby’s development and gives you peace of mind.'
                },
                {
                  title: 'Bonding with Your Baby',
                  image: '/images/parenting/bondingwithbaby.png',
                  content:
                    'Discover effective ways to strengthen your emotional connection with your newborn through touch, voice, and eye contact.'
                },
                {
                  title: 'Tips for Soothing a Crying Baby',
                  image: '/images/parenting/scientists-say-the-bes.jpg',
                  content: 'Understand the common reasons babies cry and how to respond calmly and confidently.'
                }
  ]

  const nutritionalGuideBlogs = [
    {
                  title: 'Top 12 Superfoods During Pregnancy',
                  image: '/images/nutrition/dggg.webp',
                  content:
                    'Include leafy greens, eggs, Greek yogurt, salmon, and nuts to boost both your and your baby’s health.'
                },
                {
                  title: 'Hydration and Its Importance',
                  image: '/images/nutrition/hydrationwater.webp',
                  content:
                    'Staying hydrated helps maintain amniotic fluid levels and supports better nutrient delivery to your baby.'
                },
                {
                  title: 'Healthy Snack Ideas for Moms-to-Be',
                  image: '/images/nutrition/snacks.webp',
                  content:
                    'Snacking smart can help maintain energy levels. Try fruit slices with peanut butter, hummus with veggies, or yogurt with berries.'
                }
  ]

  const BlogSection = ({ title, description, blogs, onImageClick }) => (
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography variant='h5' gutterBottom>
        {title}
      </Typography>
      <Typography variant='body2' gutterBottom sx={{ mb: 3, mx: 'auto', maxWidth: 600 }}>
        {description}
      </Typography>
      <Grid container spacing={4} justifyContent='center'>
        {blogs.map((blog, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 8,
                  transform: 'scale(1.03)',
                  transition: 'all 0.3s ease'
                }
              }}
              onClick={() => onImageClick(blog.image)}
            >
              <img
                src={blog.image}
                alt={blog.title}
                style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }}
              />
              <Typography variant='h6' sx={{ mt: 2, mb: 1 }}>
                {blog.title}
              </Typography>
              <Typography variant='body2' sx={{ flexGrow: 1 }}>
                {blog.content}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award healthData={healthData} />
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Transactions healthData={healthData} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <WeeklyOverview steps={weeklySteps} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <TotalEarning data={weeklyHealthData} />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <DistributedColumnChart healthData={healthData} />
          </Grid>
        </Grid>
      </Grid>

      {/* Patient-Specific Section */}
      {userRole === 'Patient' && (
        <>
          <VideoSection
            title='Relaxation Videos'
            videoUrls={relaxationVideos}
            description='This video help you stay calm and reduce anxiety during your pregnancy journey.'
          />
          <BlogSection
            title='Relaxation Blogs'
            description='Discover calming techniques and practices to ease stress and promote well-being during your pregnancy.'
            blogs={relaxationBlogs}
            onImageClick={setOpenImage}
          />

          <VideoSection
            title='Parenting Tips'
            videoUrls={parentingTipsVideos}
            description='Helpful tips for new parents to navigate the early stages of parenthood with confidence.'
          />
          <BlogSection
            title='Parenting Tips Blogs'
            description='Useful advice and guidance for new parents as they care for their newborn.'
            blogs={parentingTipsBlogs}
            onImageClick={setOpenImage}
          />

          <VideoSection
            title='Nutritional Guide'
            videoUrls={nutritionalGuideVideos}
            description='Guidance on a healthy diet to support you and your baby’s development throughout pregnancy.'
          />
          <BlogSection
            title='Nutritional Guide Blogs'
            description='Nutrition tips and meal ideas to keep you and your baby healthy.'
            blogs={nutritionalGuideBlogs}
            onImageClick={setOpenImage}
          />
        </>
      )}
      {/* Health Data Modal */}
      {showHealthModal && (
        <HealthDataModal
          open={showHealthModal}
          onClose={() => setShowHealthModal(false)}
          onSave={handleSaveHealthData}
        />
      )}

      {/* Image Dialog for Blog Images */}
      <Dialog open={Boolean(openImage)} onClose={() => setOpenImage(null)} maxWidth='md' fullWidth>
        {openImage && <img src={openImage} alt='Blog related' style={{ width: '100%', height: 'auto' }} />}
      </Dialog>
    </Grid>
  )
}

export default DashboardAnalytics
