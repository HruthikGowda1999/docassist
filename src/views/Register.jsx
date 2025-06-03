'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

// Utils
import saveUserToFirebase from '@/utils/register'

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

import { useRouter } from 'next/navigation'

const Register = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    specialization: '',
    gender: ''
  })
  const [errors, setErrors] = useState({})

  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)

  const handleChange = e => {
    const { name, value } = e.target
    let updatedValue = value

    if (name === 'fullName') {
      // 1. Convert to uppercase
      updatedValue = value.toUpperCase()
      // 2. Replace multiple spaces with single space
      updatedValue = updatedValue.replace(/\s+/g, ' ')
      // 3. Trim spaces at start and end
      updatedValue = updatedValue.trimStart() // Allow trailing space while typing
    }

    setForm(prev => ({ ...prev, [name]: updatedValue }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const newErrors = {}

    if (!form.fullName.trim()) newErrors.fullName = 'Full Name is required'
    else if (!/^[A-Za-z\s]+$/.test(form.fullName.trim())) newErrors.fullName = 'Full Name must contain only alphabets'

    // if (!form.username.trim()) newErrors.username = 'Username is required'
    // else if (!/^[A-Za-z\s]+$/.test(form.username.trim()))
    //   newErrors.username = 'Username must contain only alphabets'

    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address'

    if (!form.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,16}$/.test(form.password.trim())
    ) {
      newErrors.password =
        'Password must be 8–16 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character'
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm Password is required'
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!form.role) newErrors.role = 'Role is required'

    if (!form.gender) newErrors.gender = 'Gender is required'

    if (form.role === 'Doctor' && !form.specialization.trim()) {
      newErrors.specialization = 'Specialization is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()

    if (validate()) {
      const { confirmPassword, ...submitForm } = form

      if (submitForm.role !== 'Doctor') {
        delete submitForm.specialization
      }

      await saveUserToFirebase(form, setForm, () => router.push('/login'))
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                fullWidth
                label='Full Name'
                name='fullName'
                value={form.fullName}
                onChange={handleChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
              />

              {/* <TextField
                fullWidth
                label='Username'
                name='username'
                value={form.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
              /> */}
              <TextField
                fullWidth
                label='Email'
                name='email'
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
              <TextField
                fullWidth
                label='Password'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label='Confirm Password'
                name='confirmPassword'
                type={isPasswordShown ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                select
                label='Gender'
                name='gender'
                value={form.gender}
                onChange={handleChange}
                error={!!errors.gender}
                helperText={errors.gender}
              >
                <MenuItem value=''>Select Gender</MenuItem>
                <MenuItem value='Male'>Male</MenuItem>
                <MenuItem value='Female'>Female</MenuItem>
                <MenuItem value='Other'>Other</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label='Select Role'
                name='role'
                value={form.role}
                onChange={handleChange}
                error={!!errors.role}
                helperText={errors.role}
              >
                <MenuItem value=''>Select Role</MenuItem>
                <MenuItem value='Doctor'>Doctor</MenuItem>
                <MenuItem value='Patient'>Patient</MenuItem>
              </TextField>

              {form.role === 'Doctor' && (
                <TextField
                  fullWidth
                  select
                  label='Specialization'
                  name='specialization'
                  value={form.specialization}
                  onChange={handleChange}
                  error={!!errors.specialization}
                  helperText={errors.specialization}
                >
                  <MenuItem value=''>Select Specialization</MenuItem>
                  <MenuItem value='Cardiologist'>Cardiologist</MenuItem>
                  <MenuItem value='Dermatologist'>Dermatologist</MenuItem>
                  <MenuItem value='Pediatrician'>Pediatrician</MenuItem>
                  <MenuItem value='General Surgeon'>General Surgeon</MenuItem>
                  <MenuItem value='Neurologist'>Neurologist</MenuItem>
                </TextField>
              )}

              <Button fullWidth variant='contained' type='submit'>
                Sign Up
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>Already have an account?</Typography>
                <Typography component={Link} href='/login' color='primary'>
                  Sign in instead
                </Typography>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
  )
}

export default Register
