import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export type AuthUser = {
  id: string
  email: string
  name: string
}

export type AuthResponse = {
  token: string
  user: AuthUser
}

export type Book = {
  author: string
  category: string | null | undefined
  createdAt: string
  createdBy: { id: string; name: string } | null
  id: string
  isbn: string | null | undefined
  publicationYear: number | null | undefined
  publisher: string | null | undefined
  title: string
  totalCopies: number
  updatedAt: string
  updatedBy: { id: string; name: string } | null
}

export type BookPayload = {
  author?: string
  category?: string
  isbn?: string
  publicationYear?: number
  publisher?: string
  title?: string
  totalCopies?: number
}

export type Member = {
  address: string | null | undefined
  createdAt: string
  createdBy: { id: string; name: string } | null
  email: string
  id: string
  membershipCode: string | null | undefined
  name: string
  phone: string | null | undefined
  updatedAt: string
  updatedBy: { id: string; name: string } | null
}

export type MemberPayload = {
  address?: string
  email?: string
  name?: string
  phone?: string
}

type ApiErrorPayload = {
  code: string
  details?: unknown
  message: string
}

export class ApiError extends Error {
  code: string
  details?: unknown
  status: number

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.code = payload.code
    this.status = status
    this.details = payload.details
  }
}

export function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError ||
    (typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error)
  )
}

type ApiRequestOptions = {
  body?: unknown
  method?: string
  token?: string
}

function extractErrorPayload(
  data: unknown,
  fallbackMessage: string,
): ApiErrorPayload {
  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as { error?: unknown }).error === 'object' &&
    (data as { error: ApiErrorPayload | null }).error !== null
  ) {
    const error = (data as { error: Partial<ApiErrorPayload> }).error
    return {
      code: error.code ?? 'UNKNOWN_ERROR',
      message: error.message ?? fallbackMessage,
      details: error.details,
    }
  }
  return { code: 'UNKNOWN_ERROR', message: fallbackMessage }
}

async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  try {
    const response = await axios.request({
      baseURL: API_BASE_URL,
      url: path,
      method: options.method ?? 'GET',
      data: options.body,
      headers: options.token
        ? { Authorization: `Bearer ${options.token}` }
        : undefined,
    })

    const body = response.data

    if (body === null || body === undefined || body === '') {
      return undefined as T
    }

    const payload = body as { data: T } | { error: ApiErrorPayload }

    if ('data' in payload) {
      return payload.data
    }

    throw new ApiError(response.status, payload.error)
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0
      const data = error.response?.data
      throw new ApiError(status, extractErrorPayload(data, error.message))
    }

    throw new ApiError(0, {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

export function register(payload: {
  email: string
  name: string
  password: string
}) {
  return apiRequest<AuthResponse>('/api/auth/register', {
    body: payload,
    method: 'POST',
  })
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/api/auth/login', {
    body: payload,
    method: 'POST',
  })
}

export function getMe(token: string) {
  return apiRequest<{ user: AuthUser }>('/api/auth/me', { token })
}

export function listBooks(token: string) {
  return apiRequest<{ books: Book[] }>('/api/books', { token })
}

export function createBook(token: string, payload: BookPayload) {
  return apiRequest<{ book: Book }>('/api/books', {
    body: payload,
    method: 'POST',
    token,
  })
}

export function updateBook(token: string, id: string, payload: BookPayload) {
  return apiRequest<{ book: Book }>(`/api/books/${id}`, {
    body: payload,
    method: 'PUT',
    token,
  })
}

export function deleteBook(token: string, id: string) {
  return apiRequest<void>(`/api/books/${id}`, {
    method: 'DELETE',
    token,
  })
}

export function listMembers(token: string) {
  return apiRequest<{ members: Member[] }>('/api/members', { token })
}

export function createMember(token: string, payload: MemberPayload) {
  return apiRequest<{ member: Member }>('/api/members', {
    body: payload,
    method: 'POST',
    token,
  })
}

export function updateMember(
  token: string,
  id: string,
  payload: MemberPayload,
) {
  return apiRequest<{ member: Member }>(`/api/members/${id}`, {
    body: payload,
    method: 'PUT',
    token,
  })
}

export function deleteMember(token: string, id: string) {
  return apiRequest<void>(`/api/members/${id}`, {
    method: 'DELETE',
    token,
  })
}
