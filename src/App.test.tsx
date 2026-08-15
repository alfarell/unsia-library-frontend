import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import i18n from './i18n/config'
import { setStoredAuth, setStoredUser } from './lib/storage'

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="loan-chart" />,
}))

vi.mock('./components/dashboard/LoanStatusChart', () => ({
  LoanStatusChart: () => <div data-testid="loan-chart" />,
}))

vi.mock('./lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/api')>()
  return {
    ...actual,
    getDashboardSummary: vi.fn().mockResolvedValue({
      summary: {
        totalBooks: 1248,
        activeMembers: 486,
        activeLoans: 93,
        overdueLoans: 7,
      },
      loanStatus: {
        borrowed: 93,
        returned: 176,
        overdue: 7,
      },
      recentActivities: [],
    }),
    getMe: vi.fn().mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    }),
    listBooks: vi.fn().mockResolvedValue({ books: [] }),
    listLoans: vi.fn().mockResolvedValue({ loans: [] }),
    listMembers: vi.fn().mockResolvedValue({ members: [] }),
  }
})

afterEach(() => {
  cleanup()
})

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('id')
    setStoredAuth('test-token')
    setStoredUser({
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    })
  })

  it('renders the Indonesian dashboard by default', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        name: 'Kelola perpustakaan dalam satu ruang kerja.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('loan-chart')).toBeInTheDocument()
  })

  it('switches the interface language', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Ganti bahasa' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Manage the library in one workspace.',
      }),
    ).toBeInTheDocument()
  })

  it('keeps the theme toggle and opens the user menu from the avatar', async () => {
    render(<App />)

    expect(
      await screen.findByRole('button', { name: 'Ganti tema' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Buka menu pengguna' }))

    expect(await screen.findByText('Test User')).toBeInTheDocument()
  })

  it('navigates to the books page via the sidebar link', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('link', { name: 'Buku' }))

    expect(
      await screen.findByRole('heading', { name: 'Manajemen Buku' }),
    ).toBeInTheDocument()
  })

  it('navigates to the members page via the sidebar link', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('link', { name: 'Anggota' }))

    expect(
      await screen.findByRole('heading', { name: 'Manajemen Anggota' }),
    ).toBeInTheDocument()
  })

  it('navigates to the loans page via the sidebar link', async () => {
    render(<App />)

    fireEvent.click(await screen.findByRole('link', { name: 'Peminjaman' }))

    expect(
      await screen.findByRole('heading', { name: 'Manajemen Peminjaman' }),
    ).toBeInTheDocument()
  })
})
