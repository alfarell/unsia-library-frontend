import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'

export function UserMenu() {
  const { t } = useTranslation()
  const { signOut, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const handleSignOut = () => {
    signOut()
    showToast(t('auth.logoutSuccess'), 'success')
    navigate('/login')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid size-9 place-items-center rounded-[4px] border border-slate-200 text-slate-600 transition hover:border-cyan-500 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
        aria-label={t('actions.userMenu')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="size-4" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-48 rounded-[4px] border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="px-3 py-2">
            <p className="text-sm font-semibold">
              {user?.name ?? t('auth.userFallback')}
            </p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-[4px] px-3 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950 dark:hover:text-rose-300"
          >
            <LogOut className="size-4" aria-hidden="true" />
            {t('auth.logout')}
          </button>
        </div>
      )}
    </div>
  )
}
