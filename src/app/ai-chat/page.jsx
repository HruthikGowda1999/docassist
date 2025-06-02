'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, Typography, TextField, Button, CircularProgress, Box } from '@mui/material'
import Logo from '@components/layout/shared/Logo'
import themeConfig from '@configs/themeConfig'
import Illustrations from '@components/Illustrations'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useTheme } from '@mui/material/styles'

const AIChat = () => {
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hello! Ask me anything about health.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSerious, setIsSerious] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const theme = useTheme()
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const userId = Cookies.get('user_id')
    const role = Cookies.get('user_role')  // Assuming user_role is saved in cookies

    if (!userId) {
      router.push('/login')
    } else {
      setUserRole(role)
      setCheckingAuth(false)
    }
  }, [router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { from: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setInput('')

    try {
      const res = await fetch('/api/health-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      })
      const data = await res.json()

      const botMessage = {
        from: 'bot',
        text: data.answer || 'Sorry, I could not answer that.'
      }

      // Check if the answer indicates a serious condition
      if (data.isSerious) {
        setIsSerious(true)
      } else {
        setIsSerious(false)
      }

      setMessages(prev => [...prev, botMessage])
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Oops! Something went wrong.' }])
    } finally {
      setLoading(false)
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
    <div className='flex flex-col justify-center items-center min-h-screen relative p-4 sm:p-6 bg-[#f2f4f7]'>
      <Card className='w-full max-w-3xl flex flex-col h-[85vh] shadow-lg rounded-2xl'>
        <CardContent className='p-6 sm:p-10 flex flex-col h-full'>
          {/* Header */}
          <div className='flex flex-col items-center gap-2 mb-6'>
            <Logo />
            <Typography variant='h5' className='text-center font-semibold'>
              {`Welcome to ${themeConfig.templateName} HealthBot 🤖`}
            </Typography>
            <Typography variant='body2' sx={{ color: theme.palette.text.primary }} className='text-center'>
              Ask anything related to health and wellness
            </Typography>
          </div>

          {/* Chat Window */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              mb: 2,
              px: 2,
              py: 1,
              border: '1px solid #ddd',
              borderRadius: 3,
              bgcolor: 'background.paper',
              boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)'
            }}
          >
            {messages.map((msg, index) => (
              <Box key={index} sx={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', my: 1 }}>
                <Typography
                  sx={{
                    px: 3,
                    py: 1.5,
                    bgcolor: msg.from === 'user' ? 'primary.main' : '#e0e0e0',
                    color: msg.from === 'user' ? '#fff' : '#000',
                    borderRadius: msg.from === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                    maxWidth: '80%',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: 15
                  }}
                >
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1, py: 1 }}>
                <CircularProgress size={18} color='primary' />
                <Typography variant='body2' color='text.secondary'>
                  HealthBot is typing...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <TextField
              fullWidth
              placeholder='Ask your health question...'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (!loading) handleSend()
                }
              }}
              disabled={loading}
              multiline
              maxRows={3}
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 3,
                  backgroundColor: theme => (theme.palette.mode === 'dark' ? '#333' : '#f9f9f9'),
                  borderColor: theme => (theme.palette.mode === 'dark' ? '#444' : '#ccc')
                }
              }}
            />
            <Button
              variant='contained'
              disabled={loading || !input.trim()}
              onClick={handleSend}
              sx={{ borderRadius: 3, minWidth: 90, textTransform: 'none' }}
            >
              Send
            </Button>
          </Box>

          {/* Show the "Book Appointment" button only if the situation is serious and the user is a patient */}
          {isSerious && userRole === 'Patient' && (
            <Button
              variant='contained'
              color='primary'
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => router.push('/appointment-booking')}
            >
              Book Appointment
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Background Illustration */}
      <Illustrations maskImg={{ src: '/images/pages/auth-v1-mask-light.png' }} />
    </div>
  )
}

export default AIChat
