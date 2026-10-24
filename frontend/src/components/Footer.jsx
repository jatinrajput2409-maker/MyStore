import { ShieldCheck, Smartphone, Apple } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'

export default function Footer() {
  const { isDark } = useTheme()
  const { iosEnabled } = useSettings()

  return (
    <footer className={`border-t mt-16 pt-10 pb-8 text-xs transition-colors duration-300 ${
      isDark 
        ? 'border-slate-800/80 bg-slate-950/80 text-gray-400' 
        : 'border-slate-300 bg-slate-200/70 text-slate-600'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-700/20">
          
          <div className="space-y-2.5">
            <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              MyStore Platform
            </h3>
            <p className="text-[11px] leading-relaxed">
              Enterprise-grade direct binary distribution platform with cryptographic SHA-256 verification.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Distribution Types
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Direct Android APK Sideload</span>
              </li>
              {iosEnabled && (
                <li className="flex items-center gap-1.5">
                  <Apple className="w-3.5 h-3.5 text-sky-500" />
                  <span>iOS OTA Enterprise / Ad-Hoc</span>
                </li>
              )}
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>SHA-256 Verified Signatures</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Quick Navigation
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link to="/" className="hover:text-blue-500 transition-colors">Storefront Home</Link>
              </li>
              <li>
                <Link to="/?platform=ANDROID" className="hover:text-blue-500 transition-colors">Android Applications</Link>
              </li>
              {iosEnabled && (
                <li>
                  <Link to="/?platform=IOS" className="hover:text-blue-500 transition-colors">iOS Applications</Link>
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Security & Policy
            </h4>
            <p className="text-[11px] leading-relaxed opacity-80">
              Direct binaries hosted are scanned and validated against checksum hashes prior to distribution.
            </p>
          </div>

        </div>

        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] opacity-75 gap-3">
          <p>© {new Date().getFullYear()} MyStore Distribution Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              S3 Storage &amp; CDN Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
