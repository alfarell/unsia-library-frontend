import axios from 'axios'
import type { AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBook, deleteBook, getMe, listBooks } from './api'

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
})
