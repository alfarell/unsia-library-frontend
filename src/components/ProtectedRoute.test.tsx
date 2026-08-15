import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import * as api from '../lib/api'
import { setStoredAuth, setStoredUser } from '../lib/storage'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return { ...actual, getMe: vi.fn() }
})

const renderRoute = (entry: string) =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[entry]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<p>Dashboard page</p>} />
            </Route>
            <Route path="/login" element={<p>Login page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('redirects to /login when there is no stored token', async () => {
    renderRoute('/dashboard')

    expect(await screen.findByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
  })

  it('renders the dashboard when a valid token is stored', async () => {
    setStoredUser({
      id: '1',
      name: 'Test User',
      email: 'user@example.com',
    })
    setStoredAuth('valid-token')
    vi.mocked(api.getMe).mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'user@example.com' },
    })

    renderRoute('/dashboard')

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })
})
