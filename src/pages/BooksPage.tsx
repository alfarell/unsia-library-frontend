import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { BookDetailModal } from '../components/books/BookDetailModal'
import { BookFormModal } from '../components/books/BookFormModal'
import { DeleteBookModal } from '../components/books/DeleteBookModal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { isApiError, listBooks } from '../lib/api'
import type { Book } from '../lib/api'

type BookModalState =
  | { book: Book; kind: 'delete' }
  | { book: Book; kind: 'detail' }
  | { book: Book; kind: 'edit' }
  | { kind: 'create' }
  | null

export function BooksPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<BookModalState>(null)
  const [formSession, setFormSession] = useState(0)
  const mountedRef = useRef(true)

  const loadBooks = useCallback(async () => {
    if (!token) return

    try {
      const { books: nextBooks } = await listBooks(token)
      if (!mountedRef.current) return
      setBooks(nextBooks)
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

    listBooks(token)
      .then(({ books: nextBooks }) => {
        if (cancelled) return
        setBooks(nextBooks)
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

  const handleSaved = (mode: 'create' | 'update') => {
    setModal(null)
    showToast(
      mode === 'create' ? t('books.createSuccess') : t('books.updateSuccess'),
      'success',
    )
    void loadBooks()
  }

  const handleDeleted = () => {
    setModal(null)
    showToast(t('books.deleteSuccess'), 'success')
    void loadBooks()
  }

  const openCreate = () => {
    setFormSession((current) => current + 1)
    setModal({ kind: 'create' })
  }

  const openEdit = (book: Book) => {
    setFormSession((current) => current + 1)
    setModal({ book, kind: 'edit' })
  }

  const iconButtonClass =
    'grid size-8 place-items-center text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400'

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('books.title')}
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('books.add')}
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('books.loading')}
        </p>
      ) : books.length === 0 ? (
        <p className="py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('books.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('books.colNo')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('books.colTitle')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('books.colIsbn')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('books.colCategory')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('books.colCopies')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('books.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {books.map((book, index) => (
                <tr key={book.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold">{book.title}</td>
                  <td className="px-4 py-3">{book.isbn ?? '—'}</td>
                  <td className="px-4 py-3">{book.category ?? '—'}</td>
                  <td className="px-4 py-3">{book.totalCopies}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModal({ book, kind: 'detail' })}
                        aria-label={t('books.actionView')}
                        className={iconButtonClass}
                      >
                        <Eye className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(book)}
                        aria-label={t('books.actionEdit')}
                        className={iconButtonClass}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal({ book, kind: 'delete' })}
                        aria-label={t('books.actionDelete')}
                        className={`${iconButtonClass} hover:text-rose-600 dark:hover:text-rose-400`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <BookFormModal
        key={formSession}
        open={modal?.kind === 'create' || modal?.kind === 'edit'}
        mode={modal?.kind === 'edit' ? 'update' : 'create'}
        book={modal?.kind === 'edit' ? modal.book : null}
        onClose={() => setModal(null)}
        onSaved={() =>
          handleSaved(modal?.kind === 'edit' ? 'update' : 'create')
        }
      />
      <BookDetailModal
        open={modal?.kind === 'detail'}
        book={modal?.kind === 'detail' ? modal.book : null}
        onClose={() => setModal(null)}
      />
      <DeleteBookModal
        open={modal?.kind === 'delete'}
        book={modal?.kind === 'delete' ? modal.book : null}
        onClose={() => setModal(null)}
        onDeleted={handleDeleted}
      />
    </>
  )
}
