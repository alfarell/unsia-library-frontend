import { useTranslation } from 'react-i18next'

export type ToastVariant = 'success' | 'error'

type ToastProps = {
  message: string
  onClose: () => void
  variant: ToastVariant
}

export function Toast({ message, onClose, variant }: ToastProps) {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 border px-4 py-3 text-sm font-medium shadow-sm ${
        variant === 'success'
          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-100'
          : 'border-rose-600 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-100'
      }`}
    >
      <p className="min-w-0">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label={t('actions.close')}
        className="shrink-0 font-bold leading-none opacity-70 transition hover:opacity-100"
      >
        &times;
      </button>
    </div>
  )
}
