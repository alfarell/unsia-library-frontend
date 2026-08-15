import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import * as api from '../lib/api'
import { setStoredAuth, setStoredUser } from '../lib/storage'
import { BooksPage } from './BooksPage'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return {
    ...actual,
    createBook: vi.fn(),
    deleteBook: vi.fn(),
    getMe: vi.fn(),
    listBooks: vi.fn(),
    updateBook: vi.fn(),
  }
})

const books: api.Book[] = [
  {
    id: '1',
    title: 'Belajar React',
    author: 'Budi Santoso',
    isbn: '978-1',
    publisher: 'Penerbit A',
    publicationYear: 2024,
    category: 'Teknologi',
    totalCopies: 3,
    createdBy: { id: '9', name: 'Admin Satu' },
    updatedBy: { id: '9', name: 'Admin Satu' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Novel Senja',
    author: 'Sari Dewi',
    isbn: null,
    publisher: null,
    publicationYear: null,
    category: null,
    totalCopies: 1,
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
]

const renderBooksPage = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>
          <BooksPage />
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('BooksPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    setStoredAuth('test-token')
    setStoredUser({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    })
    vi.mocked(api.getMe).mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    })
    vi.mocked(api.listBooks).mockResolvedValue({ books })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the book table with the specified columns', async () => {
    renderBooksPage()

    expect(await screen.findByText('Belajar React')).toBeInTheDocument()
    expect(screen.getByText('Novel Senja')).toBeInTheDocument()

    expect(screen.getByRole('columnheader', { name: 'No' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Judul Buku' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'ISBN' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Kategori' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Total Copies' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Aksi' }),
    ).toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(within(rows[1]).getByText('1')).toBeInTheDocument()
    expect(within(rows[1]).getByText('978-1')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Teknologi')).toBeInTheDocument()
    expect(within(rows[1]).getByText('3')).toBeInTheDocument()
    expect(within(rows[2]).getByText('2')).toBeInTheDocument()
  })

  it('shows an empty state when there are no books', async () => {
    vi.mocked(api.listBooks).mockResolvedValue({ books: [] })

    renderBooksPage()

    expect(await screen.findByText('Belum ada data buku')).toBeInTheDocument()
  })

  it('creates a book and reloads the list', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createBook).mockResolvedValue({ book: books[0] })

    renderBooksPage()
    await screen.findByText('Belajar React')

    await user.click(screen.getByRole('button', { name: 'Tambah Buku' }))
    await user.type(screen.getByLabelText('Judul'), 'Buku Baru')
    await user.type(screen.getByLabelText('Penulis'), 'Penulis Baru')
    await user.type(screen.getByLabelText('ISBN'), '978-9')

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(api.createBook).toHaveBeenCalledWith('test-token', {
      author: 'Penulis Baru',
      isbn: '978-9',
      title: 'Buku Baru',
      totalCopies: 1,
    })
    expect(
      await screen.findByText('Buku berhasil ditambahkan'),
    ).toBeInTheDocument()
    await waitFor(() => expect(api.listBooks).toHaveBeenCalledTimes(2))
  })

  it('validates required fields before creating', async () => {
    const user = userEvent.setup()

    renderBooksPage()
    await screen.findByText('Belajar React')

    await user.click(screen.getByRole('button', { name: 'Tambah Buku' }))
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Judul wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Penulis wajib diisi')).toBeInTheDocument()
    expect(api.createBook).not.toHaveBeenCalled()
  })

  it('edits a book omitting empty optional fields', async () => {
    const user = userEvent.setup()
    vi.mocked(api.updateBook).mockResolvedValue({ book: books[1] })

    renderBooksPage()
    await screen.findByText('Belajar React')

    const rows = screen.getAllByRole('row')
    await user.click(within(rows[2]).getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Judul')).toHaveValue('Novel Senja')
    expect(screen.getByLabelText('Penulis')).toHaveValue('Sari Dewi')
    expect(screen.getByLabelText('Total Copies')).toHaveValue(1)
    expect(screen.getByLabelText('ISBN')).toHaveValue('')

    await user.clear(screen.getByLabelText('Judul'))
    await user.type(screen.getByLabelText('Judul'), 'Novel Baru')

    await user.click(screen.getByRole('button', { name: 'Perbarui' }))

    expect(api.updateBook).toHaveBeenCalledWith('test-token', '2', {
      author: 'Sari Dewi',
      title: 'Novel Baru',
      totalCopies: 1,
    })
    expect(
      await screen.findByText('Buku berhasil diperbarui'),
    ).toBeInTheDocument()
  })

  it('shows all fields and audit info in the detail modal', async () => {
    const user = userEvent.setup()

    renderBooksPage()
    await screen.findByText('Belajar React')

    const rows = screen.getAllByRole('row')
    await user.click(
      within(rows[1]).getByRole('button', { name: 'Lihat detail' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Detail Buku' })

    expect(within(dialog).getByText('Belajar React')).toBeInTheDocument()
    expect(within(dialog).getByText('Budi Santoso')).toBeInTheDocument()
    expect(within(dialog).getByText('978-1')).toBeInTheDocument()
    expect(within(dialog).getByText('Penerbit A')).toBeInTheDocument()
    expect(within(dialog).getByText('2024')).toBeInTheDocument()
    expect(within(dialog).getByText('Teknologi')).toBeInTheDocument()
    expect(within(dialog).getByText('3')).toBeInTheDocument()
    expect(within(dialog).getAllByText('Admin Satu')).toHaveLength(2)
    expect(within(dialog).getAllByText(/2026/).length).toBeGreaterThan(0)
  })

  it('falls back to a dash when audit users are null', async () => {
    const user = userEvent.setup()

    renderBooksPage()
    await screen.findByText('Belajar React')

    const rows = screen.getAllByRole('row')
    await user.click(
      within(rows[2]).getByRole('button', { name: 'Lihat detail' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Detail Buku' })

    expect(within(dialog).getAllByText('—')).toHaveLength(6)
  })

  it('deletes a book after confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(api.deleteBook).mockResolvedValue(undefined)

    renderBooksPage()
    await screen.findByText('Belajar React')

    const rows = screen.getAllByRole('row')
    await user.click(within(rows[1]).getByRole('button', { name: 'Hapus' }))

    const dialog = screen.getByRole('dialog', { name: 'Hapus Buku' })
    expect(
      within(dialog).getByText('Hapus buku "Belajar React"?'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    expect(api.deleteBook).toHaveBeenCalledWith('test-token', '1')
    expect(await screen.findByText('Buku berhasil dihapus')).toBeInTheDocument()
    await waitFor(() => expect(api.listBooks).toHaveBeenCalledTimes(2))
  })

  it('shows an error toast when loading fails', async () => {
    vi.mocked(api.listBooks).mockRejectedValue({
      code: 'SERVER_ERROR',
      message: 'Gagal memuat buku',
    })

    renderBooksPage()

    expect(await screen.findByText('Gagal memuat buku')).toBeInTheDocument()
  })

  it('shows an error toast when creating fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createBook).mockRejectedValue({
      code: 'ISBN_ALREADY_EXISTS',
      message: 'ISBN sudah terdaftar',
    })

    renderBooksPage()
    await screen.findByText('Belajar React')

    await user.click(screen.getByRole('button', { name: 'Tambah Buku' }))
    await user.type(screen.getByLabelText('Judul'), 'Buku Duplikat')
    await user.type(screen.getByLabelText('Penulis'), 'Penulis Baru')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('ISBN sudah terdaftar')).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Tambah Buku' }),
    ).toBeInTheDocument()
  })

  it('shows a loading state while fetching books', () => {
    vi.mocked(api.listBooks).mockReturnValue(new Promise(() => {}))

    renderBooksPage()

    expect(screen.getByText('Memuat…')).toBeInTheDocument()
  })

  it('rejects non-integer years and negative copies', async () => {
    const user = userEvent.setup()

    renderBooksPage()
    await screen.findByText('Belajar React')

    await user.click(screen.getByRole('button', { name: 'Tambah Buku' }))
    await user.type(screen.getByLabelText('Judul'), 'Buku Valid')
    await user.type(screen.getByLabelText('Penulis'), 'Penulis Valid')
    fireEvent.change(screen.getByLabelText('Tahun Terbit'), {
      target: { value: '2020.5' },
    })
    fireEvent.change(screen.getByLabelText('Total Copies'), {
      target: { value: '-1' },
    })

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(
      await screen.findByText('Tahun terbit harus angka bulat'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Total copies harus angka bulat minimal 0'),
    ).toBeInTheDocument()
    expect(api.createBook).not.toHaveBeenCalled()
  })

  it('shows an error toast when deleting fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.deleteBook).mockRejectedValue({
      code: 'BOOK_NOT_FOUND',
      message: 'Buku tidak ditemukan',
    })

    renderBooksPage()
    await screen.findByText('Belajar React')

    const rows = screen.getAllByRole('row')
    await user.click(within(rows[1]).getByRole('button', { name: 'Hapus' }))

    const dialog = screen.getByRole('dialog', { name: 'Hapus Buku' })
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    expect(api.deleteBook).toHaveBeenCalledWith('test-token', '1')
    expect(await screen.findByText('Buku tidak ditemukan')).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Hapus Buku' }),
    ).toBeInTheDocument()
  })
})
