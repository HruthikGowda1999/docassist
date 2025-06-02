'use client'

import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-custom-scrollbars-2'

import { Menu, SubMenu, MenuItem } from '@menu/vertical-menu'
import useVerticalNav from '@menu/hooks/useVerticalNav'

import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

import Cookies from 'js-cookie'
import { useState, useEffect, useRef } from 'react'

const VerticalMenu = ({ scrollMenu }) => {
  const theme = useTheme()
  const { isBreakpointReached } = useVerticalNav()

  const [role, setRole] = useState('')
  
  useEffect(() => {
    const roleFromCookie = Cookies.get('user_role')
    if (roleFromCookie) {
      setRole(roleFromCookie)
    }
  }, [])

  useEffect(() => {
    // Get the cookie named "user"
    const cookies = document.cookie.split('; ')
    const userCookie = cookies.find(cookie => cookie.startsWith('user_role'))

    if (userCookie) {
      try {
        setRole(userCookie.split('=')[1] || '')
      } catch (err) {
        console.error('Failed to parse user cookie:', err)
      }
    }
  }, [])

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        menuItemStyles={menuItemStyles(theme)}
        menuSectionStyles={menuSectionStyles(theme)}
        renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-line' /> }}
      >
        {/* DASHBOARD SECTION */}
        <SubMenu label='Dashboards' icon={<i className='ri-home-smile-line' />}>
          <MenuItem href='/dashboard'>Analytics</MenuItem>
        </SubMenu>

        {/* SERVICES SECTION */}
        <SubMenu label='Services' icon={<i className='ri-file-copy-line' />}>
          <MenuItem href='/appointment-booking'>{role==='Patient'?'Make an Appointment':'Show Appointments'}</MenuItem>
          <MenuItem href='/ai-chat'>Ask AI</MenuItem>
        </SubMenu>
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
