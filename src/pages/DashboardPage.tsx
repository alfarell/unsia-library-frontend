import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LoanStatusChart } from '../components/dashboard/LoanStatusChart'
import { MetricCard } from '../components/dashboard/MetricCard'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getDashboardSummary, isApiError } from '../lib/api'
import type { DashboardSummary } from '../lib/api'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { token } = useAuth()
  const { showToast } = useToast()

  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    getDashboardSummary(token)
      .then((data) => {
        if (!cancelled) {
          setDashboard(data)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          showToast(
            isApiError(error) ? error.message : t('auth.errorUnexpected'),
            'error',
          )
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [token, showToast, t])

  return (
    <>
      <section className="mb-6 overflow-hidden bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-500 p-6 text-white shadow-xl shadow-cyan-900/10 sm:p-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100">
          {t('dashboard.eyebrow')}
        </p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          {t('dashboard.title')}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50 sm:text-base">
          {t('dashboard.description')}
        </p>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label={t('metrics.label')}
      >
        {loading ? (
          <div className="col-span-full py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('dashboard.loading')}
          </div>
        ) : (
          <>
            <MetricCard
              label={t('metrics.books')}
              value={dashboard?.summary.totalBooks.toLocaleString() ?? '—'}
            />
            <MetricCard
              label={t('metrics.members')}
              value={dashboard?.summary.activeMembers.toLocaleString() ?? '—'}
            />
            <MetricCard
              label={t('metrics.activeLoans')}
              value={dashboard?.summary.activeLoans.toLocaleString() ?? '—'}
            />
            <MetricCard
              label={t('metrics.overdue')}
              value={dashboard?.summary.overdueLoans.toLocaleString() ?? '—'}
            />
          </>
        )}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">
              {t('chart.title')}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t('chart.description')}
            </p>
          </div>
          <LoanStatusChart
            theme={theme}
            data={
              dashboard?.loanStatus ?? { borrowed: 0, returned: 0, overdue: 0 }
            }
            loading={loading}
          />
        </article>

        <article className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold tracking-tight">
            {t('activity.title')}
          </h2>
          {loading ? (
            <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.loading')}
            </div>
          ) : dashboard?.recentActivities &&
            dashboard.recentActivities.length > 0 ? (
            <div className="mt-5 space-y-4">
              {dashboard.recentActivities.map((activity, index) => (
                <div
                  key={`${activity.createdAt}-${index}`}
                  className="flex items-start gap-3"
                >
                  <span className="mt-1 size-2.5 rounded-full bg-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold">
                      {i18n.language === 'id'
                        ? activity.description_id
                        : activity.description_en}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {new Intl.DateTimeFormat(i18n.language, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(activity.createdAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
              {t('activity.empty')}
            </div>
          )}
        </article>
      </section>
    </>
  )
}
