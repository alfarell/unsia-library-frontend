import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Plus, Undo2 } from 'lucide-react'
import { LoanDetailModal } from '../components/loans/LoanDetailModal'
import { LoanFormModal } from '../components/loans/LoanFormModal'
import { ReturnLoanModal } from '../components/loans/ReturnLoanModal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { isApiError, listLoans } from '../lib/api'
import type { Loan } from '../lib/api'

type LoanModalState =
  | { kind: 'create' }
  | { kind: 'detail'; loan: Loan }
  | { kind: 'return'; loan: Loan }
  | null

export function LoansPage() {
  const { i18n, t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<LoanModalState>(null)
  const [formSession, setFormSession] = useState(0)
  const mountedRef = useRef(true)

  const loadLoans = useCallback(async () => {
    if (!token) return

    try {
      const { loans: nextLoans } = await listLoans(token)
      if (!mountedRef.current) return
      setLoans(nextLoans)
    } catch (error) {
      if (!mountedRef.current) return
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [showToast, t, token])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    listLoans(token)
      .then(({ loans: nextLoans }) => {
        if (cancelled) return
        setLoans(nextLoans)
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
  }, [showToast, t, token])

  const handleSaved = () => {
    setModal(null)
    showToast(t('loans.createSuccess'), 'success')
    void loadLoans()
  }

  const handleReturned = () => {
    setModal(null)
    showToast(t('loans.returnSuccess'), 'success')
    void loadLoans()
  }

  const handleStale = () => {
    setModal(null)
    void loadLoans()
  }

  const openCreate = () => {
    setFormSession((current) => current + 1)
    setModal({ kind: 'create' })
  }

  const iconButtonClass =
    'grid size-8 place-items-center text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400'

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language).format(new Date(value))

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('loans.title')}
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('loans.add')}
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('loans.loading')}
        </p>
      ) : loans.length === 0 ? (
        <p className="py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('loans.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('loans.colNo')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('loans.colMember')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('loans.colBooks')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('loans.colStatus')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('loans.colDate')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('loans.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loans.map((loan, index) => (
                <tr key={loan.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{loan.member?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    {loan.books[0]?.title ?? '—'}
                    {loan.books.length > 1
                      ? ` ${t('loans.moreBooks', {
                          count: loan.books.length - 1,
                        })}`
                      : null}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        loan.status === 'borrowed'
                          ? 'text-cyan-600 dark:text-cyan-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }
                    >
                      {loan.status === 'borrowed'
                        ? t('loans.statusBorrowed')
                        : t('loans.statusReturned')}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(loan.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModal({ kind: 'detail', loan })}
                        aria-label={t('loans.actionView')}
                        className={iconButtonClass}
                      >
                        <Eye className="size-4" aria-hidden="true" />
                      </button>
                      {loan.status === 'borrowed' ? (
                        <button
                          type="button"
                          onClick={() => setModal({ kind: 'return', loan })}
                          aria-label={t('loans.actionReturn')}
                          className={iconButtonClass}
                        >
                          <Undo2 className="size-4" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LoanFormModal
        key={formSession}
        open={modal?.kind === 'create'}
        onClose={() => setModal(null)}
        onSaved={handleSaved}
      />
      <LoanDetailModal
        open={modal?.kind === 'detail'}
        loan={modal?.kind === 'detail' ? modal.loan : null}
        onClose={() => setModal(null)}
      />
      <ReturnLoanModal
        open={modal?.kind === 'return'}
        loan={modal?.kind === 'return' ? modal.loan : null}
        onClose={() => setModal(null)}
        onReturned={handleReturned}
        onStale={handleStale}
      />
    </>
  )
}
