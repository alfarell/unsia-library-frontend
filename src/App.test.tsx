import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import i18n from './i18n/config'
import { setStoredAuth, setStoredUser } from './lib/storage'

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="loan-chart" />,
}))

vi.mock('./lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./lib/api')>()
  return {
    ...actual,
    getMe: vi.fn().mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
    }),
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
})
