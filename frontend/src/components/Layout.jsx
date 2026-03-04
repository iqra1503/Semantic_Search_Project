import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const navLinkClass = 'rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-800'

const Layout = ({ title, subtitle, children, sidebarItems = [] }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm md:hidden dark:border-slate-700"
              >
                Menu
              </button>
            )}
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'} className="text-lg font-semibold">
              Document Manager
            </Link>
          </div>

          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className={navLinkClass}>Dashboard</Link>
                <button onClick={handleLogout} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 active:scale-[0.98]">Logout</button>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass}>Home</Link>
                <Link to="/login" className={navLinkClass}>Login</Link>
                <Link to="/register" className={navLinkClass}>Register</Link>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-[220px,1fr]">
        {user && (
          <aside className={`${sidebarOpen ? 'block' : 'hidden'} rounded-2xl border border-slate-200 bg-white p-3 shadow-soft md:block dark:border-slate-800 dark:bg-slate-900`}>
            <p className="mb-2 px-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{user.role} panel</p>
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={`block rounded-lg px-3 py-2 text-sm transition ${location.pathname === item.to ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <main className="animate-fadeIn">
          {(title || subtitle) && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
              {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
              {title && <h1 className="text-2xl font-semibold">{title}</h1>}
            </div>
          )}
          {children}
        </main>
      </div>

      <footer className="border-t border-slate-200 py-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        © {new Date().getFullYear()} Document Manager · Built for modern teams.
      </footer>
    </div>
  )
}

export default Layout
