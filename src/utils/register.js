import { db, auth } from '@/utils/firebaseConfig'
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore'
// import { createUserWithEmailAndPassword } from 'firebase/auth'
import toast from 'react-hot-toast'

const saveUserToFirebase = (form, setForm, onSuccessRedirect) => {

  const register = async () => {
    try {
      const usersRef = collection(db, 'users')

      const qEmail = query(usersRef, where('email', '==', form.email.toLowerCase()))
      const emailSnap = await getDocs(qEmail)

      if (!emailSnap.empty) {
        toast.error('This email is already registered.')
        return
      }

      // const userCredential = await createUserWithEmailAndPassword(
      //   auth,
      //   form.email.trim().toLowerCase(),
      //   form.password.trim()
      // )

      // const user = userCredential.user

      const userData = {
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        fullname: form.fullName,
        gender: form.gender,
        password: form.password,
        createdAt: new Date()
      }

      if (form.role === 'Doctor' && form.specialization) {
        userData.specialization = form.specialization.trim()
      }

      await addDoc(usersRef, userData)

      toast.success('User registered successfully! Redirecting to login...')

      setForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        specialization: '',
        fullName: '',
        gender: ''
      })

      setTimeout(() => {
        onSuccessRedirect() // safe redirection
      }, 2000)
    } catch (err) {
      console.error('Error saving user:', err)
      toast.error(err.message || 'Something went wrong while registering!')
    }
  }

  return register()
}

export default saveUserToFirebase
