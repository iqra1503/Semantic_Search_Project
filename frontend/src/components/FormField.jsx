const FormField = ({ label, ...props }) => {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500 dark:focus:ring-indigo-900/40"
        {...props}
      />
    </label>
  )
}

export default FormField
