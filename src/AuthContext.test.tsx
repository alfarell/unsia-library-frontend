import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from './lib/api'
import { setStoredAuth, setStoredUser } from './lib/storage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'

vi.mock('./lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/api')>()
  return { ...actual, getMe: vi.fn() }
})

function AuthConsumer() {
  const { isInitializing, signOut, token, user } = useAuth()

  return (
    <div>
      <p data-testid="user">{user?.email ?? 'none'}</p>
      <p data-testid="token">{token ?? 'none'}</p>
      <p data-testid="init">{isInitializing ? 'yes' : 'no'}</p>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </ToastProvider>,
  )

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('hydrates user and token from storage and validates via getMe', async () => {
    setStoredUser({
      id: '1',
      name: 'Test User',
      email: 'user@example.com',
    })
    setStoredAuth('stored-token')
    vi.mocked(api.getMe).mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'user@example.com' },
    })

    renderProvider()

    expect(screen.getByTestId('user')).toHaveTextContent('user@example.com')
    expect(screen.getByTestId('token')).toHaveTextContent('stored-token')
    await waitFor(() =>
      expect(screen.getByTestId('init')).toHaveTextContent('no'),
    )
    expect(api.getMe).toHaveBeenCalledWith('stored-token')
  })

  it('signs out and clears both storage keys', async () => {
    setStoredUser({
      id: '1',
      name: 'Test User',
      email: 'user@example.com',
    })
    setStoredAuth('stored-token')
    vi.mocked(api.getMe).mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'user@example.com' },
    })

    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId('init')).toHaveTextContent('no'),
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(screen.getByTestId('user')).toHaveTextContent('none')
    expect(screen.getByTestId('token')).toHaveTextContent('none')
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('auth')).toBeNull()
  })

  it('signs out with an error toast when the stored token is invalid', async () => {
    setStoredUser({
      id: '1',
      name: 'Test User',
      email: 'user@example.com',
    })
    setStoredAuth('expired-token')
    vi.mocked(api.getMe).mockRejectedValue(
      new api.ApiError(401, {
        code: 'UNAUTHENTICATED',
        message: 'Unauthenticated',
      }),
    )

    renderProvider()

    expect(await screen.findByText('Unauthenticated')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('token')).toHaveTextContent('none'),
    )
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('auth')).toBeNull()
  })
})
