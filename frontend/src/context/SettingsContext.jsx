import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [iosEnabled, setIosEnabledState] = useState(() => {
    const saved = localStorage.getItem('setting_ios_enabled')
    return saved !== null ? saved === 'true' : true
  })

  const setIosEnabled = (enabled) => {
    setIosEnabledState(enabled)
    localStorage.setItem('setting_ios_enabled', String(enabled))
  }

  return (
    <SettingsContext.Provider value={{ iosEnabled, setIosEnabled }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
