import { vi } from 'vitest'

// Mock window.location before tests run
const mockLocation = {
  href: 'http://localhost:3000/',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  pathname: '/',
  search: '',
  hash: '',
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock history API
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
  },
  writable: true,
})

// Mock document.body if it doesn't exist
if (!document.body) {
  document.body = document.createElement('body')
}