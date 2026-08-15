import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import '../i18n/config'

vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
