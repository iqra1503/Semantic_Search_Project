import { Link } from 'react-router-dom'

const AuthCard = ({ title, subtitle, error, children, footerText, footerLinkLabel, footerLinkTo }) => (
  <div className="mx-auto w-full max-w-md animate-fadeIn rounded-2xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-8">
    <div className="mb-5">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
    </div>
    {error && <p className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
    {children}
    <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
      {footerText} <Link to={footerLinkTo} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">{footerLinkLabel}</Link>
    </p>
  </div>
)

export default AuthCard
