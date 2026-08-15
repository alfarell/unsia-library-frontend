import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../contexts/AuthContext'
import { ToastProvider } from '../contexts/ToastContext'
import * as api from '../lib/api'
import { setStoredAuth, setStoredUser } from '../lib/storage'
import { MembersPage } from './MembersPage'

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>()
  return {
    ...actual,
    createMember: vi.fn(),
    deleteMember: vi.fn(),
    getMe: vi.fn(),
    listMembers: vi.fn(),
    updateMember: vi.fn(),
  }
})

const members: api.Member[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '081234567890',
    address: 'Jakarta',
    membershipCode: 'UNSIA00001',
    createdBy: { id: '9', name: 'Admin Satu' },
    updatedBy: { id: '9', name: 'Admin Satu' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Sari Dewi',
    email: 'sari@example.com',
    phone: null,
    address: null,
    membershipCode: 'UNSIA00002',
    createdBy: null,
    updatedBy: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  },
]

const renderMembersPage = () =>
  render(
    <ToastProvider>
      <AuthProvider>
        <MemoryRouter>
          <MembersPage />
        </MemoryRouter>
      </AuthProvider>
    </ToastProvider>,
  )

describe('MembersPage', () => {
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
    vi.mocked(api.listMembers).mockResolvedValue({ members })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders the member table with the specified columns', async () => {
    renderMembersPage()

    expect(await screen.findByText('Budi Santoso')).toBeInTheDocument()
    expect(screen.getByText('Sari Dewi')).toBeInTheDocument()

    expect(screen.getByRole('columnheader', { name: 'No' })).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'No. Anggota' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Nama' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Email' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Aksi' }),
    ).toBeInTheDocument()

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(within(rows[1]).getByText('1')).toBeInTheDocument()
    expect(within(rows[1]).getByText('UNSIA00001')).toBeInTheDocument()
    expect(within(rows[1]).getByText('budi@example.com')).toBeInTheDocument()
    expect(within(rows[2]).getByText('2')).toBeInTheDocument()
  })

  it('shows an empty state when there are no members', async () => {
    vi.mocked(api.listMembers).mockResolvedValue({ members: [] })

    renderMembersPage()

    expect(
      await screen.findByText('Belum ada data anggota'),
    ).toBeInTheDocument()
  })

  it('creates a member without membershipCode and reloads the list', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createMember).mockResolvedValue({ member: members[0] })

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    await user.click(screen.getByRole('button', { name: 'Tambah Anggota' }))
    await user.type(screen.getByLabelText('Nama'), 'Anggota Baru')
    await user.type(screen.getByLabelText('Email'), 'anggota@example.com')
    await user.type(screen.getByLabelText('Telepon'), '0813')

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(api.createMember).toHaveBeenCalledWith('test-token', {
      name: 'Anggota Baru',
      email: 'anggota@example.com',
      phone: '0813',
    })
    expect(api.createMember).not.toHaveBeenCalledWith(
      'test-token',
      expect.objectContaining({ membershipCode: expect.anything() }),
    )
    expect(
      await screen.findByText('Anggota berhasil ditambahkan'),
    ).toBeInTheDocument()
    await waitFor(() => expect(api.listMembers).toHaveBeenCalledTimes(2))
  })

  it('validates required fields before creating', async () => {
    const user = userEvent.setup()

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    await user.click(screen.getByRole('button', { name: 'Tambah Anggota' }))
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Nama wajib diisi')).toBeInTheDocument()
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument()
    expect(api.createMember).not.toHaveBeenCalled()
  })

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup()

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    await user.click(screen.getByRole('button', { name: 'Tambah Anggota' }))
    await user.type(screen.getByLabelText('Nama'), 'Anggota Baru')
    await user.type(screen.getByLabelText('Email'), 'bukan-email')

    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(
      await screen.findByText('Format email tidak valid'),
    ).toBeInTheDocument()
    expect(api.createMember).not.toHaveBeenCalled()
  })

  it('edits a member omitting empty optional fields', async () => {
    const user = userEvent.setup()
    vi.mocked(api.updateMember).mockResolvedValue({ member: members[1] })

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    const rows = screen.getAllByRole('row')
    await user.click(within(rows[2]).getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Nama')).toHaveValue('Sari Dewi')
    expect(screen.getByLabelText('Email')).toHaveValue('sari@example.com')
    expect(screen.getByLabelText('Telepon')).toHaveValue('')
    expect(screen.getByLabelText('Alamat')).toHaveValue('')

    await user.clear(screen.getByLabelText('Nama'))
    await user.type(screen.getByLabelText('Nama'), 'Sari Baru')

    await user.click(screen.getByRole('button', { name: 'Perbarui' }))

    expect(api.updateMember).toHaveBeenCalledWith('test-token', '2', {
      name: 'Sari Baru',
      email: 'sari@example.com',
    })
    expect(
      await screen.findByText('Anggota berhasil diperbarui'),
    ).toBeInTheDocument()
  })

  it('shows all fields and audit info in the detail modal', async () => {
    const user = userEvent.setup()

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    const rows = screen.getAllByRole('row')
    await user.click(
      within(rows[1]).getByRole('button', { name: 'Lihat detail' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Detail Anggota' })

    expect(within(dialog).getByText('Budi Santoso')).toBeInTheDocument()
    expect(within(dialog).getByText('budi@example.com')).toBeInTheDocument()
    expect(within(dialog).getByText('UNSIA00001')).toBeInTheDocument()
    expect(within(dialog).getByText('081234567890')).toBeInTheDocument()
    expect(within(dialog).getByText('Jakarta')).toBeInTheDocument()
    expect(within(dialog).getAllByText('Admin Satu')).toHaveLength(2)
    expect(within(dialog).getAllByText(/2026/).length).toBeGreaterThan(0)
  })

  it('falls back to a dash when optional fields and audit users are null', async () => {
    const user = userEvent.setup()

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    const rows = screen.getAllByRole('row')
    await user.click(
      within(rows[2]).getByRole('button', { name: 'Lihat detail' }),
    )

    const dialog = screen.getByRole('dialog', { name: 'Detail Anggota' })

    expect(within(dialog).getAllByText('—')).toHaveLength(4)
  })

  it('deletes a member after confirmation', async () => {
    const user = userEvent.setup()
    vi.mocked(api.deleteMember).mockResolvedValue(undefined)

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    const rows = screen.getAllByRole('row')
    await user.click(within(rows[1]).getByRole('button', { name: 'Hapus' }))

    const dialog = screen.getByRole('dialog', { name: 'Hapus Anggota' })
    expect(
      within(dialog).getByText('Hapus anggota "Budi Santoso"?'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    expect(api.deleteMember).toHaveBeenCalledWith('test-token', '1')
    expect(
      await screen.findByText('Anggota berhasil dihapus'),
    ).toBeInTheDocument()
    await waitFor(() => expect(api.listMembers).toHaveBeenCalledTimes(2))
  })

  it('shows an error toast when loading fails', async () => {
    vi.mocked(api.listMembers).mockRejectedValue({
      code: 'SERVER_ERROR',
      message: 'Gagal memuat anggota',
    })

    renderMembersPage()

    expect(await screen.findByText('Gagal memuat anggota')).toBeInTheDocument()
  })

  it('shows an error toast when creating fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.createMember).mockRejectedValue({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email sudah terdaftar',
    })

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    await user.click(screen.getByRole('button', { name: 'Tambah Anggota' }))
    await user.type(screen.getByLabelText('Nama'), 'Anggota Duplikat')
    await user.type(screen.getByLabelText('Email'), 'budi@example.com')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Email sudah terdaftar')).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Tambah Anggota' }),
    ).toBeInTheDocument()
  })

  it('shows a loading state while fetching members', () => {
    vi.mocked(api.listMembers).mockReturnValue(new Promise(() => {}))

    renderMembersPage()

    expect(screen.getByText('Memuat…')).toBeInTheDocument()
  })

  it('shows an error toast when deleting fails', async () => {
    const user = userEvent.setup()
    vi.mocked(api.deleteMember).mockRejectedValue({
      code: 'MEMBER_NOT_FOUND',
      message: 'Anggota tidak ditemukan',
    })

    renderMembersPage()
    await screen.findByText('Budi Santoso')

    const rows = screen.getAllByRole('row')
    await user.click(within(rows[1]).getByRole('button', { name: 'Hapus' }))

    const dialog = screen.getByRole('dialog', { name: 'Hapus Anggota' })
    await user.click(within(dialog).getByRole('button', { name: 'Hapus' }))

    expect(api.deleteMember).toHaveBeenCalledWith('test-token', '1')
    expect(
      await screen.findByText('Anggota tidak ditemukan'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('dialog', { name: 'Hapus Anggota' }),
    ).toBeInTheDocument()
  })
})
