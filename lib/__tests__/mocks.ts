/**
 * Mock implementations for testing
 */

export const mockFetch = (response: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
  })
}

export const mockFetchError = (error: string) => {
  return jest.fn().mockRejectedValue(new Error(error))
}

export const mockLocalStorage = () => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
  }
}

export const mockClipboard = () => {
  return {
    writeText: jest.fn().mockResolvedValue(undefined),
  }
}

export const mockNotification = () => {
  return jest.fn().mockImplementation(() => ({
    onclick: null,
    close: jest.fn(),
  }))
}

export const mockIntersectionObserver = () => {
  return jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

export const mockResizeObserver = () => {
  return jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }))
}

/**
 * Setup common mocks for all tests
 */
export const setupCommonMocks = () => {
  // Mock fetch globally
  global.fetch = mockFetch({}) as any

  // Mock localStorage
  const localStorageMock = mockLocalStorage()
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock Clipboard API
  Object.assign(navigator, {
    clipboard: mockClipboard(),
  })

  // Mock Notification API
  global.Notification = mockNotification() as any

  // Mock IntersectionObserver
  global.IntersectionObserver = mockIntersectionObserver() as any

  // Mock ResizeObserver
  global.ResizeObserver = mockResizeObserver() as any
}

/**
 * Reset all mocks after each test
 */
export const resetAllMocks = () => {
  jest.clearAllMocks()
  localStorage.clear()
}
