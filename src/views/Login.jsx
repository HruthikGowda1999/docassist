'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'

// Toast
import toast from 'react-hot-toast'

// Firebase Auth
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/utils/firebaseConfig'
import Cookies from 'js-cookie'

const Login = ({ mode }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const router = useRouter()
  const authBackground = useImageVariant(
    mode,
    '/images/pages/auth-v1-mask-light.png',
    '/images/pages/auth-v1-mask-dark.png'
  )

  const handleClickShowPassword = () => setIsPasswordShown(prev => !prev)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    debugger
    e.preventDefault()

    const { email, password } = form

    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    try {
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        toast.error('No user found with this email.')
        return
      }

      const userDoc = snapshot.docs[0]
      const userData = userDoc.data()

      // Compare passwords (stored in plain text in your case)
      if (userData.password !== password.trim()) {
        toast.error('Incorrect password.')
        return
      }

      // Set cookies with user info
      Cookies.set('user_id', userDoc.id, { expires: 1 / 24, secure: true, sameSite: 'lax' })
      Cookies.set('user_role', userData.role || 'user', { expires: 1 / 24, secure: true, sameSite: 'lax' })
      Cookies.set('user_fullname', userData.fullname || 'user', { expires: 1 / 24, secure: true, sameSite: 'lax' })

      toast.success('Logged in successfully!')
      router.push('/dashboard')
    } catch (err) {
      console.error('Login Error:', err)
      toast.error('Something went wrong while logging in.')
    }
  }

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <div className='flex flex-col gap-5'>
            <div>
              <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!👋🏻`}</Typography>
              <Typography className='mbs-1'>Please sign-in to your account</Typography>
            </div>
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField fullWidth label='Email' name='email' value={form.email} onChange={handleChange} />
              <TextField
                fullWidth
                label='Password'
                name='password'
                type={isPasswordShown ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
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
              <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                {/* <FormControlLabel control={<Checkbox />} label='Remember me' /> */}
                {/* <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography> */}
              </div>
              <Button fullWidth variant='contained' type='submit'>
                Log In
              </Button>
              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Create an account
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

export default Login
