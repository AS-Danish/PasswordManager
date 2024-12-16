import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SignIn, SignUp, SignedIn, SignedOut, useAuth, RedirectToSignIn } from '@clerk/clerk-react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'
import PasswordManager from './components/PasswordManager'

// Landing page component
const Landing = ({ isMenuOpen, setIsMenuOpen }) => {
  const { isSignedIn } = useAuth()
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <>
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
      <Hero />
      <Features />
      <About />
      <Contact />
      <Footer />
    </>
  )
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth()
  
  if (!isLoaded) {
    return <div>Loading...</div>
  }
  
  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return children
}

// Auth Layout Component
const AuthLayout = ({ children }) => {
  const { isSignedIn } = useAuth()
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <a href="/" className="inline-flex items-center space-x-2">
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            SecurePass
          </span>
        </a>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/" 
          element={<Landing isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />}
        />

        {/* Auth Routes */}
        <Route
          path="/sign-in/*"
          element={
            <AuthLayout>
              <SignIn 
                routing="path" 
                path="/sign-in" 
                signUpUrl="/sign-up"
                redirectUrl="/dashboard"
                appearance={{
                  elements: {
                    formButtonPrimary: 
                      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                    footerActionLink: "text-indigo-600 hover:text-indigo-500"
                  }
                }}
              />
            </AuthLayout>
          }
        />
        
        <Route
          path="/sign-up/*"
          element={
            <AuthLayout>
              <SignUp 
                routing="path" 
                path="/sign-up" 
                signInUrl="/sign-in"
                redirectUrl="/dashboard"
                appearance={{
                  elements: {
                    formButtonPrimary: 
                      "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700",
                    footerActionLink: "text-indigo-600 hover:text-indigo-500"
                  }
                }}
              />
            </AuthLayout>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PasswordManager />
            </ProtectedRoute>
          }
        />

        {/* Redirect based on auth state */}
        <Route
          path="*"
          element={
            isSignedIn ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/sign-in" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App 