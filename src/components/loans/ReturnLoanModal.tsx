import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { isApiError, returnLoan } from '../../lib/api'
import type { Loan } from '../../lib/api'
import { Modal } from '../ui/Modal'

type ReturnLoanModalProps = {
  loan: Loan | null
  onClose: () => void
  onReturned: () => void
  onStale: () => void
  open: boolean
}

export function ReturnLoanModal({
  loan,
  onClose,
  onReturned,
  onStale,
  open,
}: ReturnLoanModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReturn = async () => {
    if (!token || !loan) return

    setIsSubmitting(true)

    try {
      await returnLoan(token, loan.id)
      onReturned()
    } catch (error) {
      if (isApiError(error) && error.code === 'LOAN_ALREADY_RETURNED') {
        onStale()
      }
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!loan) {
    return null
  }

  return (
    <Modal open={open} onClose={onClose} title={t('loans.return.title')}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="font-semibold">{t('loans.return.memberLabel')}</p>
          <p className="text-slate-600 dark:text-slate-300">
            {loan.member?.name ?? '—'}
          </p>
        </div>
        <div>
          <p className="font-semibold">{t('loans.return.booksLabel')}</p>
          <ul className="max-h-64 list-disc overflow-y-auto pl-5 text-slate-600 dark:text-slate-300">
            {loan.books.map((book, index) => (
              <li key={index}>{book?.title ?? '—'}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:border-slate-600"
        >
          {t('loans.return.cancel')}
        </button>
        <button
          type="button"
          onClick={handleReturn}
          disabled={isSubmitting}
          className="bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t('loans.loading') : t('loans.return.confirmButton')}
        </button>
      </div>
    </Modal>
  )
}
