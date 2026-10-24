import apiClient from './client'

const STORAGE_KEY_APPS = 'mystore_real_apps'
const STORAGE_KEY_CATEGORIES = 'mystore_real_categories'

// Default real category taxonomy (clean category structure for publishing)
export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Productivity', slug: 'productivity', icon: '⚡' },
  { id: 'cat-2', name: 'Developer Tools', slug: 'developer-tools', icon: '🛠️' },
  { id: 'cat-3', name: 'Finance & Crypto', slug: 'finance', icon: '💎' },
  { id: 'cat-4', name: 'Media & Entertainment', slug: 'media', icon: '🎬' },
  { id: 'cat-5', name: 'Utilities', slug: 'utilities', icon: '🧰' },
  { id: 'cat-6', name: 'Security & VPN', slug: 'security', icon: '🛡️' },
]

export const realDataService = {
  // Fetch apps from backend API, with fallback to persistent client store
  async getApps() {
    try {
      const res = await apiClient.get('/apps')
      const data = res.data?.data?.content || res.data?.data
      if (Array.isArray(data)) {
        localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(data))
        return data
      }
    } catch {
      // Backend not running or offline, load from real persistent store
    }
    const saved = localStorage.getItem(STORAGE_KEY_APPS)
    return saved ? JSON.parse(saved) : []
  },

  // Fetch single app by slug
  async getAppBySlug(slug) {
    try {
      const res = await apiClient.get(`/apps/${slug}`)
      if (res.data?.data) {
        return res.data.data
      }
    } catch {
      // Fallback to local persistent store
    }
    const apps = await this.getApps()
    return apps.find((a) => a.slug === slug) || null
  },

  // Save/Create new real app
  async createApp(appData) {
    try {
      const res = await apiClient.post('/apps', appData)
      if (res.data?.data) {
        return res.data.data
      }
    } catch {
      // Offline fallback: save into persistent store
    }
    const apps = await this.getApps()
    const updated = [appData, ...apps]
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(updated))
    return appData
  },

  // Delete real app
  async deleteApp(id) {
    try {
      await apiClient.delete(`/apps/${id}`)
    } catch {
      // Offline delete
    }
    const apps = await this.getApps()
    const updated = apps.filter((a) => a.id !== id)
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(updated))
    return true
  },

  // Fetch categories
  async getCategories() {
    try {
      const res = await apiClient.get('/categories')
      const data = res.data?.data
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch {
      // Fallback
    }
    const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES)
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
  },
}
