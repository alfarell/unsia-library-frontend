import {
  cleanup,
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
import { LoansPage } from './LoansPage'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return {
    ...actual,
    createLoan: vi.fn(),
    getMe: vi.fn(),
    listBooks: vi.fn(),
    listLoans: vi.fn(),
    listMembers: vi.fn(),
    returnLoan: vi.fn(),
  }
})

const loans: api.Loan[] = [
  {
    id: '1',
    member: { id: '1', membershipCode: 'UNSIA00001', name: 'Budi Santoso' },
    books: [
      {
        id: '1',
        title: 'Belajar React',
        author: 'Penulis Satu',
        isbn: '978-1',
        activeLoans: 1,
        totalCopies: 3,
      },
      {
        id: '2',
        title: 'Novel Senja',
        author: 'Penulis Dua',
        isbn: null,
        activeLoans: 1,
        totalCopies: 2,
      },
    ],
    status: 'borrowed',
    durationDays: 7,
    borrowedAt: '2026-01-01T10:00:00.000Z',
    returnedAt: null,
    createdBy: { id: '9', name: 'Admin Satu' },
    updatedBy: { id: '9', name: 'Admin Satu' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    member: { id: '2', membershipCode: 'UNSIA00002', name: 'Sari Dewi' },
    books: [
      {
        id: '1',
        title: 'Belajar React',
        author: 'Penulis Satu',
        isbn: '978-1',
        activeLoans: 2,
        totalCopies: 3,
      },
    ],
    status: 'returned',
    durationDays: 14,
    borrowedAt: '2026-06-01T08:00:00.000Z',
    returnedAt: '2026-06-15T16:30:00.000Z',
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
]

const members: api.Member[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
    address: 'Jakarta',
    membershipCode: 'UNSIA00001',
    createdBy: { id: '9', name: 'Admin Satu' },
    updatedBy: { id: '9', name: 'Admin Satu' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Sari Dewi',
    email: 'sari@example.com',
    phone: null,
    address: null,
    membershipCode: 'UNSIA00002',
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
]

const books: api.Book[] = [
  {
    id: '1',
    title: 'Belajar React',
    author: 'Penulis Satu',
    isbn: '978-1',
    publisher: 'Penerbit A',
    publicationYear: 2024,
    category: 'Teknologi',
    totalCopies: 3,
    activeLoans: 1,
    createdBy: { id: '9', name: 'Admin Satu' },
    updatedBy: { id: '9', name: 'Admin Satu' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Novel Senja',
    author: 'Penulis Dua',
    isbn: null,
    publisher: null,
    publicationYear: null,
    category: null,
    totalCopies: 2,
    activeLoans: 2,
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
]

const renderLoansPage = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>
          <LoansPage />
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('LoansPage', () => {
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
    vi.mocked(api.listLoans).mockResolvedValue({ loans })
    vi.mocked(api.listMembers).mockResolvedValue({ members })
    vi.mocked(api.listBooks).mockResolvedValue({ books })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the loan table with the specified columns and multi-book cell', async () => {
    renderLoansPage()

    expect(
      await screen.findByText('Belajar React +1 lainnya'),
    ).toBeInTheDocument()
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument()
    expect(screen.getByText('Sari Dewi')).toBeInTheDocument()
    expect(screen.getByText('Dipinjam')).toBeInTheDocument()
    expect(screen.getByText('Dikembalikan')).toBeInTheDocument()

    expect(screen.getByRole('columnheader', { name: 'No' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Anggota' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Buku' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Tanggal Pinjam' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Aksi' }),
    ).toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(within(rows[1]).getByText('1')).toBeInTheDocument()
    expect(within(rows[1]).getAllByText(/2026/).length).toBeGreaterThan(0)
    expect(within(rows[2]).getByText('2')).toBeInTheDocument()
  })

  it('shows the return action only for borrowed loans', async () => {
    renderLoansPage()

    await screen.findByText('Belajar React +1 lainnya')

    expect(
      screen.getAllByRole('button', { name: 'Lihat detail' }),
    ).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Kembalikan' })).toHaveLength(
      1,
    )
  })

  it('shows an empty state when there are no loans', async () => {
    vi.mocked(api.listLoans).mockResolvedValue({ loans: [] })

    renderLoansPage()

    expect(
      await screen.findByText('Belum ada data peminjaman'),
    ).toBeInTheDocument()
  })

  it('shows a loading state while fetching loans', () => {
    vi.mocked(api.listLoans).mockReturnValue(new Promise(() => {}))

    renderLoansPage()

    expect(screen.getByText('Memuat…')).toBeInTheDocument()
  })

  it('creates a loan with the selected member and books and reloads the list', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createLoan).mockResolvedValue({ loan: loans[0] })

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    await user.click(screen.getByRole('button', { name: 'Pinjam Buku' }))

    const memberSelect = await screen.findByLabelText('Anggota')
    await screen.findByRole('checkbox', { name: 'Belajar React' })
    expect(screen.getByRole('checkbox', { name: 'Novel Senja' })).toBeDisabled()
    expect(screen.getByText('Tersisa 2 dari 3')).toBeInTheDocument()
    expect(screen.getByText('Tersisa 0 dari 2')).toBeInTheDocument()

    await user.selectOptions(memberSelect, '1')
    await user.click(screen.getByRole('checkbox', { name: 'Belajar React' }))

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(api.createLoan).toHaveBeenCalledWith('test-token', {
      memberId: '1',
      bookIds: ['1'],
      durationDays: 7,
    })
    expect(
      await screen.findByText('Peminjaman berhasil dicatat'),
    ).toBeInTheDocument()
    await waitFor(() => expect(api.listLoans).toHaveBeenCalledTimes(2))
  })

  it('validates a member and at least one book before creating', async () => {
    const user = userEvent.setup()

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    await user.click(screen.getByRole('button', { name: 'Pinjam Buku' }))
    const durationInput = await screen.findByLabelText('Durasi (hari)')
    await user.clear(durationInput)
    await screen.findByRole('checkbox', { name: 'Belajar React' })

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    const alerts = await screen.findAllByRole('alert')
    expect(alerts).toHaveLength(3)
    expect(alerts[0]).toHaveTextContent('Pilih anggota')
    expect(alerts[1]).toHaveTextContent('Masukkan durasi pinjam')
    expect(alerts[2]).toHaveTextContent('Pilih minimal satu buku')
    expect(api.createLoan).not.toHaveBeenCalled()
  })

  it('rejects invalid loan duration', async () => {
    const user = userEvent.setup()

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    await user.click(screen.getByRole('button', { name: 'Pinjam Buku' }))
    await screen.findByLabelText('Anggota')

    const durationInput = await screen.findByLabelText('Durasi (hari)')
    await user.clear(durationInput)
    await user.type(durationInput, '0')

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    const alerts = await screen.findAllByRole('alert')
    expect(
      alerts.some((a) => a.textContent?.includes('Durasi harus 1–365 hari')),
    ).toBe(true)
    expect(api.createLoan).not.toHaveBeenCalled()
  })

  it('returns a loan after confirmation and reloads the list', async () => {
    const user = userEvent.setup()
    vi.mocked(api.returnLoan).mockResolvedValue({ loan: loans[1] })

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    await user.click(screen.getByRole('button', { name: 'Kembalikan' }))

    const dialog = screen.getByRole('dialog', {
      name: 'Konfirmasi Pengembalian',
    })
    expect(within(dialog).getByText('Budi Santoso')).toBeInTheDocument()
    expect(within(dialog).getByText('Belajar React')).toBeInTheDocument()
    expect(within(dialog).getByText('Novel Senja')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Kembalikan' }))

    expect(api.returnLoan).toHaveBeenCalledWith('test-token', '1')
    expect(
      await screen.findByText('Buku berhasil dikembalikan'),
    ).toBeInTheDocument()
    await waitFor(() => expect(api.listLoans).toHaveBeenCalledTimes(2))
  })

  it('shows all fields and audit info in the detail modal', async () => {
    const user = userEvent.setup()

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    const rows = screen.getAllByRole('row')
    await user.click(
      within(rows[1]).getByRole('button', { name: 'Lihat detail' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Detail Peminjaman' })

    expect(within(dialog).getByText('Budi Santoso')).toBeInTheDocument()
    expect(within(dialog).getByText('UNSIA00001')).toBeInTheDocument()
    expect(
      within(dialog).getByText('Belajar React — Penulis Satu — 978-1'),
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Novel Senja — Penulis Dua — —'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Dipinjam')).toBeInTheDocument()
    expect(within(dialog).getByText('7 hari')).toBeInTheDocument()
    expect(within(dialog).getAllByText('Admin Satu')).toHaveLength(2)
    expect(within(dialog).getAllByText(/2026/).length).toBeGreaterThan(0)
  })

  it('shows an error toast when loading fails', async () => {
    vi.mocked(api.listLoans).mockRejectedValue({
      code: 'SERVER_ERROR',
      message: 'Gagal memuat peminjaman',
    })

    renderLoansPage()

    expect(
      await screen.findByText('Gagal memuat peminjaman'),
    ).toBeInTheDocument()
  })

  it('shows an error toast when creating fails and keeps the modal open', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createLoan).mockRejectedValue({
      code: 'BOOK_OUT_OF_STOCK',
      message: 'Stok buku tidak mencukupi',
    })

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    await user.click(screen.getByRole('button', { name: 'Pinjam Buku' }))
    const memberSelect = await screen.findByLabelText('Anggota')
    await screen.findByRole('checkbox', { name: 'Belajar React' })

    await user.selectOptions(memberSelect, '1')
    await user.click(screen.getByRole('checkbox', { name: 'Belajar React' }))
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(
      await screen.findByText('Stok buku tidak mencukupi'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Pinjam Buku' }),
    ).toBeInTheDocument()
  })

  it('reloads the list when returning fails with LOAN_ALREADY_RETURNED', async () => {
    const user = userEvent.setup()
    vi.mocked(api.returnLoan).mockRejectedValue({
      code: 'LOAN_ALREADY_RETURNED',
      message: 'Peminjaman sudah dikembalikan',
    })

    renderLoansPage()
    await screen.findByText('Belajar React +1 lainnya')

    await user.click(screen.getByRole('button', { name: 'Kembalikan' }))
    const dialog = screen.getByRole('dialog', {
      name: 'Konfirmasi Pengembalian',
    })
    await user.click(within(dialog).getByRole('button', { name: 'Kembalikan' }))

    expect(api.returnLoan).toHaveBeenCalledWith('test-token', '1')
    expect(
      await screen.findByText('Peminjaman sudah dikembalikan'),
    ).toBeInTheDocument()
    await waitFor(() => expect(api.listLoans).toHaveBeenCalledTimes(2))
  })
})
