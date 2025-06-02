import { collection, query, where, getDocs } from 'firebase/firestore'
import toast from 'react-hot-toast'

import { db } from '@/utils/firebaseConfig'

const fetchDoctors = async (specialization = '') => {
  try {
    const usersRef = collection(db, 'users')

    let q

    if (specialization) {
      q = query(usersRef, where('role', '==', 'Doctor'), where('specialization', '==', specialization))
    } else {
      q = query(usersRef, where('role', '==', 'Doctor'))
    }

    const querySnapshot = await getDocs(q)

    // Map results to array of doctors
    const doctors = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return doctors
  } catch (error) {
    console.error('Error fetching doctors:', error)
    toast.error('Failed to fetch doctors.')
    
return []
  }
}

export default fetchDoctors
