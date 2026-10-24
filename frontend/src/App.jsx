import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { SettingsProvider } from './context/SettingsContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AppDetailPage from './pages/AppDetailPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'

function ProtectedAdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />
  }
  return children
}

function MainLayout() {
  const [searchQuery, setSearchQuery] = useState('')
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 selection:bg-indigo-500 selection:text-white ${
      isDark ? 'bg-[#090d16] text-slate-100' : 'bg-[#eaedf2] text-slate-800'
    }`}>
      {/* Top sticky navbar */}
      <Navbar onSearch={setSearchQuery} searchQuery={searchQuery} />

      {/* Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/apps/:slug" element={<AppDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <MainLayout />
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
