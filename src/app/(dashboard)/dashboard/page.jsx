'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

// Components Imports
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import Table from '@views/dashboard/Table'
import HealthDataModal from '@/components/HealthDataModal'
import dayjs from 'dayjs'
import { collection, addDoc, query, Timestamp, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/utils/firebaseConfig'

const DashboardAnalytics = () => {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showHealthModal, setShowHealthModal] = useState(false)

  useEffect(() => {
    const userId = Cookies.get('user_id')

    if (!userId) {
      router.push('/login')
    } else {
      setCheckingAuth(false)
    }
  }, [router])

  useEffect(() => {
    const checkFirstLoginToday = async () => {
      debugger
      const userId = Cookies.get('user_id')
      if (!userId) return

      const today = dayjs().format('YYYY-MM-DD')
      const loginQuery = query(collection(db, 'dailyLogins'), where('userId', '==', userId), where('date', '==', today))

      const snapshot = await getDocs(loginQuery)
      if (snapshot.empty) {
        // First login today
        setShowHealthModal(true)

        // Save login record
        await addDoc(collection(db, 'dailyLogins'), {
          userId,
          date: today,
          timestamp: new Date()
        })
      }
    }

    checkFirstLoginToday()
  }, [])

  const handleSaveHealthData = async data => {
    const userId = Cookies.get('user_id')
    if (!userId) {
      console.error('No user ID found in cookies.')
      return
    }
    try {
      await addDoc(collection(db, 'healthData'), {
        userId,
        ...data,
        date: dayjs().format('YYYY-MM-DD'),
        timestamp: new Date()
      })
      console.log('Health data saved successfully')
    } catch (err) {
      console.error('Error saving health data:', err)
    }
  }

  if (checkingAuth) {
    // Return a spinner or nothing while checking
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </div>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Transactions />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <WeeklyOverview />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <TotalEarning />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <DistributedColumnChart />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Table />
      </Grid>
      <HealthDataModal open={showHealthModal} onClose={() => setShowHealthModal(false)} onSave={handleSaveHealthData} />{' '}
    </Grid>
  )
}

export default DashboardAnalytics
