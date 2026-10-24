import { createContext, useContext, useState, useEffect } from 'react'
import apiClient from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      const data = res.data.data
      setToken(data.token)
      setUser(data.user)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true }
    } catch (err) {
      // Demo fallback if backend is offline
      if (email === 'admin@example.com' && password === 'admin123') {
        const demoUser = {
          id: 'demo-admin',
          email: 'admin@example.com',
          name: 'Platform Admin',
          role: 'ADMIN',
        }
        const demoToken = 'demo-jwt-token'
        setToken(demoToken)
        setUser(demoUser)
        localStorage.setItem('token', demoToken)
        localStorage.setItem('user', JSON.stringify(demoUser))
        return { success: true }
      }
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Login failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (email, password, name) => {
    setLoading(true)
    try {
      const res = await apiClient.post('/auth/register', { email, password, name })
      return { success: true }
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Registration failed',
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
