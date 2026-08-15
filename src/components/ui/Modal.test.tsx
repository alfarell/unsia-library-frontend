import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the dialog with title and content when open', () => {
    render(
      <Modal open title="Test Title" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog', { name: 'Test Title' })

    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <Modal open={false} title="Test Title" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn()

    render(
      <Modal open title="Test Title" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    )

    const backdrop = screen.getByRole('dialog').parentElement

    expect(backdrop).not.toBeNull()
    fireEvent.mouseDown(backdrop as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking inside the panel', () => {
    const onClose = vi.fn()

    render(
      <Modal open title="Test Title" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    )

    fireEvent.mouseDown(screen.getByText('Modal body'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Escape and removes the listener afterwards', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    const { rerender } = render(
      <Modal open title="Test Title" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)

    rerender(
      <Modal open={false} title="Test Title" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    )

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes via the X button', () => {
    const onClose = vi.fn()

    render(
      <Modal open title="Test Title" onClose={onClose}>
        <p>Modal body</p>
      </Modal>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('moves focus to the close button when opened', () => {
    render(
      <Modal open title="Test Title" onClose={vi.fn()}>
        <p>Modal body</p>
      </Modal>,
    )

    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveFocus()
  })

  it('restores focus to the previously focused element when closed', async () => {
    const { rerender } = render(
      <>
        <button type="button">Trigger</button>
        <Modal open={false} title="Test Title" onClose={vi.fn()}>
          <p>Modal body</p>
        </Modal>
      </>,
    )

    const trigger = screen.getByRole('button', { name: 'Trigger' })
    trigger.focus()
    expect(trigger).toHaveFocus()

    rerender(
      <>
        <button type="button">Trigger</button>
        <Modal open title="Test Title" onClose={vi.fn()}>
          <p>Modal body</p>
        </Modal>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveFocus()

    rerender(
      <>
        <button type="button">Trigger</button>
        <Modal open={false} title="Test Title" onClose={vi.fn()}>
          <p>Modal body</p>
        </Modal>
      </>,
    )

    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('traps Tab focus within the dialog', async () => {
    const user = userEvent.setup()

    render(
      <>
        <button type="button">Outside</button>
        <Modal open title="Test Title" onClose={vi.fn()}>
          <button type="button">Action</button>
          <p>Modal body</p>
        </Modal>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Action' })).toHaveFocus()
  })
})
