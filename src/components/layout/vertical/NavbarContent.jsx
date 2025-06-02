'use client'
// Next Imports
import Link from 'next/link'

// MUI Imports
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import classnames from 'classnames'

// Component Imports
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

import { useEffect, useState } from 'react'

import { db } from '@/utils/firebaseConfig'
import { collection, query, where, getDocs } from 'firebase/firestore'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  const [role, setRole] = useState('')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const cookies = document.cookie.split('; ')
    const userCookie = cookies.find(cookie => cookie.startsWith('user_role'))
    const idCookie = cookies.find(cookie => cookie.startsWith('user_id'))

    const role = userCookie?.split('=')[1] || ''
    const userId = idCookie?.split('=')[1] || ''

    setRole(role)

    if (role === 'Doctor' && userId) {
      const fetchPendingAppointments = async () => {
        try {
          const q = query(
            collection(db, 'appointments'),
            where('doctorId', '==', userId),
            where('status', '==', 'pending')
          )
          const snapshot = await getDocs(q)
          setPendingCount(snapshot.size)
        } catch (err) {
          console.error('Failed to fetch pending appointments:', err)
        }
      }

      fetchPendingAppointments()
    }
  }, [])

  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, 'flex items-center justify-between gap-4 is-full')}>
      <div className='flex items-center gap-2 sm:gap-4'>
        <NavToggle />
        <NavSearch />
      </div>

      <div className='flex items-center gap-4 px-3 py-2 text-base'>
        {role && (
          <div className='px-4 py-2 text-base font-medium text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm'>
            <span className='text-gray-500 mr-1'>Role:</span> {role}
          </div>
        )}

        <ModeDropdown />
        {role === 'Doctor' && (
          <Link href='/appointment-booking'>
            <div className='relative'>
              <IconButton className='text-textPrimary text-xl'>
                <i className='ri-notification-2-line' />
              </IconButton>
              {pendingCount > 0 && (
                <span className='absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2'>
                  {pendingCount}
                </span>
              )}
            </div>
          </Link>
        )}
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
