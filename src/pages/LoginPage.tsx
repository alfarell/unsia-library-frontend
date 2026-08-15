import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useTheme } from '../hooks/useTheme'
import { isApiError } from '../lib/api'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { signIn, token } = useAuth()
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  useTheme()

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      nextErrors.email = t('auth.validation.emailRequired')
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = t('auth.validation.emailInvalid')
    }

    if (!password) {
      nextErrors.password = t('auth.validation.passwordRequired')
    } else if (password.length < 8) {
      nextErrors.password = t('auth.validation.passwordMin')
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await signIn(email, password)
      showToast(t('auth.loginSuccess'), 'success')
      navigate('/dashboard')
    } catch (error) {
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-12 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-50">
      <main className="w-full max-w-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <header className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
          <div className="grid size-11 place-items-center bg-cyan-600 text-xl font-bold text-white">
            U
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('auth.loginDescription')}
          </p>
        </header>

        <form
          className="space-y-4 px-8 py-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block text-sm font-semibold"
            >
              {t('auth.emailLabel')}
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              aria-invalid={Boolean(errors.email)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            />
            {errors.email ? (
              <p
                role="alert"
                className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block text-sm font-semibold"
            >
              {t('auth.passwordLabel')}
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              aria-invalid={Boolean(errors.password)}
              className="w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            />
            {errors.password ? (
              <p
                role="alert"
                className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
              >
                {errors.password}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t('auth.loading') : t('auth.loginSubmit')}
          </button>
        </form>

        <footer className="border-t border-slate-200 px-8 py-4 dark:border-slate-800">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              className="font-semibold text-cyan-700 hover:underline dark:text-cyan-300"
            >
              {t('auth.goToRegister')}
            </Link>
          </p>
        </footer>
      </main>
    </div>
  )
}
