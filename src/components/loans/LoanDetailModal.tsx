import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { Loan } from '../../lib/api'
import { Modal } from '../ui/Modal'

type LoanDetailModalProps = {
  loan: Loan | null
  onClose: () => void
  open: boolean
}

export function LoanDetailModal({ loan, onClose, open }: LoanDetailModalProps) {
  const { i18n, t } = useTranslation()

  if (!loan) {
    return null
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language).format(new Date(value))

  const rows: { key: string; label: string; value: ReactNode }[] = [
    {
      key: 'member',
      label: t('loans.detail.member'),
      value: loan.member?.name,
    },
    {
      key: 'membershipCode',
      label: t('loans.detail.membershipCode'),
      value: loan.member?.membershipCode,
    },
    {
      key: 'books',
      label: t('loans.detail.books'),
      value:
        loan.books.length > 0 ? (
          <ul className="space-y-1">
            {loan.books.map((book, index) => (
              <li key={index}>
                {book
                  ? `${book.title} — ${book.author} — ${book.isbn ?? '—'}`
                  : '—'}
              </li>
            ))}
          </ul>
        ) : (
          '—'
        ),
    },
    {
      key: 'status',
      label: t('loans.detail.status'),
      value:
        loan.status === 'borrowed'
          ? t('loans.statusBorrowed')
          : t('loans.statusReturned'),
    },
    {
      key: 'durationDays',
      label: t('loans.detail.durationDaysLabel'),
      value: t('loans.detail.durationDays', { count: loan.durationDays }),
    },
    {
      key: 'borrowedAt',
      label: t('loans.detail.borrowedAt'),
      value: formatDate(loan.borrowedAt ?? loan.createdAt),
    },
    {
      key: 'returnedAt',
      label: t('loans.detail.returnedAt'),
      value: loan.returnedAt ? formatDate(loan.returnedAt) : '—',
    },
    {
      key: 'createdBy',
      label: t('loans.detail.createdBy'),
      value: loan.createdBy?.name,
    },
    {
      key: 'updatedBy',
      label: t('loans.detail.updatedBy'),
      value: loan.updatedBy?.name,
    },
    {
      key: 'createdAt',
      label: t('loans.detail.createdAt'),
      value: formatDate(loan.createdAt),
    },
    {
      key: 'updatedAt',
      label: t('loans.detail.updatedAt'),
      value: formatDate(loan.updatedAt),
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title={t('loans.detail.detailTitle')}>
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
