import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { UserMenu } from '../ui/UserMenu'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-[4px] px-4 py-3 text-left text-sm font-semibold transition ${
    isActive
      ? 'bg-cyan-600 text-white'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`

export function AppLayout() {
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
              className="rounded-[4px] border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
              aria-label={t('actions.changeLanguage')}
            >
              {i18n.language === 'id' ? 'EN' : 'ID'}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-[4px] border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
              aria-label={t('actions.changeTheme')}
            >
              {theme === 'dark' ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="h-fit min-w-0 border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <nav
            aria-label={t('navigation.label')}
            className="flex gap-2 overflow-x-auto lg:flex-col"
          >
            <NavLink to="/dashboard" end className={navLinkClass}>
              {t('navigation.dashboard')}
            </NavLink>
            <NavLink to="/books" className={navLinkClass}>
              {t('navigation.books')}
            </NavLink>
            <NavLink to="/members" className={navLinkClass}>
              {t('navigation.members')}
            </NavLink>
            <NavLink to="/loans" className={navLinkClass}>
              {t('navigation.loans')}
            </NavLink>
          </nav>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
