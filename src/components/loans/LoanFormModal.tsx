import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { createLoan, isApiError, listBooks, listMembers } from '../../lib/api'
import type { Book, Member } from '../../lib/api'
import { Modal } from '../ui/Modal'

type LoanFormModalProps = {
  onClose: () => void
  onSaved: () => void
  open: boolean
}

type FormErrors = {
  books?: string
  member?: string
}

export function LoanFormModal({ onClose, onSaved, open }: LoanFormModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [memberId, setMemberId] = useState('')
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !token) return

    let cancelled = false

    Promise.all([listMembers(token), listBooks(token)])
      .then(([memberResult, bookResult]) => {
        if (cancelled) return
        setMembers(memberResult.members)
        setBooks(bookResult.books)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        showToast(
          isApiError(error) ? error.message : t('auth.errorUnexpected'),
          'error',
        )
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [open, showToast, t, token])

  const toggleBook = (bookId: string) => {
    setSelectedBookIds((current) =>
      current.includes(bookId)
        ? current.filter((id) => id !== bookId)
        : [...current, bookId],
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) return

    const next: FormErrors = {}

    if (!memberId) {
      next.member = t('loans.form.validation.memberRequired')
    }

    if (selectedBookIds.length === 0) {
      next.books = t('loans.form.validation.booksRequired')
    }

    setErrors(next)

    if (next.member || next.books) return

    setIsSubmitting(true)

    try {
      await createLoan(token, { bookIds: selectedBookIds, memberId })
      onSaved()
    } catch (error) {
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'

  return (
    <Modal open={open} onClose={onClose} title={t('loans.form.createTitle')}>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="loan-member"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('loans.form.memberLabel')}
          </label>
          <select
            id="loan-member"
            value={memberId}
            onChange={(event) => setMemberId(event.target.value)}
            aria-invalid={Boolean(errors.member)}
            className={inputClass}
          >
            <option value="">{t('loans.form.memberPlaceholder')}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.membershipCode ?? '—'})
              </option>
            ))}
          </select>
          {errors.member ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.member}
            </p>
          ) : null}
        </div>

        <div>
          <p
            id="loan-books-label"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('loans.form.booksLabel')}
          </p>
          {loading ? (
            <p className="py-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
              {t('loans.loading')}
            </p>
          ) : (
            <div
              role="group"
              aria-labelledby="loan-books-label"
              className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800"
            >
              {books.map((book) => {
                const available = book.totalCopies - (book.activeLoans ?? 0)
                const outOfStock = available <= 0

                return (
                  <label
                    key={book.id}
                    className="flex items-start gap-3 border-b border-slate-200 p-3 last:border-b-0 dark:border-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBookIds.includes(book.id)}
                      onChange={() => toggleBook(book.id)}
                      disabled={outOfStock || isSubmitting}
                      aria-label={book.title}
                      className="mt-0.5"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">
                        {book.title}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {t('loans.form.bookAvailable', {
                          count: Math.max(0, available),
                          total: book.totalCopies,
                        })}
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
          {errors.books ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.books}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:border-slate-600"
          >
            {t('loans.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? t('loans.loading') : t('loans.form.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
