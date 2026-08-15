import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { UserMenu } from './UserMenu'

const signOut = vi.fn()

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signOut,
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
  }),
}))

vi.mock('../../contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}))

const renderMenu = () =>
  render(
    <MemoryRouter>
      <UserMenu />
    </MemoryRouter>,
  )

describe('UserMenu', () => {
  beforeEach(() => {
    signOut.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('opens the menu showing the user name and logout button', () => {
    renderMenu()

    const avatar = screen.getByRole('button', { name: 'Buka menu pengguna' })
    expect(avatar).toHaveAttribute('aria-haspopup', 'menu')
    expect(avatar).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(avatar)

    expect(avatar).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Keluar' })).toBeInTheDocument()
  })

  it('signs out when the logout button is clicked', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Buka menu pengguna' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Keluar' }))

    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('closes the menu on outside click', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Buka menu pengguna' }))
    expect(screen.getByText('Test User')).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })

  it('closes the menu on Escape', () => {
    renderMenu()

    fireEvent.click(screen.getByRole('button', { name: 'Buka menu pengguna' }))
    expect(screen.getByText('Test User')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByText('Test User')).not.toBeInTheDocument()
  })
})
