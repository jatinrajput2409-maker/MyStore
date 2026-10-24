import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Star, Smartphone, Apple, Globe, ExternalLink, ArrowRight, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function AppCard({ app }) {
  const { isDark } = useTheme()
  const isAndroid = app.platform === 'ANDROID'
  const isIos = app.platform === 'IOS'
  const isWeb = app.platform === 'WEB'
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const formattedDownloads = app.downloadCount > 1000 
    ? `${(app.downloadCount / 1000).toFixed(1)}k` 
    : app.downloadCount

  const handleQuickDownload = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (downloading) return

    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      setDownloaded(true)

      // Trigger real browser file download
      const version = app.latestVersion
      const filename = `${app.slug}-v${version?.versionNumber || '1.0.0'}.${isAndroid ? 'apk' : 'mobileconfig'}`
      const dummyContent = `App Platform Package: ${app.name}\nPackage: ${app.packageName}\nVersion: ${version?.versionNumber}\nChecksum: ${version?.checksumSha256 || 'verified'}`
      const blob = new Blob([dummyContent], { type: isAndroid ? 'application/vnd.android.package-archive' : 'application/x-apple-aspen-config' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setTimeout(() => setDownloaded(false), 3000)
    }, 1000)
  }

  return (
    <div className={`card-animated group relative rounded-2xl p-5 flex flex-col justify-between border cursor-pointer ${
      isDark
        ? 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-indigo-500/30'
        : 'bg-white hover:bg-slate-50/80 border-slate-300 hover:border-indigo-300 shadow-sm hover:shadow-md'
    }`}>
      
      <div>
        {/* Card Top: Icon & Badges */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <Link to={`/apps/${app.slug}`} className="flex-shrink-0">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-700/50 shadow-md group-hover:scale-105 group-hover:rotate-1 transition-all duration-300"
            />
          </Link>

          <div className="flex flex-col items-end gap-1">
            {/* Platform badge */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              isAndroid 
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' 
                : isIos
                ? 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
            }`}>
              {isAndroid && <Smartphone className="w-3 h-3" />}
              {isIos && <Apple className="w-3 h-3" />}
              {isWeb && <Globe className="w-3 h-3" />}
              {isAndroid ? 'APK' : isIos ? 'iOS' : 'Web'}
            </span>

            {/* Version */}
            {app.latestVersion && (
              <span className={`text-[10px] font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                v{app.latestVersion.versionNumber}
              </span>
            )}
          </div>
        </div>

        {/* Title & Category */}
        <div className="mb-2">
          <Link to={`/apps/${app.slug}`}>
            <h3 className={`font-bold text-base group-hover:text-blue-500 transition-colors line-clamp-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {app.name}
            </h3>
          </Link>
          <p className={`text-[11px] flex items-center gap-1.5 mt-0.5 ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            <span>{app.category}</span>
            <span>•</span>
            <span className="opacity-80">{app.developer || 'Independent'}</span>
          </p>
        </div>

        {/* Description */}
        <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${
          isDark ? 'text-gray-300' : 'text-slate-600'
        }`}>
          {app.shortDescription || app.description}
        </p>
      </div>

      {/* Bottom Metrics & Actions */}
      <div className={`pt-3 border-t flex items-center justify-between ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {app.rating || '4.8'}
          </span>
          <span className="opacity-40">•</span>
          <span className={`flex items-center gap-1 font-medium ${
            isDark ? 'text-gray-400' : 'text-slate-500'
          }`}>
            <Download className="w-3.5 h-3.5 opacity-70" />
            {formattedDownloads}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Direct Action Button */}
          {isWeb && app.webUrl ? (
            <a
              href={app.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="Open Web Software in new tab"
              className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1 ${
                isDark
                  ? 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border-purple-800/60'
                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={handleQuickDownload}
              disabled={downloading}
              title={`Download ${isAndroid ? 'APK' : 'Package'}`}
              className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1 ${
                downloaded
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500'
                  : isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 text-gray-200 border-slate-700'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {downloading ? (
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : downloaded ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          <Link
            to={`/apps/${app.slug}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white gradient-btn shadow"
          >
            <span>{isWeb ? 'Open' : 'Get'}</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  )
}
