// Third-party Imports
// import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] }) // You can also add `variable: '--font-inter'` for CSS var usage


export const metadata = {
  title: 'DocAssist',
  description: ''
}

const RootLayout = ({ children }) => {
  const direction = 'ltr'

   return (
    <html id='__next' lang='en' dir={direction}>
      {/* ✅ Apply the font class here */}
      <body className={`${inter.className} flex is-full min-bs-full flex-auto flex-col`}>
        <Toaster position='top-right' toastOptions={{ duration: 3000 }} />
        {children}
      </body>
    </html>
  )
}

export default RootLayout


