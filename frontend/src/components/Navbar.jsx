import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Smartphone, 
  Apple, 
  Search, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Sparkles,
  Shield
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

export default function Navbar({ onSearch, searchQuery }) {
  const { isAdmin, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { iosEnabled } = useSettings()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:rotate-6 transition-transform duration-300">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight flex items-center gap-1.5 transition-colors">
                MyStore <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/25 font-semibold">Distro</span>
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search apps, games, packages..."
                value={searchQuery || ''}
                onChange={(e) => onSearch?.(e.target.value)}
                className={`w-full pl-10 pr-4 py-1.5 rounded-xl text-xs transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-slate-900/90 border border-slate-800 text-gray-200 placeholder-gray-500 focus:border-blue-500'
                    : 'bg-white/90 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500 shadow-sm'
                }`}
              />
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              to="/?platform=ANDROID"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-slate-800/80' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Android APK</span>
            </Link>

            {/* iOS link only shown if iOS distribution is active */}
            {iosEnabled && (
              <Link 
                to="/?platform=IOS"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-slate-800/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <Apple className="w-3.5 h-3.5 text-sky-500" />
                <span>iOS OTA</span>
              </Link>
            )}

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:rotate-45'
                  : 'bg-slate-200/80 hover:bg-slate-300 text-indigo-600 hover:-rotate-45'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* ONLY visible if Super Admin is ALREADY authenticated. Regular users see NO login button! */}
            {isAdmin && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all font-semibold"
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Admin Console</span>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                  }}
                  title="Logout Super Admin"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>

          {/* Mobile Right Controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-1.5 rounded-lg ${
                isDark ? 'text-amber-400 bg-slate-800' : 'text-indigo-600 bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800/80 space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery || ''}
                onChange={(e) => onSearch?.(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-gray-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              />
            </div>

            <div className={`grid ${iosEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1`}>
              <Link 
                to="/?platform=ANDROID"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs ${
                  isDark ? 'bg-slate-900 text-gray-300' : 'bg-slate-200 text-slate-700'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Android</span>
              </Link>
              {iosEnabled && (
                <Link 
                  to="/?platform=IOS"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-center gap-1.5 p-2 rounded-lg text-xs ${
                    isDark ? 'bg-slate-900 text-gray-300' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  <Apple className="w-3.5 h-3.5 text-sky-400" />
                  <span>iOS</span>
                </Link>
              )}
            </div>

            {/* Only shown if Super Admin is already logged in */}
            {isAdmin && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Console</span>
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="text-xs text-red-400 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  )
}
