import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import * as api from '../lib/api'
import { LoginPage } from './LoginPage'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return { ...actual, login: vi.fn() }
})

const renderLoginPage = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<p>Dashboard page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('signs in successfully, shows a toast, and redirects to the dashboard', async () => {
    const user = userEvent.setup()
    vi.mocked(api.login).mockResolvedValue({
      token: 'new-token',
      user: { id: '1', name: 'Test User', email: 'user@example.com' },
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Kata sandi'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(api.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(await screen.findByText('Berhasil masuk')).toBeInTheDocument()
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
  })

  it('shows an error toast when credentials are invalid', async () => {
    const user = userEvent.setup()
    vi.mocked(api.login).mockRejectedValue({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid credentials',
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Kata sandi'), 'wrongpass123')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
  })

  it('blocks submission with client validation errors', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'invalid-email')
    await user.type(screen.getByLabelText('Kata sandi'), '1234567')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(
      await screen.findByText('Format email tidak valid'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Kata sandi minimal 8 karakter'),
    ).toBeInTheDocument()
    expect(api.login).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Masuk' })).toBeEnabled(),
    )
  })
})
