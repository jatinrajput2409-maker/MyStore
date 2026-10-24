import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, ArrowRight, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(email, password)
    if (res.success) {
      navigate('/admin')
    } else {
      setError(res.error)
    }
  }

  const handleDemoSuperAdminFill = async () => {
    setEmail('admin@example.com')
    setPassword('admin123')
    setError('')
    const res = await login('admin@example.com', 'admin123')
    if (res.success) {
      navigate('/admin')
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className={`max-w-md w-full space-y-7 rounded-3xl p-8 border backdrop-blur-xl shadow-2xl relative transition-all duration-300 ${
        isDark 
          ? 'bg-slate-900/85 border-slate-800 shadow-indigo-500/5' 
          : 'bg-white/95 border-slate-200 shadow-xl'
      }`}>
        
        {/* Subtle glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl gradient-btn mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Super Admin Portal
          </h2>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Restricted administrative gateway for platform management
          </p>
        </div>

        {/* Security badge notice */}
        <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
          isDark 
            ? 'bg-slate-950/60 border-slate-800 text-gray-400' 
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <KeyRound className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Public user accounts are disabled. Only the platform Super Admin can access this console.</span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Super Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-slate-950 border border-slate-800 text-gray-100 placeholder-gray-500 focus:border-blue-500' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>
              Secret Key / Master Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-slate-950 border border-slate-800 text-gray-100 placeholder-gray-500 focus:border-blue-500' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white gradient-btn shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Authenticate as Super Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Super Admin Quick Demo Login */}
        <div className={`pt-4 border-t text-center space-y-2 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
          <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
            Quick Evaluation / Test Key
          </p>
          <button
            type="button"
            onClick={handleDemoSuperAdminFill}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              isDark
                ? 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>1-Click Super Admin Sign In</span>
          </button>
        </div>

      </div>
    </div>
  )
}
