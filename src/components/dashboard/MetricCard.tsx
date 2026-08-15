type MetricCardProps = {
  label: string
  positive?: boolean
  trend?: string
  value: string
}

export function MetricCard({
  label,
  positive = true,
  trend,
  value,
}: MetricCardProps) {
  return (
    <article className="border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {trend && (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              positive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </article>
  )
}
