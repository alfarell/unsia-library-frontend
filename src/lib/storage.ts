export type StoredUser = {
  id: string
  email: string
  name: string
}

const USER_KEY = 'user'
const AUTH_KEY = 'auth'

function parseStored(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getStoredUser(): StoredUser | null {
  const value = parseStored(USER_KEY)

  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<StoredUser>).id === 'string' &&
    typeof (value as Partial<StoredUser>).name === 'string' &&
    typeof (value as Partial<StoredUser>).email === 'string'
  ) {
    return {
      id: (value as StoredUser).id,
      name: (value as StoredUser).name,
      email: (value as StoredUser).email,
    }
  }

  return null
}

export function setStoredUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearStoredUser() {
  localStorage.removeItem(USER_KEY)
}

export function getStoredAuth(): string | null {
  const value = parseStored(AUTH_KEY)

  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { token?: unknown }).token === 'string'
  ) {
    return (value as { token: string }).token
  }

  return null
}

export function setStoredAuth(token: string) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ token }))
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY)
}
