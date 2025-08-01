import { vi } from 'vitest'
import userEvent from '@testing-library/user-event'

import router, {
  EVENT_ROUTE_CANCEL,
  EVENT_ROUTE_CHANGE,
  EVENT_ROUTE_SHOULD_CHANGE,
} from '../src'

import {
  describe,
  beforeEach,
  afterEach,
  test,
  expect,
} from 'vitest'

// Test setup will be done in beforeEach

const ROUTES = [
  {
    path: '/',
    resolver: () => 0,
  },
  {
    path: '/users/',
    resolver: () => 1,
  },
]

let changeStub = null

function createAnchor () {
  const anchor = document.createElement('a')

  anchor.href = '/test-endpoint'
  document.body.appendChild(anchor)

  return anchor
}

beforeEach(() => {
  changeStub = vi.fn()

  // Setup window.location mock
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost:3000/',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    writable: true,
  })

  // Setup history mock
  Object.defineProperty(window, 'history', {
    value: {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    },
    writable: true,
  })

  // Ensure document.body exists
  if (!document.body) {
    document.body = document.createElement('body')
  }

  window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, changeStub)
  router.initialize()
})

afterEach(() => {
  window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, changeStub)
})

describe('global events', () => {
  test('when meta+clicking an anchor tag', async () => {
    const anchor = createAnchor()

    await userEvent.click(anchor, { meta: true })

    expect(window.history.pushState).not.toHaveBeenCalled()
  })

  test('when ctrl+clicking an anchor tag', async () => {
  })

  test('when shift+clicking an anchor tag', async () => {
  })

  test('when meta+clicking an anchor tag', async () => {
  })

  test('when an anchor tag is clicked while meta key is pressed', async () => {
  })

  test('when an anchor tag click event is already prevented', async () => {
  })

  // test('when a route changes', async () => {
  //   let changeStub

  //   beforeEach(() => {
  //     changeStub = sandbox.stub()
  //     window.addEventListener(EVENT_ROUTE_CHANGE, changeStub)

  //     mockHash('/users/')
  //   })

  //   afterEach(() => {
  //     window.removeEventListener(EVENT_ROUTE_CHANGE, changeStub)
  //   })

  //   it('invokes routechange event', () =>
  //     expect(changeStub.calledOnce).to.be.true)
  // })

  // test('when a route change is canceled', async () => {
  //   let cancelStub

  //   const cancel = e => e.preventDefault()

  //   beforeEach(() => {
  //     cancelStub = sandbox.stub()
  //     window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, cancel)
  //     window.addEventListener(EVENT_ROUTE_CANCEL, cancelStub)

  //     mockHash('/users/')
  //   })

  //   afterEach(() => {
  //     window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, cancel)
  //     window.removeEventListener(EVENT_ROUTE_CANCEL, cancelStub)
  //   })

  //   it('cancels the route', () => expect(cancelStub.calledOnce).to.be.true)
  // })
})
