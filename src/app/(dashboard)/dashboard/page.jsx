'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

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
import Table from '@views/dashboard/Table'
import HealthDataModal from '@/components/HealthDataModal'
import toast from 'react-hot-toast'

const DashboardAnalytics = () => {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [healthData, setHealthData] = useState(null)
  const [weeklySteps, setWeeklySteps] = useState([])
  const [weeklyHealthData, setWeeklyHealthData] = useState([])

  useEffect(() => {
    const userId = Cookies.get('user_id')
    if (!userId) {
      router.push('/login')
    } else {
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

      // Filter data only for the past 7 days
      const filtered = allDocs.filter(doc => pastWeekDates.includes(doc.date))

      setWeeklyHealthData(filtered)

      // If today's data is missing, open modal
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

    if (!checkingAuth) {
      fetchHealthData()
    }
  }, [checkingAuth])

  const handleSaveHealthData = async data => {
    const userId = Cookies.get('user_id')
    if (!userId) {
      console.error('No user ID found in cookies.')
      return
    }
    const allFieldsFilled = Object.entries(data).every(([key, val]) => val.toString().trim() !== '')
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
      toast.error('Error saving health data:', err)
    }
  }

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </div>
    )
  }

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
      {/* <Grid item xs={12}>
        <Table data={healthData} />
      </Grid> */}
      <HealthDataModal
        open={showHealthModal}
        onClose={() => setShowHealthModal(false)} // allow closing modal
        onSave={handleSaveHealthData}
      />{' '}
    </Grid>
  )
}

export default DashboardAnalytics
