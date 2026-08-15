import { useTranslation } from 'react-i18next'
import { LoanStatusChart } from '../components/dashboard/LoanStatusChart'
import { MetricCard } from '../components/dashboard/MetricCard'
import { useTheme } from '../hooks/useTheme'

export function DashboardPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()

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
        <MetricCard label={t('metrics.books')} value="1,248" trend="+24" />
        <MetricCard label={t('metrics.members')} value="486" trend="+12" />
        <MetricCard label={t('metrics.activeLoans')} value="93" trend="+8" />
        <MetricCard
          label={t('metrics.overdue')}
          value="7"
          trend="-3"
          positive
        />
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
          <LoanStatusChart theme={theme} />
        </article>

        <article className="border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-bold tracking-tight">
            {t('activity.title')}
          </h2>
          <div className="mt-5 space-y-4">
            {['loan', 'return', 'member'].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-1 size-2.5 rounded-full bg-cyan-500" />
                <div>
                  <p className="text-sm font-semibold">
                    {t(`activity.${item}.title`)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {t(`activity.${item}.time`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
