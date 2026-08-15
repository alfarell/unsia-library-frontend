import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { createBook, isApiError, updateBook } from '../../lib/api'
import type { Book, BookPayload } from '../../lib/api'
import { Modal } from '../ui/Modal'

type BookFormModalProps = {
  book?: Book | null
  mode: 'create' | 'update'
  onClose: () => void
  onSaved: () => void
  open: boolean
}

type FormErrors = {
  author?: string
  copies?: string
  title?: string
  year?: string
}

export function BookFormModal({
  book,
  mode,
  onClose,
  onSaved,
  open,
}: BookFormModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [title, setTitle] = useState(book?.title ?? '')
  const [author, setAuthor] = useState(book?.author ?? '')
  const [isbn, setIsbn] = useState(book?.isbn ?? '')
  const [publisher, setPublisher] = useState(book?.publisher ?? '')
  const [publicationYear, setPublicationYear] = useState(
    book?.publicationYear?.toString() ?? '',
  )
  const [category, setCategory] = useState(book?.category ?? '')
  const [totalCopies, setTotalCopies] = useState(
    book?.totalCopies?.toString() ?? '1',
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (payload: BookPayload) => {
    const next: FormErrors = {}

    if (!payload.title) {
      next.title = t('books.form.validation.titleRequired')
    }

    if (!payload.author) {
      next.author = t('books.form.validation.authorRequired')
    }

    if (publicationYear !== '' && !Number.isInteger(Number(publicationYear))) {
      next.year = t('books.form.validation.yearInvalid')
    }

    if (
      totalCopies !== '' &&
      (!Number.isInteger(Number(totalCopies)) || Number(totalCopies) < 0)
    ) {
      next.copies = t('books.form.validation.copiesInvalid')
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) return

    const payload: BookPayload = {}

    if (title.trim()) payload.title = title.trim()
    if (author.trim()) payload.author = author.trim()
    if (isbn.trim()) payload.isbn = isbn.trim()
    if (publisher.trim()) payload.publisher = publisher.trim()
    if (category.trim()) payload.category = category.trim()
    if (publicationYear !== '')
      payload.publicationYear = Number(publicationYear)
    if (totalCopies !== '') payload.totalCopies = Number(totalCopies)

    if (!validate(payload)) return

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        await createBook(token, payload)
      } else if (book) {
        await updateBook(token, book.id, payload)
      }
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
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === 'create'
          ? t('books.form.createTitle')
          : t('books.form.editTitle')
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="book-title"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.titleLabel')}
          </label>
          <input
            id="book-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('books.form.titlePlaceholder')}
            aria-invalid={Boolean(errors.title)}
            className={inputClass}
          />
          {errors.title ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.title}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="book-author"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.authorLabel')}
          </label>
          <input
            id="book-author"
            type="text"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder={t('books.form.authorPlaceholder')}
            aria-invalid={Boolean(errors.author)}
            className={inputClass}
          />
          {errors.author ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.author}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="book-isbn"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.isbnLabel')}
          </label>
          <input
            id="book-isbn"
            type="text"
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
            placeholder={t('books.form.isbnPlaceholder')}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="book-publisher"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.publisherLabel')}
          </label>
          <input
            id="book-publisher"
            type="text"
            value={publisher}
            onChange={(event) => setPublisher(event.target.value)}
            placeholder={t('books.form.publisherPlaceholder')}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="book-publication-year"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.publicationYearLabel')}
          </label>
          <input
            id="book-publication-year"
            type="number"
            value={publicationYear}
            onChange={(event) => setPublicationYear(event.target.value)}
            placeholder={t('books.form.publicationYearPlaceholder')}
            aria-invalid={Boolean(errors.year)}
            className={inputClass}
          />
          {errors.year ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.year}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="book-category"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.categoryLabel')}
          </label>
          <input
            id="book-category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder={t('books.form.categoryPlaceholder')}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="book-total-copies"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('books.form.totalCopiesLabel')}
          </label>
          <input
            id="book-total-copies"
            type="number"
            value={totalCopies}
            onChange={(event) => setTotalCopies(event.target.value)}
            placeholder={t('books.form.totalCopiesPlaceholder')}
            aria-invalid={Boolean(errors.copies)}
            className={inputClass}
          />
          {errors.copies ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.copies}
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
            {t('books.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t('books.loading')
              : mode === 'create'
                ? t('books.form.save')
                : t('books.form.update')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
