import { useEffect, useState } from 'react'
import { MdLightMode, MdDarkMode } from 'react-icons/md';

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

  const handleClick = () => {
    setUsdTheme(!usdTheme)
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded usd-btn-green hover:opacity-90 transition"
      aria-label={usdTheme ? 'Switch to light mode' : 'Switch to dark mode'}
      title={usdTheme ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {usdTheme ? <MdLightMode className="text-2xl" /> : <MdDarkMode className="text-2xl" />}
    </button>
  )
}
