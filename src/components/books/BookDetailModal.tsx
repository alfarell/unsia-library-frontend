import { useTranslation } from 'react-i18next'
import type { Book } from '../../lib/api'
import { Modal } from '../ui/Modal'

type BookDetailModalProps = {
  book: Book | null
  onClose: () => void
  open: boolean
}

export function BookDetailModal({ book, onClose, open }: BookDetailModalProps) {
  const { i18n, t } = useTranslation()

  if (!book) {
    return null
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language).format(new Date(value))

  const rows = [
    { key: 'title', label: t('books.detail.title'), value: book.title },
    { key: 'author', label: t('books.detail.author'), value: book.author },
    { key: 'isbn', label: t('books.detail.isbn'), value: book.isbn },
    {
      key: 'publisher',
      label: t('books.detail.publisher'),
      value: book.publisher,
    },
    {
      key: 'publicationYear',
      label: t('books.detail.publicationYear'),
      value: book.publicationYear,
    },
    {
      key: 'category',
      label: t('books.detail.category'),
      value: book.category,
    },
    {
      key: 'totalCopies',
      label: t('books.detail.totalCopies'),
      value: book.totalCopies,
    },
    {
      key: 'createdBy',
      label: t('books.detail.createdBy'),
      value: book.createdBy?.name,
    },
    {
      key: 'updatedBy',
      label: t('books.detail.updatedBy'),
      value: book.updatedBy?.name,
    },
    {
      key: 'createdAt',
      label: t('books.detail.createdAt'),
      value: formatDate(book.createdAt),
    },
    {
      key: 'updatedAt',
      label: t('books.detail.updatedAt'),
      value: formatDate(book.updatedAt),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title={t('books.detail.detailTitle')}>
      <dl className="divide-y divide-slate-200 dark:divide-slate-800">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-4 py-2"
          >
            <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {row.label}
            </dt>
            <dd className="text-right text-sm font-medium">
              {row.value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}
