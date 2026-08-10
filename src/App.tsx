import { useTranslation } from 'react-i18next'
import { LoanStatusChart } from './components/dashboard/LoanStatusChart'
import { MetricCard } from './components/dashboard/MetricCard'
import { useTheme } from './hooks/useTheme'

const navigationItems = ['dashboard', 'books', 'members', 'loans'] as const

function App() {
  const { i18n, t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  const changeLanguage = async () => {
    await i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-cyan-600 text-xl font-bold text-white shadow-lg shadow-cyan-600/20">
              U
            </div>
            <div>
              <p className="font-bold tracking-tight">UNSIA Library</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={changeLanguage}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
              aria-label={t('actions.changeLanguage')}
            >
              {i18n.language === 'id' ? 'EN' : 'ID'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
              aria-label={t('actions.changeTheme')}
            >
              {theme === 'dark' ? t('theme.light') : t('theme.dark')}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <nav
            aria-label={t('navigation.label')}
            className="flex gap-2 overflow-x-auto lg:flex-col"
          >
            {navigationItems.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  index === 0
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {t(`navigation.${item}`)}
              </button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-500 p-6 text-white shadow-xl shadow-cyan-900/10 sm:p-8">
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
            <MetricCard
              label={t('metrics.activeLoans')}
              value="93"
              trend="+8"
            />
            <MetricCard
              label={t('metrics.overdue')}
              value="7"
              trend="-3"
              positive
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
        </main>
      </div>
    </div>
  )
}

export default App
