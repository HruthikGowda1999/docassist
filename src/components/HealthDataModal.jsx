import { Dialog } from '@mui/material'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HealingIcon from '@mui/icons-material/Healing'
import toast from 'react-hot-toast'

const HealthDataModal = ({ open, onClose, onSave }) => {
  const [data, setData] = useState({
    steps: '',
    sleep: '',
    calories: '',
    hydration: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    sugarLevel: '',
    heartRate: '',
    mood: '',
    stress: '',
    exercise: '',
    bodyWeight: '',
    height: ''
  })

  const handleChange = e => {
    setData({ ...data, [e.target.name]: e.target.value })
  }

  const isPositiveNumber = val => !isNaN(val) && Number(val) >= 0

  const handleSubmit = () => {
    const allFieldsFilled = Object.entries(data).every(([key, val]) => val.trim() !== '')

    if (!allFieldsFilled) {
      toast.error('Please fill in all fields')
      return
    }

    // Logical validations
    const numericFields = [
      'steps', 'sleep', 'calories', 'hydration', 'bloodPressureSystolic',
      'bloodPressureDiastolic', 'sugarLevel', 'heartRate',
      'exercise', 'bodyWeight', 'height'
    ]

    for (const field of numericFields) {
      if (!isPositiveNumber(data[field])) {
        toast.error(`Please enter a valid number for ${field.replace(/([A-Z])/g, ' $1')}`)
        return
      }
    }

    if (data.mood < 1 || data.mood > 10) {
      toast.error('Mood should be between 1 and 10')
      return
    }

    if (data.stress < 1 || data.stress > 10) {
      toast.error('Stress level should be between 1 and 10')
      return
    }

    toast.success('Health data saved successfully!')
    onSave(data)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className='bg-white p-8 rounded-xl shadow-xl'
          >
            <div className='flex flex-col gap-5'>
              <div className='text-center'>
                <div className='flex justify-center mb-2'>
                  <HealingIcon fontSize='large' className='text-blue-600 animate-pulse' />
                </div>
                <Typography variant='h6' className='text-blue-700 font-bold'>
                  Daily Health Assessment
                </Typography>
                <Typography variant='body2' className='text-gray-500'>
                  Track your physical and mental wellness.
                </Typography>
              </div>

              <Divider />

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <TextField
                  name='steps'
                  label='Steps Walked'
                  type='number'
                  inputProps={{ step: 1 }}
                  value={data.steps}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='sleep'
                  label='Sleep Duration (hours)'
                  type='number'
                  inputProps={{ step: '0.1' }}
                  value={data.sleep}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='calories'
                  label='Calories Burned'
                  type='number'
                  inputProps={{ step: 1 }}
                  value={data.calories}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='hydration'
                  label='Water Intake (Liters)'
                  type='number'
                  inputProps={{ step: '0.1' }}
                  value={data.hydration}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='bloodPressureSystolic'
                  label='Blood Pressure (Systolic)'
                  type='number'
                  inputProps={{ step: 1 }}
                  value={data.bloodPressureSystolic}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='bloodPressureDiastolic'
                  label='Blood Pressure (Diastolic)'
                  type='number'
                  inputProps={{ step: 1 }}
                  value={data.bloodPressureDiastolic}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='sugarLevel'
                  label='Blood Sugar Level (mg/dL)'
                  type='number'
                  inputProps={{ step: 1 }}
                  value={data.sugarLevel}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='heartRate'
                  label='Heart Rate (bpm)'
                  type='number'
                  inputProps={{ step: 1 }}
                  value={data.heartRate}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='mood'
                  label='Mood (1 - 10)'
                  type='number'
                  inputProps={{ min: 1, max: 10, step: 1 }}
                  value={data.mood}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='stress'
                  label='Stress Level (1 - 10)'
                  type='number'
                  inputProps={{ min: 1, max: 10, step: 1 }}
                  value={data.stress}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='exercise'
                  label='Exercise Duration (hours)'
                  type='number'
                  inputProps={{ step: '0.1' }}
                  value={data.exercise}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='bodyWeight'
                  label='Weight in Kgs'
                  type='number'
                  inputProps={{ step: '0.1' }}
                  value={data.bodyWeight}
                  onChange={handleChange}
                  fullWidth
                />
                <TextField
                  name='height'
                  label='Height in cms'
                  type='number'
                  inputProps={{ step: '0.1' }}
                  value={data.height}
                  onChange={handleChange}
                  fullWidth
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
