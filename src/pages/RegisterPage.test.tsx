import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import * as api from '../lib/api'
import { RegisterPage } from './RegisterPage'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return { ...actual, register: vi.fn() }
})

const renderRegisterPage = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<p>Dashboard page</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('registers successfully, shows a toast, and redirects to the dashboard', async () => {
    const user = userEvent.setup()
    vi.mocked(api.register).mockResolvedValue({
      token: 'new-token',
      user: { id: '1', name: 'Budi Santoso', email: 'budi@example.com' },
    })

    renderRegisterPage()

    await user.type(screen.getByLabelText('Nama'), 'Budi Santoso')
    await user.type(screen.getByLabelText('Email'), 'budi@example.com')
    await user.type(screen.getByLabelText('Kata sandi'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Daftar' }))

    expect(api.register).toHaveBeenCalledWith({
      name: 'Budi Santoso',
      email: 'budi@example.com',
      password: 'password123',
    })
    expect(await screen.findByText('Akun berhasil dibuat')).toBeInTheDocument()
    expect(await screen.findByText('Dashboard page')).toBeInTheDocument()
  })

  it('shows an error toast when the email is already registered', async () => {
    const user = userEvent.setup()
    vi.mocked(api.register).mockRejectedValue({
      code: 'EMAIL_ALREADY_REGISTERED',
      message: 'Email is already registered',
    })

    renderRegisterPage()

    await user.type(screen.getByLabelText('Nama'), 'Budi Santoso')
    await user.type(screen.getByLabelText('Email'), 'budi@example.com')
    await user.type(screen.getByLabelText('Kata sandi'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Daftar' }))

    expect(
      await screen.findByText('Email is already registered'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument()
  })

  it('blocks submission when fields are invalid', async () => {
    const user = userEvent.setup()

    renderRegisterPage()

    await user.type(screen.getByLabelText('Email'), 'budi@example.com')
    await user.type(screen.getByLabelText('Kata sandi'), '1234567')
    await user.click(screen.getByRole('button', { name: 'Daftar' }))

    expect(await screen.findByText('Nama wajib diisi')).toBeInTheDocument()
    expect(
      screen.getByText('Kata sandi minimal 8 karakter'),
    ).toBeInTheDocument()
    expect(api.register).not.toHaveBeenCalled()
  })
})
