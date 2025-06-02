import { useState } from 'react'

import { Dialog } from '@mui/material'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'


import { addDoc, collection } from 'firebase/firestore'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'
import HealingIcon from '@mui/icons-material/Healing'

import { db } from '@/utils/firebaseConfig'

const HealthDataModal = ({ open, onClose }) => {
  const [data, setData] = useState({
    steps: '',
    sleep: '',
    calories: '',
    hydration: ''
  })

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
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

    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className='bg-white p-8 rounded-xl shadow-xl'
          >
            <div className='flex flex-col gap-5'>
              <div className='text-center'>
                <div className='flex justify-center mb-2'>
                  <HealingIcon fontSize='large' className='text-blue-600 animate-pulse' />
                </div>
                <Typography variant='h6' className='text-blue-700 font-bold'>
                  Daily Health Metrics
                </Typography>
                <Typography variant='body2' className='text-gray-500'>
                  Help us track your well-being.
                </Typography>
              </div>

              <Divider />

              <div className='grid grid-cols-1 gap-4'>
                <TextField
                  name='steps'
                  label='Steps Walked'
                  value={data.steps}
                  onChange={handleChange}
                  fullWidth
                  type='number'
                  helperText='Total steps taken today'
                />
                <TextField
                  name='sleep'
                  label='Sleep Duration (hours)'
                  value={data.sleep}
                  onChange={handleChange}
                  fullWidth
                  type='number'
                  helperText='Total hours slept'
                />
                <TextField
                  name='calories'
                  label='Calories Burned'
                  value={data.calories}
                  onChange={handleChange}
                  fullWidth
                  type='number'
                  helperText='Calories expended today'
                />
                <TextField
                  name='hydration'
                  label='Water Intake (Liters)'
                  value={data.hydration}
                  onChange={handleChange}
                  fullWidth
                  type='number'
                  helperText='Water consumed today'
                />
              </div>

              <div className='flex justify-end gap-3 mt-4'>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button onClick={onClose} variant='outlined' color='secondary'>
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button onClick={handleSubmit} variant='contained' color='primary'>
                    Save Entry
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  )
}

export default HealthDataModal
