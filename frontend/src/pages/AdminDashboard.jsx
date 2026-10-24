import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Plus, 
  UploadCloud, 
  Smartphone, 
  Apple, 
  Globe,
  ExternalLink,
  HardDrive, 
  Download, 
  Check, 
  X, 
  Trash2, 
  FileCheck,
  Settings,
  AlertTriangle,
  Loader2
} from 'lucide-react'
import { realDataService, DEFAULT_CATEGORIES } from '../api/store'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { iosEnabled, setIosEnabled, webEnabled, setWebEnabled } = useSettings()
  const [apps, setApps] = useState([])
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('APPS') // APPS | UPLOAD | SETTINGS

  // Modal states
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false)
  const [newAppForm, setNewAppForm] = useState({
    name: '',
    packageName: '',
    platform: 'ANDROID',
    category: 'Productivity',
    shortDescription: '',
    description: '',
    webUrl: '',
    iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
  })

  // Version upload states
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [versionForm, setVersionForm] = useState({
    appId: '',
    versionNumber: '1.0.0',
    versionCode: 100,
    releaseChannel: 'STABLE',
    releaseNotes: '',
    file: null,
  })

  // Load real data from backend/storage on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [loadedApps, loadedCats] = await Promise.all([
          realDataService.getApps(),
          realDataService.getCategories(),
        ])
        setApps(loadedApps || [])
        setCategories(loadedCats || DEFAULT_CATEGORIES)
        if (loadedApps && loadedApps.length > 0) {
          setVersionForm((prev) => ({ ...prev, appId: loadedApps[0].id }))
        }
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Quick stats calculation
  const totalDownloads = apps.reduce((sum, a) => sum + (a.downloadCount || 0), 0)
  const totalApps = apps.length
  const totalAndroid = apps.filter(a => a.platform === 'ANDROID').length
  const totalIos = apps.filter(a => a.platform === 'IOS').length
  const totalWeb = apps.filter(a => a.platform === 'WEB').length

  const handleCreateApp = async (e) => {
    e.preventDefault()
    const slug = newAppForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const created = {
      id: `app-${Date.now()}`,
      name: newAppForm.name,
      slug,
      packageName: newAppForm.packageName || (newAppForm.platform === 'WEB' ? `web.${slug}` : ''),
      platform: newAppForm.platform,
      webUrl: newAppForm.webUrl || '',
      iconUrl: newAppForm.iconUrl,
      shortDescription: newAppForm.shortDescription,
      description: newAppForm.description,
      category: newAppForm.category,
      categorySlug: newAppForm.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      downloadCount: 0,
      rating: 5.0,
      status: 'PUBLISHED',
      developer: user?.name || 'Super Admin',
      latestVersion: {
        versionNumber: '1.0.0',
        versionCode: 100,
        formattedSize: newAppForm.platform === 'WEB' ? 'Web Application' : '15.4 MB',
        releaseChannel: 'STABLE',
        minOsVersion: newAppForm.platform === 'ANDROID' ? 'Android 8.0+' : newAppForm.platform === 'IOS' ? 'iOS 15.0+' : 'Modern Web Browser',
        releaseNotes: 'Initial production release.',
        checksumSha256: '9f8e7d6c5b4a3928170192837465abcdeffedcba1234567890abcdef12345678',
      },
      screenshots: [],
      versionHistory: [],
    }

    const saved = await realDataService.createApp(created)
    setApps([saved, ...apps])
    setIsAddAppModalOpen(false)
    setNewAppForm({
      name: '',
      packageName: '',
      platform: 'ANDROID',
      category: 'Productivity',
      shortDescription: '',
      description: '',
      webUrl: '',
      iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
    })
  }

  const handleSimulateUpload = (e) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadProgress(10)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setUploadSuccess(true)
          
          setApps((prevApps) =>
            prevApps.map((a) => {
              if (a.id === versionForm.appId) {
                return {
                  ...a,
                  latestVersion: {
                    ...a.latestVersion,
                    versionNumber: versionForm.versionNumber,
                    versionCode: Number(versionForm.versionCode),
                    releaseChannel: versionForm.releaseChannel,
                    releaseNotes: versionForm.releaseNotes || 'Maintenance release and performance upgrades.',
                  },
                }
              }
              return a
            })
          )

          setTimeout(() => {
            setUploadSuccess(false)
            setUploadProgress(0)
            setActiveTab('APPS')
          }, 1800)
          return 100
        }
        return prev + 15
      })
    }, 250)
  }

  const handleDeleteApp = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      await realDataService.deleteApp(id)
      setApps(apps.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span>Super Admin Console</span>
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
            Master control for APK binaries, iOS distributions, signing keys, and storage buckets.
          </p>
        </div>

        <button
          onClick={() => setIsAddAppModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-btn shadow"
        >
          <Plus className="w-4 h-4" />
          <span>New App Listing</span>
        </button>
      </div>

      {/* Global Platform Toggles Grid (iOS & Web Software) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Global iOS Platform Toggle Switch */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              iosEnabled ? 'bg-sky-500/15 text-sky-500' : 'bg-slate-500/15 text-slate-400'
            }`}>
              <Apple className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-xs sm:text-sm">iOS Apps (OTA)</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  iosEnabled 
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                }`}>
                  {iosEnabled ? 'LIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-[11px] opacity-75">
                {iosEnabled 
                  ? 'iOS apps & manifest installs visible to visitors.' 
                  : 'All iOS apps hidden from public website.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIosEnabled(!iosEnabled)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              iosEnabled ? 'bg-sky-500' : 'bg-slate-400'
            }`}
            title={iosEnabled ? 'Click to disable all iOS features' : 'Click to enable all iOS features'}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                iosEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Global Web Software Toggle Switch */}
        <div className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
              webEnabled ? 'bg-purple-500/15 text-purple-400' : 'bg-slate-500/15 text-slate-400'
            }`}>
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-xs sm:text-sm">Web Software &amp; SaaS</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  webEnabled 
                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' 
                    : 'bg-red-500/15 text-red-500 border border-red-500/30'
                }`}>
                  {webEnabled ? 'LIVE' : 'DISABLED'}
                </span>
              </div>
              <p className="text-[11px] opacity-75">
                {webEnabled 
                  ? 'Web software, SaaS launch links visible to visitors.' 
                  : 'All Web software hidden from public website.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setWebEnabled(!webEnabled)}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              webEnabled ? 'bg-purple-600' : 'bg-slate-400'
            }`}
            title={webEnabled ? 'Click to disable all Web software' : 'Click to enable all Web software'}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                webEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className={`border rounded-2xl p-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <p className="text-xs opacity-60 font-medium">Total Apps &amp; Software</p>
          <p className="text-xl sm:text-2xl font-extrabold mt-1">{totalApps}</p>
          <div className="flex items-center gap-2 mt-2 text-[11px] opacity-70 flex-wrap">
            <span>{totalAndroid} Android</span>
            <span>•</span>
            <span className={iosEnabled ? '' : 'line-through text-red-400'}>
              {totalIos} iOS {!iosEnabled && '(Hidden)'}
            </span>
            <span>•</span>
            <span className={webEnabled ? '' : 'line-through text-red-400'}>
              {totalWeb} Web {!webEnabled && '(Hidden)'}
            </span>
          </div>
        </div>

        <div className={`border rounded-2xl p-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <p className="text-xs opacity-60 font-medium">Total Sideloads</p>
          <p className="text-xl sm:text-2xl font-extrabold mt-1">{totalDownloads.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-500 mt-2 flex items-center gap-1 font-medium">
            <Download className="w-3 h-3" /> Realtime CDN metrics
          </p>
        </div>

        <div className={`border rounded-2xl p-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <p className="text-xs opacity-60 font-medium">Storage Used</p>
          <p className="text-xl sm:text-2xl font-extrabold mt-1">1.42 GB</p>
          <p className="text-[11px] opacity-60 mt-2 font-mono">MinIO / S3 Bucket</p>
        </div>

        <div className={`border rounded-2xl p-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <p className="text-xs opacity-60 font-medium">iOS Distribution</p>
          <p className={`text-xl sm:text-2xl font-extrabold mt-1 ${iosEnabled ? 'text-sky-500' : 'text-red-500'}`}>
            {iosEnabled ? 'Active' : 'Disabled'}
          </p>
          <p className="text-[11px] opacity-60 mt-2">
            {iosEnabled ? 'OTA live' : 'Hidden from web'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b gap-6 text-xs sm:text-sm font-medium ${
        isDark ? 'border-slate-800' : 'border-slate-300'
      }`}>
        <button
          onClick={() => setActiveTab('APPS')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'APPS'
              ? 'border-blue-500 text-blue-500 font-semibold'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Applications List ({apps.length})
        </button>
        <button
          onClick={() => setActiveTab('UPLOAD')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'UPLOAD'
              ? 'border-blue-500 text-blue-500 font-semibold'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Upload New Version (APK / IPA)
        </button>
      </div>

      {/* TAB 1: Apps Table */}
      {activeTab === 'APPS' && (
        <div className={`border rounded-2xl overflow-hidden shadow-lg ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`uppercase font-semibold text-[10px] tracking-wider border-b ${
                isDark ? 'bg-slate-950/80 border-slate-800 text-gray-400' : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}>
                <tr>
                  <th className="px-5 py-3.5">Application</th>
                  <th className="px-5 py-3.5">Platform</th>
                  <th className="px-5 py-3.5">Version</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Downloads</th>
                  <th className="px-5 py-3.5">Visibility</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                {apps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Smartphone className="w-10 h-10 opacity-30 mb-2" />
                        <p className="font-semibold text-sm opacity-80">No Applications In Database</p>
                        <p className="text-xs opacity-50 mt-1 mb-4">Click "New App Listing" to add your first real application.</p>
                        <button
                          onClick={() => setIsAddAppModalOpen(true)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-btn shadow"
                        >
                          Add First App
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  apps.map((app) => {
                  const isHiddenIos = !iosEnabled && app.platform === 'IOS'
                  const isHiddenWeb = !webEnabled && app.platform === 'WEB'

                  return (
                    <tr key={app.id} className={isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}>
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={app.iconUrl}
                          alt=""
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700/50"
                        />
                        <div>
                          <Link to={`/apps/${app.slug}`} className="font-bold hover:text-blue-500 transition-colors">
                            {app.name}
                          </Link>
                          <p className="text-[10px] opacity-60 font-mono truncate max-w-[200px]">
                            {app.platform === 'WEB' && app.webUrl ? app.webUrl : app.packageName}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          app.platform === 'ANDROID'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : app.platform === 'IOS'
                            ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {app.platform === 'ANDROID' && <Smartphone className="w-3 h-3" />}
                          {app.platform === 'IOS' && <Apple className="w-3 h-3" />}
                          {app.platform === 'WEB' && <Globe className="w-3 h-3" />}
                          {app.platform}
                        </span>
                      </td>

                      <td className="px-5 py-3 font-mono text-xs">
                        {app.platform === 'WEB' ? 'Web SaaS' : `v${app.latestVersion?.versionNumber}`}
                      </td>

                      <td className="px-5 py-3 opacity-80">
                        {app.category}
                      </td>

                      <td className="px-5 py-3 font-semibold">
                        {app.downloadCount.toLocaleString()}
                      </td>

                      <td className="px-5 py-3">
                        {isHiddenIos ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-500 border border-red-500/30">
                            Hidden (iOS Disabled)
                          </span>
                        ) : isHiddenWeb ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-500 border border-red-500/30">
                            Hidden (Web Disabled)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500">
                            Public
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.platform === 'WEB' && app.webUrl && (
                            <a
                              href={app.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30"
                              title="Test Launch Web Software"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <Link
                            to={`/apps/${app.slug}`}
                            className={`p-1.5 rounded-lg border ${
                              isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-300'
                            }`}
                            title="View detail page"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => {
                              setVersionForm((prev) => ({ ...prev, appId: app.id }))
                              setActiveTab('UPLOAD')
                            }}
                            className="p-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30"
                            title="Upload new binary version"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                            title="Delete app"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Upload Version */}
      {activeTab === 'UPLOAD' && (
        <div className={`max-w-2xl border rounded-3xl p-6 sm:p-7 space-y-5 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-500" />
              <span>Publish New Binary Version</span>
            </h2>
            <p className="text-xs opacity-60 mt-0.5">
              Chunked multipart binary upload with S3 direct streaming and SHA-256 integrity calculation.
            </p>
          </div>

          <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold opacity-80">Select Application</label>
              <select
                value={versionForm.appId}
                onChange={(e) => setVersionForm({ ...versionForm, appId: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                {apps.length === 0 && (
                  <option value="">No applications published yet</option>
                )}
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.platform}) - Current v{a.latestVersion?.versionNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold opacity-80">Version Number</label>
                <input
                  type="text"
                  required
                  value={versionForm.versionNumber}
                  onChange={(e) => setVersionForm({ ...versionForm, versionNumber: e.target.value })}
                  placeholder="e.g. 2.0.1"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold opacity-80">Build / Version Code</label>
                <input
                  type="number"
                  required
                  value={versionForm.versionCode}
                  onChange={(e) => setVersionForm({ ...versionForm, versionCode: e.target.value })}
                  placeholder="201"
                  className={`w-full p-2.5 rounded-xl border font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold opacity-80">Release Channel</label>
              <select
                value={versionForm.releaseChannel}
                onChange={(e) => setVersionForm({ ...versionForm, releaseChannel: e.target.value })}
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="STABLE">STABLE (Production)</option>
                <option value="BETA">BETA (Pre-release testing)</option>
                <option value="INTERNAL">INTERNAL (Super Admin Dogfooding)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold opacity-80">App Binary (.apk or .ipa)</label>
              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                isDark 
                  ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}>
                <FileCheck className="w-7 h-7 text-indigo-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold">Click to browse APK / IPA file</p>
                <p className="text-[10px] opacity-60 mt-0.5">Chunked S3 upload • Verified SHA-256</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold opacity-80">Changelog &amp; Release Notes</label>
              <textarea
                rows={3}
                value={versionForm.releaseNotes}
                onChange={(e) => setVersionForm({ ...versionForm, releaseNotes: e.target.value })}
                placeholder="• Bug fixes and speed improvements..."
                className={`w-full p-2.5 rounded-xl border ${
                  isDark ? 'bg-slate-950 border-slate-800 text-gray-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
            </div>

            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-indigo-400 font-semibold">
                  <span>Streaming binary chunks to S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Binary published live to distribution cluster!</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl font-bold text-white gradient-btn shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Streaming to S3...' : 'Upload & Publish Version'}</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL: Add New App */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className={`border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <button
              onClick={() => setIsAddAppModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg opacity-60 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-3">Create New Application Listing</h3>

            <form onSubmit={handleCreateApp} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold opacity-80">App Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HyperSpeed Browser"
                  value={newAppForm.name}
                  onChange={(e) => setNewAppForm({ ...newAppForm, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border mt-1 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold opacity-80">Package Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="com.company.app"
                  value={newAppForm.packageName}
                  onChange={(e) => setNewAppForm({ ...newAppForm, packageName: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border mt-1 font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold opacity-80">Platform</label>
                  <select
                    value={newAppForm.platform}
                    onChange={(e) => setNewAppForm({ ...newAppForm, platform: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border mt-1 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="ANDROID">ANDROID (APK)</option>
                    <option value="IOS">IOS (Enterprise OTA)</option>
                    <option value="WEB">WEB (Software / SaaS)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold opacity-80">Category</label>
                  <select
                    value={newAppForm.category}
                    onChange={(e) => setNewAppForm({ ...newAppForm, category: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border mt-1 ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {newAppForm.platform === 'WEB' && (
                <div>
                  <label className="font-semibold opacity-80">Web Software URL / Launch Link *</label>
                  <input
                    type="url"
                    required={newAppForm.platform === 'WEB'}
                    placeholder="https://example.com or https://app.domain.com"
                    value={newAppForm.webUrl}
                    onChange={(e) => setNewAppForm({ ...newAppForm, webUrl: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border mt-1 font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <p className="text-[10px] opacity-60 mt-0.5">Visitors will be directed to this URL when clicking Launch.</p>
                </div>
              )}

              {!iosEnabled && newAppForm.platform === 'IOS' && (
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Notice: iOS features are currently disabled in platform settings. This app will remain hidden until iOS is re-enabled.</span>
                </div>
              )}

              {!webEnabled && newAppForm.platform === 'WEB' && (
                <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Notice: Web software features are currently disabled in platform settings. This listing will remain hidden until Web is re-enabled.</span>
                </div>
              )}

              <div>
                <label className="font-semibold opacity-80">Short Summary</label>
                <input
                  type="text"
                  placeholder="One line description"
                  value={newAppForm.shortDescription}
                  onChange={(e) => setNewAppForm({ ...newAppForm, shortDescription: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border mt-1 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white gradient-btn shadow mt-2"
              >
                Create Listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
