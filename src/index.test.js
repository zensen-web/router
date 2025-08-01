import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import router, {
  EVENT_ROUTE_CANCEL,
  EVENT_ROUTE_CHANGE,
  EVENT_ROUTE_SHOULD_CHANGE,
} from './'

import {
  describe,
  beforeEach,
  afterEach,
  test,
  expect,
} from 'vitest'

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

  window.history.pushState = vi.fn()
  window.history.replaceState = vi.fn()
  window.addEventListener(EVENT_ROUTE_CANCEL, changeStub)
  window.addEventListener(EVENT_ROUTE_CHANGE, changeStub)
  window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, changeStub)
  router.initialize()
})

afterEach(() => {
  window.removeEventListener(EVENT_ROUTE_CANCEL, changeStub)
  window.removeEventListener(EVENT_ROUTE_CHANGE, changeStub)
  window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, changeStub)
})

describe('global events', () => {
  test('when meta+clicking an anchor tag', async () => {
    const anchor = createAnchor()

    await userEvent.click(anchor, { metaKey: true })

    expect(window.history.pushState).not.toHaveBeenCalled()
  })

  test('when ctrl+clicking an anchor tag', async () => {
  })

  test('when shift+clicking an anchor tag', async () => {
  })

  test('when meta+clicking an anchor tag', async () => {
  })

  test('when anchor tag click is already prevented', async () => {
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
  //   })

  //   afterEach(() => {
  //     window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, cancel)
  //     window.removeEventListener(EVENT_ROUTE_CANCEL, cancelStub)
  //   })

  //   it('cancels the route', () => expect(cancelStub.calledOnce).to.be.true)
  // })
})
