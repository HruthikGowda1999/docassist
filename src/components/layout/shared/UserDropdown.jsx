  'use client'

  import { useRef, useState, useEffect } from 'react'
  import { useRouter } from 'next/navigation'
  import { styled } from '@mui/material/styles'
  import Badge from '@mui/material/Badge'
  import Avatar from '@mui/material/Avatar'
  import Popper from '@mui/material/Popper'
  import Fade from '@mui/material/Fade'
  import Paper from '@mui/material/Paper'
  import ClickAwayListener from '@mui/material/ClickAwayListener'
  import MenuList from '@mui/material/MenuList'
  import Typography from '@mui/material/Typography'
  import Divider from '@mui/material/Divider'
  import MenuItem from '@mui/material/MenuItem'
  import Button from '@mui/material/Button'

  // Firebase Imports
  import { getFirestore, doc, getDoc } from 'firebase/firestore'
  import { app } from '@/utils/firebaseConfig'

  const db = getFirestore(app)

  const BadgeContentSpan = styled('span')({
    width: 8,
    height: 8,
    borderRadius: '50%',
    cursor: 'pointer',
    backgroundColor: 'var(--mui-palette-success-main)',
    boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
  })

  const UserDropdown = () => {
    const [role, setRole] = useState('')
    const [fullName, setFullName] = useState('')
    const [userId, setUserId] = useState('')
    const [userDetails, setUserDetails] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)

    const anchorRef = useRef(null)
    const router = useRouter()

    useEffect(() => {
      const cookies = document.cookie.split('; ')
      const roleCookie = cookies.find(c => c.startsWith('user_role'))
      const fullNameCookie = cookies.find(c => c.startsWith('user_fullname'))
      const userIdCookie = cookies.find(c => c.startsWith('user_id'))

      if (roleCookie) setRole(decodeURIComponent(roleCookie.split('=')[1] || ''))
      if (fullNameCookie) setFullName(decodeURIComponent(fullNameCookie.split('=')[1] || ''))
      if (userIdCookie) setUserId(decodeURIComponent(userIdCookie.split('=')[1] || ''))
    }, [])

    // Fetch user details once when dropdown opens, if not already fetched
    useEffect(() => {
      if (dropdownOpen && userId && !userDetails) {
        const fetchUserDetails = async () => {
          try {
            const docRef = doc(db, 'users', userId)
            const userSnap = await getDoc(docRef)

            if (userSnap.exists()) {
              setUserDetails(userSnap.data())
            } else {
              console.warn('No user found')
            }
          } catch (error) {
            console.error('Error fetching user details:', error)
          }
        }
        fetchUserDetails()
      }
    }, [dropdownOpen, userId, userDetails])

    const handleDropdownToggle = () => {
      setDropdownOpen(prev => !prev)
    }

    const handleDropdownClose = (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) return
      setDropdownOpen(false)
    }

    return (
      <>
        <Badge
          ref={anchorRef}
          overlap='circular'
          badgeContent={<BadgeContentSpan onClick={handleDropdownToggle} />}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          className='mis-2'
        >
          <Avatar
            alt='User Avatar'
            src='/images/avatars/1.png'
            onClick={handleDropdownToggle}
            className='cursor-pointer bs-[38px] is-[38px]'
          />
        </Badge>

        <Popper
          open={dropdownOpen}
          transition
          disablePortal
          placement='bottom-end'
          anchorEl={anchorRef.current}
          className='min-is-[240px] !mbs-4 z-[1]'
          style={{ zIndex: 1300 }}
        >
          {({ TransitionProps, placement }) => (
            <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
              <Paper className='shadow-lg'>
                <ClickAwayListener onClickAway={handleDropdownClose}>
                  <MenuList>
                    {/* User Info Section */}
                    <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                      <Avatar alt='User Avatar' src='/images/avatars/1.png' />
                      <div className='flex flex-col'>
                        <Typography className='font-medium'>{fullName}</Typography>
                        <Typography variant='caption'>{role}</Typography>
                        {userDetails ? (
                          <>
                            <Typography variant='body2' noWrap>Email: {userDetails.email}</Typography>
                            <Typography variant='body2'>Gender: {userDetails.gender || 'N/A'}</Typography>
                          </>
                        ) : (
                          <Typography variant='body2'>Loading details...</Typography>
                        )}
                      </div>
                    </div>

                    <Divider className='mlb-1' />

                    {/* You can remove or comment this out as no more 'My Profile' */}
                    {/* <MenuItem disabled>My Profile (moved above)</MenuItem> */}

                    {/* Logout Button */}
                    <div className='flex items-center plb-2 pli-4'>
                      <Button
                        fullWidth
                        variant='contained'
                        color='error'
                        size='small'
                        endIcon={<i className='ri-logout-box-r-line' />}
                        onClick={() => {
                          document.cookie = 'user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
                          document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
                          document.cookie = 'user_fullname=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
                          router.push('/login')
                        }}
                        sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                      >
                        Logout
                      </Button>
                    </div>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Fade>
          )}
        </Popper>
      </>
    )
  }

  export default UserDropdown
