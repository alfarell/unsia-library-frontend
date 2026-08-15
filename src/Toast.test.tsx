import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider, useToast } from './contexts/ToastContext'
import type { ToastVariant } from './components/ui/Toast'

function ToastTrigger({ variant }: { variant: ToastVariant }) {
  const { showToast } = useToast()

  return (
    <button
      type="button"
      onClick={() => showToast('Halo', variant)}
      aria-label="show"
    >
      show
    </button>
  )
}

const renderTrigger = (variant: ToastVariant = 'success') =>
  render(
    <ToastProvider>
      <ToastTrigger variant={variant} />
    </ToastProvider>,
  )

afterEach(() => {
  vi.useRealTimers()
  cleanup()
})

describe('Toast', () => {
  it('renders a success toast with the message and a close button', () => {
    renderTrigger('success')

    fireEvent.click(screen.getByRole('button', { name: 'show' }))

    expect(screen.getByRole('status')).toHaveTextContent('Halo')
    expect(screen.getByRole('button', { name: 'Tutup' })).toBeInTheDocument()
  })

  it('renders an error toast', () => {
    renderTrigger('error')

    fireEvent.click(screen.getByRole('button', { name: 'show' }))

    expect(screen.getByRole('status')).toHaveTextContent('Halo')
  })

  it('dismisses the toast when the close button is clicked', () => {
    renderTrigger()

    fireEvent.click(screen.getByRole('button', { name: 'show' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('auto-dismisses after about 4 seconds', () => {
    vi.useFakeTimers()
    renderTrigger()

    fireEvent.click(screen.getByRole('button', { name: 'show' }))
    expect(screen.getByRole('status')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(4000)
    })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
