// lib/firebase.js or utils/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAvIBmU0Gjxs9RnNN-NBtVwS_rnCvo4Ta4',
  authDomain: 'docassist-a161f.firebaseapp.com',
  projectId: 'docassist-a161f',
  storageBucket: 'docassist-a161f.firebasestorage.app',
  messagingSenderId: '164046905220',
  appId: '1:164046905220:web:110bdb5fbd317afafcc7d1'
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)

export { auth, db }
