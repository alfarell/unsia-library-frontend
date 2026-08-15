import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createBook,
  createLoan,
  createMember,
  deleteBook,
  deleteMember,
  getDashboardSummary,
  getMe,
  listBooks,
  listLoans,
  listMembers,
  returnLoan,
  updateMember,
} from './api'

vi.mock('axios', () => ({
  default: {
    isAxiosError: (error: unknown) =>
      typeof error === 'object' && error !== null && 'isAxiosError' in error,
    request: vi.fn(),
  },
}))

const mockRequest = vi.mocked(axios.request)

const response = (data: unknown, status = 200): AxiosResponse =>
  ({ data, status, statusText: 'OK' }) as unknown as AxiosResponse

describe('apiRequest', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('unwraps the data envelope and sends the bearer token', async () => {
    const books = [
      {
        id: '1',
        author: 'Penulis Satu',
        category: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        createdBy: null,
        isbn: null,
        publicationYear: null,
        publisher: null,
        title: 'Buku Satu',
        totalCopies: 1,
        updatedAt: '2026-01-01T00:00:00.000Z',
        updatedBy: null,
      },
    ]
    mockRequest.mockResolvedValue(response({ data: { books } }))

    await expect(listBooks('token-123')).resolves.toEqual({ books })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
        method: 'GET',
        url: '/api/books',
      }),
    )
  })

  it('resolves undefined for a 204 empty body', async () => {
    mockRequest.mockResolvedValue(response('', 204))

    await expect(deleteBook('token-123', '1')).resolves.toBeUndefined()
  })

  it('throws ApiError with the backend error payload', async () => {
    mockRequest.mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: {
          error: {
            code: 'ISBN_ALREADY_EXISTS',
            message: 'ISBN sudah terdaftar',
          },
        },
      },
    })

    await expect(
      createBook('token-123', { title: 'Buku', author: 'Penulis' }),
    ).rejects.toMatchObject({
      code: 'ISBN_ALREADY_EXISTS',
      message: 'ISBN sudah terdaftar',
      status: 400,
    })
  })

  it('wraps non-axios failures as ApiError with UNKNOWN_ERROR', async () => {
    mockRequest.mockRejectedValue(new Error('network down'))

    await expect(getMe('token-123')).rejects.toMatchObject({
      code: 'UNKNOWN_ERROR',
      message: 'network down',
      status: 0,
    })
  })

  it('lists members with the bearer token', async () => {
    const members = [
      {
        address: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        createdBy: null,
        email: 'budi@example.com',
        id: '1',
        membershipCode: 'UNSIA00001',
        name: 'Budi Santoso',
        phone: null,
        updatedAt: '2026-01-01T00:00:00.000Z',
        updatedBy: null,
      },
    ]
    mockRequest.mockResolvedValue(response({ data: { members } }))

    await expect(listMembers('token-123')).resolves.toEqual({ members })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
        method: 'GET',
        url: '/api/members',
      }),
    )
  })

  it('creates a member with the payload excluding membershipCode', async () => {
    const member = {
      address: 'Jakarta',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      email: 'sari@example.com',
      id: '2',
      membershipCode: 'UNSIA00002',
      name: 'Sari Dewi',
      phone: '0812',
      updatedAt: '2026-01-01T00:00:00.000Z',
      updatedBy: null,
    }
    mockRequest.mockResolvedValue(response({ data: { member } }, 201))

    await expect(
      createMember('token-123', {
        name: 'Sari Dewi',
        email: 'sari@example.com',
        phone: '0812',
        address: 'Jakarta',
      }),
    ).resolves.toEqual({ member })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          name: 'Sari Dewi',
          email: 'sari@example.com',
          phone: '0812',
          address: 'Jakarta',
        },
        method: 'POST',
        url: '/api/members',
      }),
    )
  })

  it('updates a member partially', async () => {
    const member = {
      address: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      email: 'sari@example.com',
      id: '2',
      membershipCode: 'UNSIA00002',
      name: 'Sari Dewi',
      phone: null,
      updatedAt: '2026-02-01T00:00:00.000Z',
      updatedBy: null,
    }
    mockRequest.mockResolvedValue(response({ data: { member } }))

    await expect(
      updateMember('token-123', '2', { phone: '0813' }),
    ).resolves.toEqual({ member })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { phone: '0813' },
        method: 'PUT',
        url: '/api/members/2',
      }),
    )
  })

  it('resolves undefined when deleting a member with an empty body', async () => {
    mockRequest.mockResolvedValue(response('', 204))

    await expect(deleteMember('token-123', '2')).resolves.toBeUndefined()
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        url: '/api/members/2',
      }),
    )
  })

  it('throws ApiError with the member backend error payload', async () => {
    mockRequest.mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email sudah terdaftar',
          },
        },
      },
    })

    await expect(
      createMember('token-123', { name: 'Budi', email: 'budi@example.com' }),
    ).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Email sudah terdaftar',
      status: 400,
    })
  })

  it('lists loans with the bearer token', async () => {
    const loans = [
      {
        books: [
          {
            activeLoans: 1,
            author: 'Penulis Satu',
            id: '1',
            isbn: null,
            title: 'Buku Satu',
            totalCopies: 3,
          },
        ],
        borrowedAt: '2026-01-01T10:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        createdBy: null,
        durationDays: 7,
        id: '1',
        member: { id: '1', membershipCode: 'UNSIA00001', name: 'Budi Santoso' },
        returnedAt: null,
        status: 'borrowed',
        updatedAt: '2026-01-01T00:00:00.000Z',
        updatedBy: null,
      },
    ]
    mockRequest.mockResolvedValue(response({ data: { loans } }))

    await expect(listLoans('token-123')).resolves.toEqual({ loans })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
        method: 'GET',
        url: '/api/loans',
      }),
    )
  })

  it('creates a loan with memberId, bookIds, and durationDays', async () => {
    const loan = {
      books: [
        {
          activeLoans: 1,
          author: 'Penulis Satu',
          id: '1',
          isbn: null,
          title: 'Buku Satu',
          totalCopies: 3,
        },
      ],
      borrowedAt: '2026-01-01T10:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      durationDays: 7,
      id: '1',
      member: { id: '1', membershipCode: 'UNSIA00001', name: 'Budi Santoso' },
      returnedAt: null,
      status: 'borrowed',
      updatedAt: '2026-01-01T00:00:00.000Z',
      updatedBy: null,
    }
    mockRequest.mockResolvedValue(response({ data: { loan } }, 201))

    await expect(
      createLoan('token-123', {
        memberId: '1',
        bookIds: ['1', '2'],
        durationDays: 7,
      }),
    ).resolves.toEqual({ loan })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { memberId: '1', bookIds: ['1', '2'], durationDays: 7 },
        method: 'POST',
        url: '/api/loans',
      }),
    )
  })

  it('returns a loan via the return endpoint', async () => {
    const loan = {
      books: [],
      borrowedAt: '2026-01-01T10:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      createdBy: null,
      durationDays: 7,
      id: '1',
      member: null,
      returnedAt: '2026-01-08T16:00:00.000Z',
      status: 'returned',
      updatedAt: '2026-02-01T00:00:00.000Z',
      updatedBy: null,
    }
    mockRequest.mockResolvedValue(response({ data: { loan } }))

    await expect(returnLoan('token-123', '1')).resolves.toEqual({ loan })
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'PUT',
        url: '/api/loans/1/return',
      }),
    )
  })

  it('throws ApiError with the loan backend error payload', async () => {
    mockRequest.mockRejectedValue({
      isAxiosError: true,
      message: 'Request failed with status code 400',
      response: {
        status: 400,
        data: {
          error: {
            code: 'BOOK_OUT_OF_STOCK',
            message: 'Stok buku tidak mencukupi',
          },
        },
      },
    })

    await expect(
      createLoan('token-123', {
        memberId: '1',
        bookIds: ['1'],
        durationDays: 7,
      }),
    ).rejects.toMatchObject({
      code: 'BOOK_OUT_OF_STOCK',
      message: 'Stok buku tidak mencukupi',
      status: 400,
    })
  })

  it('fetches dashboard summary with the bearer token', async () => {
    const dashboardData = {
      summary: {
        totalBooks: 1248,
        activeMembers: 486,
        activeLoans: 93,
        overdueLoans: 7,
      },
      loanStatus: {
        borrowed: 93,
        returned: 176,
        overdue: 7,
      },
      recentActivities: [
        {
          module: 'loans',
          action: 'borrow',
          description_id: 'Buku dipinjam oleh Budi Santoso',
          description_en: 'A book was borrowed by Budi Santoso',
          user: { name: 'Budi Santoso' },
          createdAt: '2026-08-15T20:00:00.000Z',
        },
      ],
    }
    mockRequest.mockResolvedValue(response({ data: dashboardData }))

    await expect(getDashboardSummary('token-123')).resolves.toEqual(
      dashboardData,
    )
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-123' },
        method: 'GET',
        url: '/api/dashboard/summary',
      }),
    )
  })
})
