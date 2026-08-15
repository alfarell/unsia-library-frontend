import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { deleteBook, isApiError } from '../../lib/api'
import type { Book } from '../../lib/api'
import { Modal } from '../ui/Modal'

type DeleteBookModalProps = {
  book: Book | null
  onClose: () => void
  onDeleted: () => void
  open: boolean
}

export function DeleteBookModal({
  book,
  onClose,
  onDeleted,
  open,
}: DeleteBookModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!token || !book) return

    setIsSubmitting(true)

    try {
      await deleteBook(token, book.id)
      onDeleted()
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
    <Modal open={open} onClose={onClose} title={t('books.confirm.deleteTitle')}>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {t('books.confirm.deleteConfirm', { title: book?.title ?? '' })}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:border-slate-600"
        >
          {t('books.form.cancel')}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? t('books.loading') : t('books.confirm.deleteButton')}
        </button>
      </div>
    </Modal>
  )
}
