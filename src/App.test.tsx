import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import i18n from './i18n/config'

vi.mock('react-chartjs-2', () => ({
  Doughnut: () => <div data-testid="loan-chart" />,
}))

afterEach(() => {
  cleanup()
})

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear()
    await i18n.changeLanguage('id')
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
  })

  it('renders the Indonesian dashboard by default', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', {
        name: 'Kelola perpustakaan dalam satu ruang kerja.',
      }),
    ).toBeInTheDocument()
    expect(screen.getByTestId('loan-chart')).toBeInTheDocument()
  })

  it('switches the interface language', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Ganti bahasa' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Manage the library in one workspace.',
      }),
    ).toBeInTheDocument()
  })
})
