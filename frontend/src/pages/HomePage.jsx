import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  Smartphone, 
  Apple, 
  ShieldCheck, 
  Zap, 
  SlidersHorizontal,
  PackageOpen,
  Plus
} from 'lucide-react'
import AppCard from '../components/AppCard'
import { realDataService, DEFAULT_CATEGORIES } from '../api/store'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

export default function HomePage({ searchQuery }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const platformParam = searchParams.get('platform') || 'ALL'
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('POPULAR')
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  const { isDark } = useTheme()
  const { iosEnabled } = useSettings()
  const { isAdmin } = useAuth()

  // Load real applications from database/service
  useEffect(() => {
    let mounted = true
    async function loadRealData() {
      setLoading(true)
      try {
        const [realApps, realCats] = await Promise.all([
          realDataService.getApps(),
          realDataService.getCategories()
        ])
        if (mounted) {
          setApps(realApps || [])
          if (realCats && realCats.length > 0) {
            setCategories(realCats)
          }
        }
      } catch (err) {
        console.error('Failed to load apps from database:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadRealData()
    return () => { mounted = false }
  }, [])

  // Reset platform filter if iOS is disabled and current filter is IOS
  const platformFilter = !iosEnabled && platformParam === 'IOS' ? 'ALL' : platformParam

  useEffect(() => {
    if (!iosEnabled && platformParam === 'IOS') {
      searchParams.delete('platform')
      setSearchParams(searchParams)
    }
  }, [iosEnabled, platformParam, searchParams, setSearchParams])

  const handlePlatformChange = (val) => {
    if (val === 'ALL') {
      searchParams.delete('platform')
    } else {
      searchParams.set('platform', val)
    }
    setSearchParams(searchParams)
  }

  // Filter & sort apps from real database
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // If iOS features are globally disabled by Admin, hide ALL iOS apps
      if (!iosEnabled && app.platform === 'IOS') {
        return false
      }
      // Platform filter
      if (platformFilter !== 'ALL' && app.platform !== platformFilter) {
        return false
      }
      // Category filter
      if (selectedCategory !== 'ALL' && app.categorySlug !== selectedCategory) {
        return false
      }
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesName = app.name?.toLowerCase().includes(q)
        const matchesDesc = app.description?.toLowerCase().includes(q)
        const matchesPkg = app.packageName?.toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesPkg) return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === 'POPULAR') return (b.downloadCount || 0) - (a.downloadCount || 0)
      if (sortBy === 'RATING') return (b.rating || 0) - (a.rating || 0)
      return (a.name || '').localeCompare(b.name || '')
    })
  }, [apps, iosEnabled, platformFilter, selectedCategory, searchQuery, sortBy])

  return (
    <div className="space-y-7 pb-16">
      
      {/* Compact Animated Hero Banner */}
      <section className={`relative overflow-hidden py-6 sm:py-7 px-5 sm:px-8 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-indigo-950/40 border-slate-800/80 shadow-lg' 
          : 'bg-white/80 border-slate-300 shadow-sm'
      }`}>
        
        {/* Animated Glow Backdrops */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none animate-float" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Left Text Block */}
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 animate-shimmer">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {iosEnabled 
                  ? 'Direct Android APK & iOS OTA Distribution' 
                  : 'Direct Android APK Sideloading'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
              Download &amp; Sideload <span className="gradient-text">Verified Apps</span>
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
              High-speed direct binary downloads for mobile. SHA-256 cryptographically verified, virus-free, and zero store accounts required.
            </p>
          </div>

          {/* Right Floating Quick Metric Pills */}
          <div className="flex md:flex-col gap-2.5 sm:gap-3 flex-shrink-0">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium animate-float ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-gray-200' : 'bg-slate-100/90 border-slate-300 text-slate-700 shadow-sm'
            }`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>SHA-256 Verified Binaries</span>
            </div>

            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-gray-200' : 'bg-slate-100/90 border-slate-300 text-slate-700 shadow-sm'
            }`}>
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Direct CDN Fast Mirrors</span>
            </div>
          </div>

        </div>
      </section>

      {/* Filter and Switcher Controls */}
      <section className="space-y-4">
        
        {/* Platform switch & sort row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Platform toggle */}
          <div className={`flex items-center p-1 rounded-xl text-xs font-semibold border ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-300 shadow-sm'
          }`}>
            <button
              onClick={() => handlePlatformChange('ALL')}
              className={`px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                platformFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Platforms
            </button>
            <button
              onClick={() => handlePlatformChange('ANDROID')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                platformFilter === 'ANDROID'
                  ? 'bg-emerald-600 text-white shadow'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android APK
            </button>
            {iosEnabled && (
              <button
                onClick={() => handlePlatformChange('IOS')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                  platformFilter === 'IOS'
                    ? 'bg-sky-600 text-white shadow'
                    : isDark ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                iOS OTA
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 text-xs text-gray-400 w-full sm:w-auto justify-end">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none focus:border-blue-500 transition-colors ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-gray-200' 
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="POPULAR">Most Downloaded</option>
              <option value="RATING">Highest Rated</option>
              <option value="NAME">Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-500 font-semibold'
                : isDark 
                  ? 'bg-slate-900/60 border-slate-800 text-gray-400 hover:text-white' 
                  : 'bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 hover:scale-105 active:scale-95 ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-500 font-semibold'
                : isDark 
                  ? 'bg-slate-900/60 border-slate-800 text-gray-400 hover:text-white' 
                  : 'bg-white/80 border-slate-300 text-slate-600 hover:text-slate-900 shadow-sm'
              }`}
            >
              <span>{cat.icon || '📦'}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

      </section>

      {/* Apps Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>Available Applications</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
              isDark ? 'bg-slate-800 text-gray-400' : 'bg-slate-200 text-slate-700'
            }`}>
              {filteredApps.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-mono">Loading applications from database...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${
            isDark ? 'bg-slate-900/40 border-slate-800 text-gray-400' : 'bg-white/80 border-slate-300 text-slate-500'
          }`}>
            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-40 text-indigo-400" />
            <h3 className="text-base font-bold text-gray-200 mb-1">No Applications Published Yet</h3>
            <p className="text-xs max-w-md mx-auto mb-4 opacity-75">
              The platform is connected to your database. Real applications published by the Super Administrator will appear here.
            </p>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-btn shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Publish First Application</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredApps.map((app) => (
              <AppCard key={app.id || app.slug} app={app} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
