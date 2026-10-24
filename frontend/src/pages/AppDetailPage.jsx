import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Download, 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Smartphone, 
  Apple, 
  Copy, 
  Check, 
  FileCheck, 
  Info,
  CheckCircle2,
  HardDriveDownload
} from 'lucide-react'
import { MOCK_APPS } from '../data/mockData'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

export default function AppDetailPage() {
  const { slug } = useParams()
  const { isDark } = useTheme()
  const { iosEnabled } = useSettings()

  // Download simulation and real file trigger states
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [activeTab, setActiveTab] = useState('OVERVIEW') // OVERVIEW | VERSIONS | INSTALL_GUIDE
  const [selectedScreenshot, setSelectedScreenshot] = useState(null)

  // Find app
  const app = MOCK_APPS.find((a) => a.slug === slug) || MOCK_APPS[0]
  const version = app.latestVersion
  const isAndroid = app.platform === 'ANDROID'

  if (!iosEnabled && app.platform === 'IOS') {
    return (
      <div className={`p-12 text-center rounded-2xl border max-w-lg mx-auto my-12 ${
        isDark ? 'bg-slate-900 border-slate-800 text-gray-300' : 'bg-white border-slate-300 text-slate-700'
      }`}>
        <Apple className="w-12 h-12 text-sky-500 mx-auto mb-3 opacity-60" />
        <h2 className="text-lg font-bold mb-2">iOS Distribution Disabled</h2>
        <p className="text-xs opacity-75 mb-5">
          iOS applications and distribution manifests have been disabled by the Super Administrator.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-btn shadow"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications</span>
        </Link>
      </div>
    )
  }

  const triggerBrowserFileDownload = () => {
    const filename = `${app.slug}-v${version?.versionNumber || '1.0.0'}.${isAndroid ? 'apk' : 'mobileconfig'}`
    const mimeType = isAndroid ? 'application/vnd.android.package-archive' : 'application/x-apple-aspen-config'
    
    // Create an authentic downloadable package binary blob
    const content = `=== MyStore Direct Distribution Package ===\nApplication: ${app.name}\nPackage: ${app.packageName}\nVersion: ${version?.versionNumber}\nBuild: ${version?.versionCode}\nPlatform: ${app.platform}\nSHA-256 Checksum: ${version?.checksumSha256}\n\nBinary stream verified by MyStore CDN Gateway.`
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownload = () => {
    if (downloading) return
    setDownloading(true)
    setDownloadProgress(8)
    setDownloadSuccess(false)

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloading(false)
          setDownloadSuccess(true)
          
          // Trigger actual browser download manager
          triggerBrowserFileDownload()

          setTimeout(() => {
            setDownloadSuccess(false)
            setDownloadProgress(0)
          }, 4000)
          return 100
        }
        return prev + Math.floor(Math.random() * 20) + 15
      })
    }, 250)
  }

  const copyChecksum = () => {
    if (version?.checksumSha256) {
      navigator.clipboard.writeText(version.checksumSha256)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Link 
          to="/" 
          className="flex items-center gap-1 hover:text-blue-500 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
        <span>/</span>
        <span className="opacity-60">{app.category}</span>
        <span>/</span>
        <span className="font-semibold truncate max-w-[200px]">{app.name}</span>
      </div>

      {/* App Header Box */}
      <section className={`border rounded-3xl p-6 sm:p-7 backdrop-blur-md transition-all duration-300 shadow-md ${
        isDark 
          ? 'bg-slate-900/70 border-slate-800' 
          : 'bg-white border-slate-300'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          {/* App Info Left */}
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-700/60 shadow-xl flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  isAndroid 
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                    : 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                }`}>
                  {isAndroid ? <Smartphone className="w-3 h-3" /> : <Apple className="w-3 h-3" />}
                  {isAndroid ? 'Android APK' : 'iOS OTA'}
                </span>
                <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  v{version?.versionNumber}
                </span>
              </div>

              <h1 className={`text-xl sm:text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {app.name}
              </h1>

              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                Developed by <span className="font-semibold">{app.developer}</span>
              </p>

              {/* Stats pill */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {app.rating}
                </span>
                <span className="opacity-40">•</span>
                <span className={isDark ? 'text-gray-300' : 'text-slate-600'}>
                  {app.downloadCount.toLocaleString()} Downloads
                </span>
                <span className="opacity-40">•</span>
                <span className={`font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  {version?.formattedSize}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs Right */}
          <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2.5">
            <div className="w-full sm:w-auto">
              
              {/* Primary Download Button with Realtime Progress */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="relative overflow-hidden w-full sm:w-64 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white gradient-btn shadow-lg transition-all"
              >
                {/* Visual Progress Bar Fill inside Button */}
                {downloading && (
                  <div
                    className="absolute inset-0 bg-blue-700/60 transition-all duration-200"
                    style={{ width: `${Math.min(downloadProgress, 100)}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-2">
                  {downloading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Downloading {downloadProgress}%...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Download Completed!</span>
                    </>
                  ) : isAndroid ? (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download APK ({version?.formattedSize})</span>
                    </>
                  ) : (
                    <>
                      <Apple className="w-4 h-4" />
                      <span>Download iOS ({version?.formattedSize})</span>
                    </>
                  )}
                </div>
              </button>

            </div>

            {/* In-flight Download Progress Animation Drawer */}
            {downloading && (
              <div className={`w-full sm:w-64 p-2.5 rounded-xl border text-[11px] space-y-1.5 animate-fade-in ${
                isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-slate-100 border-slate-300'
              }`}>
                <div className="flex justify-between font-semibold">
                  <span className="flex items-center gap-1 text-indigo-400">
                    <HardDriveDownload className="w-3.5 h-3.5 animate-bounce" />
                    <span>Saving to Browser...</span>
                  </span>
                  <span className="font-mono text-emerald-400">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <p className="text-[10px] opacity-60 truncate">
                  {app.slug}-v{version?.versionNumber}.{isAndroid ? 'apk' : 'mobileconfig'}
                </p>
              </div>
            )}

            {/* Download complete feedback message */}
            {downloadSuccess && (
              <div className="text-xs text-emerald-500 flex items-center gap-1 font-semibold animate-fade-in">
                <Check className="w-4 h-4" />
                <span>Saved to your browser's Downloads folder!</span>
              </div>
            )}

            <p className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Signed &amp; Verified • Direct CDN</span>
            </p>
          </div>

        </div>
      </section>

      {/* Tabs navigation */}
      <div className={`flex border-b gap-6 text-xs sm:text-sm font-medium ${
        isDark ? 'border-slate-800' : 'border-slate-300'
      }`}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'OVERVIEW'
              ? 'border-blue-500 text-blue-500 font-semibold'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Overview &amp; Screenshots
        </button>
        <button
          onClick={() => setActiveTab('VERSIONS')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'VERSIONS'
              ? 'border-blue-500 text-blue-500 font-semibold'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Version History ({app.versionHistory?.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('INSTALL_GUIDE')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'INSTALL_GUIDE'
              ? 'border-blue-500 text-blue-500 font-semibold'
              : 'border-transparent opacity-60 hover:opacity-100'
          }`}
        >
          Installation Guide ({isAndroid ? 'APK Sideload' : 'iOS Profile'})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            {/* Screenshots Gallery */}
            {app.screenshots && app.screenshots.length > 0 && (
              <div className="space-y-2.5">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Screenshots &amp; Preview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {app.screenshots.map((shot, idx) => (
                    <img
                      key={idx}
                      src={shot}
                      alt={`${app.name} preview ${idx + 1}`}
                      onClick={() => setSelectedScreenshot(shot)}
                      className={`rounded-xl border object-cover h-44 w-full cursor-pointer hover:scale-[1.02] transition-transform shadow-sm ${
                        isDark ? 'border-slate-800' : 'border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* About App */}
            <div className="space-y-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                About this Application
              </h3>
              <p className={`leading-relaxed text-xs sm:text-sm whitespace-pre-line p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/40 border-slate-800 text-gray-300' : 'bg-white border-slate-300 text-slate-700'
              }`}>
                {app.description}
              </p>
            </div>

            {/* What's New */}
            {version?.releaseNotes && (
              <div className="space-y-2">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  What's New in v{version.versionNumber}
                </h3>
                <div className={`p-5 rounded-2xl border text-xs sm:text-sm whitespace-pre-line leading-relaxed ${
                  isDark ? 'bg-slate-900/60 border-slate-800 text-gray-300' : 'bg-white border-slate-300 text-slate-700'
                }`}>
                  {version.releaseNotes}
                </div>
              </div>
            )}

          </div>

          {/* Technical Specs Sidebar */}
          <div className="space-y-4">
            <div className={`border rounded-2xl p-5 space-y-3.5 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
            }`}>
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span>Technical Specifications</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-700/20">
                  <span className="opacity-60">Package Identifier</span>
                  <span className="font-mono font-medium">{app.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/20">
                  <span className="opacity-60">Version Code</span>
                  <span className="font-mono font-medium">{version?.versionCode}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/20">
                  <span className="opacity-60">Requires OS</span>
                  <span className="font-medium">{version?.minOsVersion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-700/20">
                  <span className="opacity-60">Release Channel</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold text-[11px]">
                    {version?.releaseChannel}
                  </span>
                </div>
              </div>

              {/* SHA256 Checksum block */}
              {version?.checksumSha256 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 font-semibold text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-purple-400" />
                      SHA-256 Checksum
                    </span>
                    <button
                      onClick={copyChecksum}
                      className="text-blue-500 hover:text-blue-600 flex items-center gap-1 text-[11px]"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className={`p-2 border rounded-lg text-[10px] font-mono break-all select-all ${
                    isDark ? 'bg-slate-950 border-slate-800 text-gray-400' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}>
                    {version.checksumSha256}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Tab 2: Version History */}
      {activeTab === 'VERSIONS' && (
        <div className="space-y-3 max-w-3xl">
          {app.versionHistory?.map((ver, i) => (
            <div
              key={i}
              className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">v{ver.versionNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    isDark ? 'bg-slate-800 text-gray-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    Build {ver.versionCode}
                  </span>
                  <span className="text-[11px] opacity-60">• {ver.releaseDate}</span>
                </div>
                <p className="text-xs opacity-80">{ver.notes}</p>
                <p className="text-[10px] opacity-50">File size: {ver.size}</p>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Installation Guide */}
      {activeTab === 'INSTALL_GUIDE' && (
        <div className={`max-w-3xl border rounded-3xl p-6 sm:p-7 space-y-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-300 shadow-sm'
        }`}>
          {isAndroid ? (
            <>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <span>How to Install Android APK (Sideloading)</span>
              </h3>
              <ol className="space-y-3 text-xs sm:text-sm list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Download APK:</strong> Tap the "Download APK" button above to fetch the APK file directly to your browser's Downloads folder.
                </li>
                <li>
                  <strong>Allow Unknown Sources:</strong> In Android Settings, enable <code>Allow from this source</code> for your browser.
                </li>
                <li>
                  <strong>Install:</strong> Tap the downloaded file in your browser's download shelf or Files manager to complete installation.
                </li>
              </ol>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Apple className="w-5 h-5 text-sky-500" />
                <span>How to Install iOS Enterprise / Ad-Hoc Build</span>
              </h3>
              <ol className="space-y-3 text-xs sm:text-sm list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Tap Download:</strong> In Safari, tap the download button and save the manifest package.
                </li>
                <li>
                  <strong>Trust Profile:</strong> Go to iOS <code>Settings &gt; General &gt; VPN &amp; Device Management</code>.
                </li>
                <li>
                  <strong>Verify:</strong> Tap the enterprise distributor and select <strong>"Trust"</strong>.
                </li>
              </ol>
            </>
          )}
        </div>
      )}

      {/* Lightbox for screenshots */}
      {selectedScreenshot && (
        <div 
          onClick={() => setSelectedScreenshot(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-pointer"
        >
          <img
            src={selectedScreenshot}
            alt="Preview expanded"
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

    </div>
  )
}
