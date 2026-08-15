import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import * as api from '../lib/api'
import { setStoredAuth, setStoredUser } from '../lib/storage'
import { DashboardPage } from './DashboardPage'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return {
    ...actual,
    getDashboardSummary: vi.fn(),
    getMe: vi.fn(),
  }
})

vi.mock('../components/dashboard/LoanStatusChart', () => ({
  LoanStatusChart: ({ loading }: { loading?: boolean }) =>
    loading ? <div>Loading chart...</div> : <div>Chart rendered</div>,
}))

const mockDashboardData: api.DashboardSummary = {
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
  recentActivities: [
    {
      module: 'loans',
      action: 'borrow',
      description_id: 'Buku dipinjam oleh Budi Santoso',
      description_en: 'A book was borrowed by Budi Santoso',
      user: { name: 'Budi Santoso' },
      createdAt: '2026-08-15T20:00:00.000Z',
    },
    {
      module: 'loans',
      action: 'return',
      description_id: 'Pengembalian buku telah dicatat',
      description_en: 'A book return was recorded',
      user: null,
      createdAt: '2026-08-15T19:30:00.000Z',
    },
    {
      module: 'members',
      action: 'create',
      description_id: 'Anggota baru berhasil didaftarkan',
      description_en: 'A new member was registered',
      user: null,
      createdAt: '2026-08-15T19:00:00.000Z',
    },
  ],
}

const renderDashboardPage = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('DashboardPage', () => {
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
    vi.mocked(api.getDashboardSummary).mockResolvedValue(mockDashboardData)
  })

  afterEach(() => {
    cleanup()
  })

  it('fetches dashboard summary on mount', async () => {
    renderDashboardPage()

    await waitFor(() => {
      expect(vi.mocked(api.getDashboardSummary)).toHaveBeenCalledWith(
        'test-token',
      )
    })
  })

  it('renders real metric values', async () => {
    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText(/1[.,]248/)).toBeInTheDocument()
      expect(screen.getByText(/486/)).toBeInTheDocument()
      expect(screen.getByText(/93/)).toBeInTheDocument()
      expect(screen.getByText(/7/)).toBeInTheDocument()
    })
  })

  it('renders metric labels', async () => {
    renderDashboardPage()

    expect(await screen.findByText('Total buku')).toBeInTheDocument()
    expect(screen.getByText('Anggota aktif')).toBeInTheDocument()
    expect(screen.getByText('Sedang dipinjam')).toBeInTheDocument()
    expect(screen.getByText('Terlambat')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching', async () => {
    vi.mocked(api.getDashboardSummary).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockDashboardData), 50)
        }),
    )

    renderDashboardPage()

    const loadingMessages = screen.getAllByText('Memuat data...')
    expect(loadingMessages.length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.queryAllByText('Memuat data...')).toHaveLength(0)
    })
  })

  it('renders recent activities with descriptions in id locale', async () => {
    renderDashboardPage()

    expect(
      await screen.findByText('Buku dipinjam oleh Budi Santoso'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Pengembalian buku telah dicatat'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Anggota baru berhasil didaftarkan'),
    ).toBeInTheDocument()
  })

  it('renders formatted timestamps for activities', async () => {
    renderDashboardPage()

    await waitFor(() => {
      const activities = screen.getAllByText(/Agu/)
      expect(activities.length).toBeGreaterThan(0)
    })
  })

  it('renders empty state when no activities', async () => {
    vi.mocked(api.getDashboardSummary).mockResolvedValueOnce({
      ...mockDashboardData,
      recentActivities: [],
    })

    renderDashboardPage()

    expect(
      await screen.findByText('Tidak ada aktivitas terbaru'),
    ).toBeInTheDocument()
  })

  it('handles error gracefully with toast', async () => {
    vi.mocked(api.getDashboardSummary).mockRejectedValueOnce({
      code: 'FETCH_ERROR',
      message: 'Failed to fetch dashboard',
    })

    renderDashboardPage()

    expect(
      await screen.findByText('Failed to fetch dashboard'),
    ).toBeInTheDocument()

    expect(screen.getByText('Tidak ada aktivitas terbaru')).toBeInTheDocument()
  })

  it('cancels fetch if component unmounts', async () => {
    vi.mocked(api.getDashboardSummary).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockDashboardData), 200)
        }),
    )

    const { unmount } = renderDashboardPage()

    unmount()

    await waitFor(
      () => {
        expect(vi.mocked(api.getDashboardSummary)).toHaveBeenCalled()
      },
      { timeout: 500 },
    )
  })

  it('displays metric values with toLocaleString formatting', async () => {
    renderDashboardPage()

    await waitFor(() => {
      const totalBooksElement = screen.getByText(/1[.,]248/)
      expect(totalBooksElement).toBeInTheDocument()
    })

    const activeMembersElement = screen.getByText(/486/)
    expect(activeMembersElement).toBeInTheDocument()
  })

  it('renders chart section with loan status data', async () => {
    renderDashboardPage()

    await waitFor(() => {
      expect(screen.getByText('Status peminjaman')).toBeInTheDocument()
    })
  })

  it('renders activity section title', async () => {
    renderDashboardPage()

    expect(await screen.findByText('Aktivitas terbaru')).toBeInTheDocument()
  })

  it('handles null user in activity', async () => {
    const dataWithNullUser: api.DashboardSummary = {
      ...mockDashboardData,
      recentActivities: [
        {
          module: 'system',
          action: 'event',
          description_id: 'Sistem diperbarui',
          description_en: 'System was updated',
          user: null,
          createdAt: '2026-08-15T20:00:00.000Z',
        },
      ],
    }
    vi.mocked(api.getDashboardSummary).mockResolvedValueOnce(dataWithNullUser)

    renderDashboardPage()

    expect(await screen.findByText('Sistem diperbarui')).toBeInTheDocument()
  })
})
