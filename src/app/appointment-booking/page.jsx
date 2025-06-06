'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material'
import ScheduleIcon from '@mui/icons-material/Schedule'
import Logo from '@components/layout/shared/Logo'
import themeConfig from '@configs/themeConfig'
import Illustrations from '@components/Illustrations'
import { useTheme } from '@mui/material/styles'

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'

import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

// Firebase
import { db } from '@/utils/firebaseConfig'
import { collection, addDoc, query, Timestamp, where, getDocs, updateDoc, doc } from 'firebase/firestore'

const specializations = [
  'Obstetrician',
  'Gynecologist',
  'Prenatal Care Specialist',
  'Maternal-Fetal Medicine Specialist',
  'Midwife',
  'Reproductive Endocrinologist'
]

const generateSlots = () => {
  const slots = []
  const lunchStart = 13.5
  const lunchEnd = 14.5
  for (let hour = 9.5; hour <= 19.5; hour += 1) {
    if (hour >= lunchStart && hour < lunchEnd) continue
    const h = Math.floor(hour)
    const m = hour % 1 === 0.5 ? 30 : 0
    const time = `${h.toString().padStart(2, '0')}:${m === 0 ? '00' : '30'}`
    slots.push(time)
  }
  return slots
}

const allSlots = generateSlots()

const DoctorAppointment = () => {
  const [specialization, setSpecialization] = useState('')
  const [doctor, setDoctor] = useState(null)
  const [doctorsList, setDoctorsList] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookedSlots, setBookedSlots] = useState([])
  const [availableSlots, setAvailableSlots] = useState([])
  const [userId, setUserId] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [message, setMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [checkingAuth, setCheckingAuth] = useState(true)
  const theme = useTheme()
  const router = useRouter()

  useEffect(() => {
    const userId = Cookies.get('user_id')
    setUserRole(Cookies.get('user_role'))
    setUserName(Cookies.get('user_fullname'))
    setUserId(userId)
    if (!userId) router.push('/login')
    else setCheckingAuth(false)
  }, [router])

  useEffect(() => {
    if (!specialization) {
      setDoctorsList([])
      setDoctor('')
      return
    }

    const fetchDoctors = async () => {
      try {
        const usersRef = collection(db, 'users')
        const q = query(usersRef, where('role', '==', 'Doctor'), where('specialization', '==', specialization))
        const querySnapshot = await getDocs(q)
        const doctors = []
        querySnapshot.forEach(doc => {
          const data = doc.data()
          doctors.push({ id: doc.id, name: data.fullname || 'Unnamed Doctor' })
        })
        setDoctorsList(doctors)
        setDoctor(null)
      } catch (error) {
        console.error('Error fetching doctors:', error)
        setDoctorsList([])
      }
    }

    fetchDoctors()
  }, [specialization])

  useEffect(() => {
    setSelectedSlot('')
    if (!doctor || !selectedDate) return
    fetchBookedSlots(doctor, selectedDate)
  }, [doctor, selectedDate])

  const fetchBookedSlots = async (selectedDoctor, selectedDateVal) => {
    const startOfDay = dayjs(selectedDateVal).startOf('day').toDate()
    const endOfDay = dayjs(selectedDateVal).endOf('day').toDate()

    try {
      const appointmentsRef = collection(db, 'appointments')
      const q = query(
        appointmentsRef,
        where('doctorId', '==', selectedDoctor.id),
        where('timestamp', '>=', startOfDay),
        where('timestamp', '<=', endOfDay)
      )
      const snapshot = await getDocs(collection(db, 'appointments'))
      const appointments = snapshot.docs.map(doc => doc.data())

      // 🧠 Step 1: Group by slot and pick latest by createdAt
      const slotMap = new Map()

      appointments.forEach(app => {
        const existing = slotMap.get(app.slot)
        if (!existing || (app.createdAt?.seconds || 0) > (existing.createdAt?.seconds || 0)) {
          slotMap.set(app.slot, app)
        }
      })

      // 🔒 Step 2: Now only consider slots that are NOT cancelled
      const booked = Array.from(slotMap.values())
        .filter(app => app.status !== 'cancelled')
        .map(app => app.slot)

      // Cancelled slots (in case you want to show them differently)
      const cancelledSlots = appointments.filter(app => app.status === 'cancelled').map(app => app.slot)

      const now = new Date()
      const isToday = dayjs(selectedDateVal).isSame(dayjs(), 'day')

      const filtered = allSlots.filter(slot => {
        const [h, m] = slot.split(':').map(Number)
        const slotDate = new Date(selectedDateVal)
        slotDate.setHours(h, m, 0, 0)

        const isBooked = booked.includes(slot)

        if (isBooked) return false

        if (dayjs(selectedDateVal).isSame(dayjs(), 'day') && slotDate < new Date()) {
          return false
        }

        return true
      })

      setBookedSlots(booked)
      setAvailableSlots(filtered)
    } catch (err) {
      console.error('Error fetching appointments:', err)
      setAvailableSlots([])
    }
  }

  const handleBook = async () => {
    if (!specialization || !doctor || !selectedSlot || !selectedDate) {
      toast.error('Please select specialization, doctor, date and slot.')
      return
    }

    if (!userId) {
      toast.error('You must be logged in to book an appointment.')
      return
    }

    const [h, m] = selectedSlot.split(':').map(Number)
    const appointmentTime = new Date(selectedDate)
    appointmentTime.setHours(h, m, 0, 0)

    const timestamp = Timestamp.fromDate(appointmentTime)

    // ✅ Step 1: Check for conflict
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctor.id),
      where('slot', '==', selectedSlot),
      where('timestamp', '==', timestamp)
    )

    const snapshot = await getDocs(q)

    // 📌 Check if any result is NOT cancelled
    const alreadyBooked = snapshot.docs.some(doc => doc.data().status !== 'cancelled')

    if (alreadyBooked) {
      toast.error('This slot is already booked. Please choose a different one.')
      return
    }

    // ✅ Step 2: Proceed to book
    const appointment = {
      doctorId: doctor.id,
      doctorName: doctor.name,
      patientName: userName,
      slot: selectedSlot,
      status: 'pending',
      specialization,
      patientId: userId,
      timestamp
    }

    try {
      await addDoc(collection(db, 'appointments'), appointment)
      setBookedSlots(prev => [...prev, selectedSlot])
      setAvailableSlots(prev => prev.filter(slot => slot !== selectedSlot))
      toast.success(`Appointment booked with ${doctor.name} at ${selectedSlot}`)
      setSelectedSlot('')
      await fetchUserAppointments()
      await fetchBookedSlots(doctor, selectedDate)
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Failed to book appointment. Please try again.')
    }
  }

  const fetchUserAppointments = async () => {
    if (!userId) return

    try {
      const appointmentsRef = collection(db, 'appointments')
      let q

      if (userRole === 'Doctor') {
        q = query(appointmentsRef, where('doctorId', '==', userId))
      } else {
        q = query(appointmentsRef, where('patientId', '==', userId))
      }

      const snapshot = await getDocs(q)
      const now = new Date()

      const list = snapshot.docs.map(doc => {
        const data = doc.data()
        const appointmentTime = data.timestamp.toDate()
        const status =
          appointmentTime < now && dayjs(appointmentTime).isSame(dayjs(), 'day') ? 'completed' : data.status
        return { id: doc.id, ...data, status }
      })
      const sortedAppointments = list.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
      setAppointments(sortedAppointments)
    } catch (err) {
      console.error('Error fetching appointments:', err)
    }
  }

  const handleCancel = async appointmentId => {
    const confirmCancel = window.confirm('Are you sure you want to cancel this appointment?')
    if (!confirmCancel) return

    try {
      const appointmentRef = doc(db, 'appointments', appointmentId)
      const cancelData = {
        status: 'cancelled',
        canceledBy: userRole // Store who canceled the appointment (Doctor or Patient)
      }
      await updateDoc(appointmentRef, cancelData)

      // Find the canceled appointment and update the local state
      const canceledAppointment = appointments.find(app => app.id === appointmentId)

      // Remove the slot from booked slots
      setBookedSlots(prev => prev.filter(slot => slot !== canceledAppointment.slot))

      // Add the slot back to available slots
      setAvailableSlots(prev => [...prev, canceledAppointment.slot])

      // Update the appointment status in the UI
      setAppointments(prev =>
        prev.map(app => (app.id === appointmentId ? { ...app, status: 'cancelled', canceledBy: userRole } : app))
      )

      toast.success('Your appointment has been cancelled and the slot is available for booking.')
    } catch (error) {
      toast.error('Failed to cancel appointment. Please try again.')
    }
  }

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
        <CircularProgress />
      </div>
    )
  } else fetchUserAppointments()

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div
        className='flex flex-col justify-start items-center min-h-screen relative p-4 sm:p-6'
        style={{ backgroundColor: theme.palette.background.default }}
      >
        {/* Booking Form */}
        {userRole !== 'Doctor' && (
          <div
            className='w-full max-w-3xl flex flex-col h-[70vh] shadow-lg rounded-2xl'
            style={{ backgroundColor: theme.palette.background.paper }}
          >
            <CardContent className='p-4 sm:p-8 flex flex-col h-full'>
              <Box className='flex flex-col items-center gap-2 mb-6'>
                <Logo />
                <Typography variant='h5' className='text-center font-semibold'>
                  {`Book Your Appointment - ${themeConfig.templateName} Health`}
                </Typography>
                <Typography variant='h5' sx={{ color: theme.palette.text.primary }}>
                  Choose a specialization, select a doctor, pick a time, and book your appointment!
                </Typography>
              </Box>

              {/* Select fields */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <TextField
                    select
                    label='Select Specialization'
                    value={specialization}
                    onChange={e => {
                      setSpecialization(e.target.value)
                      setDoctor(null)
                      setSelectedDate(null)
                      setAvailableSlots([])
                      setBookedSlots([])
                      setSelectedSlot('')
                    }}
                    fullWidth
                  >
                    {specializations.map(spec => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    label='Select Doctor'
                    value={doctor?.id || ''}
                    onChange={e => {
                      const selected = doctorsList.find(d => d.id === e.target.value)
                      setDoctor(selected || null)
                      setSelectedDate(null) // Reset date
                      setAvailableSlots([]) // Reset slots
                      setBookedSlots([]) // Reset booked slots
                      setSelectedSlot('') // Clear selected slot
                    }}
                    fullWidth
                    disabled={!specialization || doctorsList.length === 0}
                  >
                    {doctorsList.length > 0 ? (
                      doctorsList.map(doc => (
                        <MenuItem key={doc.id} value={doc.id}>
                          {doc.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No doctors available</MenuItem>
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={4}>
                  <DatePicker
                    label='Select Date'
                    value={selectedDate}
                    onChange={newVal => setSelectedDate(newVal)}
                    shouldDisableDate={date => dayjs(date).day() === 0}
                    disablePast
                    disabled={!doctor}
                    format='dd-MMM-yyyy'
                    slotProps={{
                      textField: {
                        inputProps: { readOnly: true },
                        onKeyDown: e => e.preventDefault()
                      }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Slots */}
              <Typography variant='subtitle1' gutterBottom>
                Available Slots
              </Typography>
              <Grid container spacing={1} sx={{ maxHeight: 180, overflowY: 'auto', mb: 3 }}>
                {allSlots.map(slot => {
                  const isAvailable = availableSlots.includes(slot)
                  return (
                    <Grid item key={slot} xs={4} sm={3}>
                      <Chip
                        label={slot}
                        clickable={isAvailable}
                        disabled={!isAvailable}
                        color={selectedSlot === slot ? 'primary' : 'default'}
                        onClick={() => isAvailable && setSelectedSlot(slot)}
                        icon={<ScheduleIcon />}
                        sx={{ width: '100%', fontWeight: selectedSlot === slot ? 'bold' : 'normal' }}
                      />
                    </Grid>
                  )
                })}
              </Grid>

              <Button
                variant='contained'
                color='primary'
                fullWidth
                disabled={!selectedSlot || !doctor}
                onClick={handleBook}
                sx={{ mb: 4 }}
              >
                Book Appointment
              </Button>
            </CardContent>
          </div>
        )}

        {/* Appointments Section */}
        <div className='w-full max-w-3xl mt-10 p-4 rounded-xl bg-white shadow-md'>
          <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
            <Typography
              variant='h6'
              sx={{
                color: theme => (theme.palette.mode === 'dark' ? '#000' : theme.palette.text.primary) // White for dark mode
              }}
              fontWeight='bold'
            >
              🗓️ Your Appointments
            </Typography>
          </Box>

          {appointments.length === 0 ? (
            <Typography
              variant='body2'
              sx={{
                mt: 2,
                color: theme => (theme.palette.mode === 'dark' ? '#000' : theme.palette.text.secondary) // Lighter secondary color for dark mode
              }}
            >
              You have no appointments yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {appointments.map(app => (
                <Grid item xs={12} sm={6} key={app.id}>
                  <Card
                    sx={{
                      borderLeft: `5px solid ${themeConfig.appointmentColor}`,
                      p: 2,
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderRadius: 2,
                      height: '100%',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Typography variant='subtitle1' fontWeight='bold'>
                      {userRole === 'Doctor' ? app.patientName : app.doctorName}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      {userRole === 'Doctor' ? '' : app.specialization}
                    </Typography>
                    <Typography variant='body2'>Date: {dayjs(app.timestamp.toDate()).format('DD-MMM-YYYY')}</Typography>
                    <Typography variant='body2'>Slot: {app.slot}</Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                      <Chip
                        label={
                          app.status === 'completed'
                            ? 'Completed'
                            : app.status === 'cancelled'
                              ? `Cancelled by ${app.canceledBy}`
                              : 'Pending'
                        }
                        color={
                          app.status === 'completed' ? 'success' : app.status === 'cancelled' ? 'error' : 'warning'
                        }
                        size='small'
                      />
                      {app.status !== 'completed' && app.status !== 'cancelled' && (
                        <Chip
                          label='Cancel Appointment?'
                          size='small'
                          onClick={() => handleCancel(app.id)}
                          sx={{
                            backgroundColor: theme.palette.error.main,
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            '&:hover': {
                              color: '#000'
                            }
                          }}
                        />
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </div>

        <Illustrations
          maskImg={{ src: '/images/pages/medical-mask-light.png' }}
          sx={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.15, pointerEvents: 'none' }}
        />
      </div>
    </LocalizationProvider>
  )
}

export default DoctorAppointment
