import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [usdTheme, setUsdTheme] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme-usd') === 'true'
  })

  useEffect(() => {
    const root = document.documentElement
    if (usdTheme) {
      root.classList.add('theme-usd', 'dark')
    } else {
      root.classList.remove('theme-usd', 'dark')
    }
    localStorage.setItem('theme-usd', usdTheme ? 'true' : 'false')
  }, [usdTheme])

  return (
    <button
      className="px-3 py-2 rounded usd-btn-green hover:opacity-90 transition"
      onClick={() => setUsdTheme(v => !v)}
      aria-label="Toggle USD theme"
    >
      {usdTheme ? 'Dark Mode: On' : 'Dark Mode: Off'}
    </button>
  )
}
