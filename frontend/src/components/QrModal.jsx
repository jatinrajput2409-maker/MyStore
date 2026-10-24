import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Copy, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function QrModal({ isOpen, onClose, app, version }) {
  const [copied, setCopied] = useState(false)
  const { isDark } = useTheme()

  if (!isOpen || !app) return null

  // URL for mobile device to download directly
  const downloadUrl = app.platform === 'IOS' && version?.manifestUrl
    ? version.manifestUrl
    : `${window.location.origin}/apps/${app.slug}`

  const handleCopy = () => {
    navigator.clipboard.writeText(downloadUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className={`border rounded-3xl max-w-sm w-full p-6 shadow-2xl relative transition-all duration-300 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={app.iconUrl}
            alt={app.name}
            className="w-11 h-11 rounded-xl object-cover border border-slate-700/50 shadow-md"
          />
          <div>
            <h3 className="font-bold text-sm leading-tight">{app.name}</h3>
            <p className="text-[11px] opacity-60">
              v{version?.versionNumber || 'Latest'} • {app.platform}
            </p>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-slate-200">
          <QRCodeSVG
            value={downloadUrl}
            size={180}
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-[11px] text-center opacity-70 font-medium mb-3">
          Scan with your smartphone camera to install directly on your device.
        </p>

        {/* Link display & copy */}
        <div className={`flex items-center gap-2 border rounded-xl p-2 text-xs ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className="opacity-60 truncate flex-1 font-mono text-[11px]">
            {downloadUrl}
          </span>
          <button
            onClick={handleCopy}
            className={`px-2.5 py-1 rounded flex items-center gap-1 font-medium text-[11px] transition-colors ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-gray-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
