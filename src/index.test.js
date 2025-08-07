import { vi } from 'vitest'

import router, {
  EVENT_ROUTE_CANCEL,
  EVENT_ROUTE_CHANGE,
  EVENT_ROUTE_SHOULD_CHANGE,
  handleAnchorClick,
} from './'

import {
  describe,
  beforeEach,
  afterEach,
  test,
  expect,
} from 'vitest'

const WINDOW_LOCATION_ORIGINAL = { ...window.location }

function createClickEvent({
  tag = 'A',
  metaKey = false,
  ctrlKey = false,
  shiftKey = false,
} = {}) {
  const elem = document.createElement(tag)
  elem.href = '/test-endpoint'

  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  })

  Object.defineProperties(event, {
    currentTarget: { value: elem },
    target: { value: elem },
    metaKey: { value: metaKey },
    ctrlKey: { value: ctrlKey },
    shiftKey: { value: shiftKey },
    button: { value: 0 },
  })

  event.composedPath = vi.fn(() => [elem])

  return event
}

let cancelEventStub = null
let changeEventStub = null
let shouldChangeEventStub = null

beforeEach(() => {
  cancelEventStub = vi.fn()
  changeEventStub = vi.fn()
  shouldChangeEventStub = vi.fn()

  window.location = {
    ...WINDOW_LOCATION_ORIGINAL,
    protocol: 'https:',
    host: 'my-domain.com',
    origin: 'https://my-domain.com',
  }

  window.history.pushState = vi.fn()
  window.history.replaceState = vi.fn()
})


describe('global events', () => {
  test('when NOT initialized', () => {
    expect(router.isInitialized()).toBe(false)
  })

  test('when NOT initialized', () => {
    router.initialize()

    expect(router.isInitialized()).toBe(true)

    router.shutdown()
  })

  test('when initialized', () => {
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    router.initialize()

    expect(shouldChangeEventStub).toHaveBeenCalledOnce()
    expect(changeEventStub).toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    router.shutdown()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
  })

  test('when initialized twice', () => {
    const fn = () => {
      router.initialize()
      router.initialize()
    }

    expect(fn).toThrowError(new Error('Router is already initialized'))

    router.shutdown()
  })

  test('when meta+clicking an anchor tag', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent({ metaKey: true })

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when ctrl+clicking an anchor tag', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent({ ctrlKey: true })

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when shift+clicking an anchor tag', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent({ shiftKey: true })

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag click is already prevented', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent({})
    event.preventDefault()

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when a non-anchor tag is clicked', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent({ tag: 'div' })

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag has a "target"', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    event.target.setAttribute('target', '_blank')

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag has "download" attribute', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    event.target.setAttribute('download', 'test-download')

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag has "rel" attribute set to "external"', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    event.target.setAttribute('rel', 'external')

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when "anchor.href" is not set', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    event.target.href = ''

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag href is a "mailto" link', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    event.target.href = 'mailto:test@test.com'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when NO "location.origin" AND anchor tag IS same origin', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    window.location.origin = ''
    window.location.protocol = 'http:'
    window.location.host = 'some-origin.com'
    window.location.href = 'http://some-origin.com/users/123'
    event.target.href = 'http://some-origin.com/users/123'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when NO "location.origin" AND anchor tag NOT same origin', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    window.location.origin = ''
    window.location.protocol = 'http:'
    window.location.host = 'some-origin.com'
    window.location.href = 'http://some-origin.com/users/123'
    event.target.href = 'http://another-origin.com/users/123'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when "location.origin" EXISTS AND anchor tag IS same origin', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    window.location.origin = 'http://some-origin.com'
    window.location.protocol = 'http:'
    window.location.host = 'some-origin.com'
    window.location.href = 'http://some-origin.com/users/123'
    event.target.href = 'http://some-origin.com/users/123'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when "location.origin" EXISTS AND anchor tag NOT same origin', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    window.location.origin = 'http://some-origin.com'
    window.location.protocol = 'http:'
    window.location.host = 'some-origin.com'
    window.location.href = 'http://some-origin.com/users/123'
    event.target.href = 'http://another-origin.com/users/123'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag href IS different "location.href"', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()

    window.location.origin = 'https://some-domain.com'
    window.location.href = 'https://some-domain.com/users'
    event.target.href = 'https://some-domain.com/users/123'

    handleAnchorClick(event)

    expect(window.history.pushState).toHaveBeenCalledOnce()

    expect(window.history.pushState).toHaveBeenCalledWith(
      {},
      '',
      '/users/123',
    )

    expect(changeEventStub).toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/users/123')
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when anchor tag href is identical to location href', () => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()
    window.location.href = 'https://some-domain.com/users/123'
    event.target.href = 'https://some-domain.com/users/123'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).not.toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).not.toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  test('when a route change is cancelled from "EVENT_ROUTE_SHOULD_CHANGE" event', () => {
    shouldChangeEventStub.mockImplementation(event => {
      event.preventDefault()
    })

    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)

    const event = createClickEvent()

    window.location.origin = 'https://some-domain.com'
    window.location.href = 'https://some-domain.com/users'
    event.target.href = 'https://some-domain.com/users/123'

    handleAnchorClick(event)

    expect(shouldChangeEventStub).toHaveBeenCalledOnce()
    expect(changeEventStub).not.toHaveBeenCalled()
    expect(cancelEventStub).toHaveBeenCalledOnce()
    expect(window.history.pushState).not.toHaveBeenCalled()
    expect(window.history.replaceState).not.toHaveBeenCalled()

    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })
})

describe('NOT initialized', () => {
  test('when navigate() is invoked', () => {
    const fn = () => router.navigate('/users/123')

    expect(fn).toThrowError(new Error('Router is not initialized'))
  })

  test('when redirect() is invoked', () => {
    const fn = () => router.redirect('/users/123')

    expect(fn).toThrowError(new Error('Router is not initialized'))
  })

  test('when matchSwitch() is invoked', () => {
    const resolverStub = vi.fn()
    const fn = () => router.matchSwitch('/users/123', resolverStub)

    expect(fn).toThrowError(new Error('Router is not initialized'))
  })
})

describe('interface', () => {
  beforeEach(() => {
    router.initialize()
    window.addEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.addEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
  })

  afterEach(() => {
    window.removeEventListener(EVENT_ROUTE_CANCEL, cancelEventStub)
    window.removeEventListener(EVENT_ROUTE_CHANGE, changeEventStub)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, shouldChangeEventStub)
    router.shutdown()
  })

  describe('getPath()', () => {
    test('when invoked', () => {
      window.location.pathname = '/users/123'

      expect(router.getPath()).toBe('/users/123')
    })
  })

  describe('getHash()', () => {
    test('when invoked', () => {
      window.location.hash = '#/photos/456'

      expect(router.getHash()).toBe('#/photos/456')
    })
  })

  describe('getQuery()', () => {
    test('when invoked', () => {
      window.location.search = 'foo=bar'

      expect(router.getQuery()).toEqual({
        foo: 'bar',
      })
    })
  })

  describe('getSegments()', () => {
    test('when "location.pathname" has no beginning or ending slashes', () => {
      window.location.pathname = 'users/123'

      expect(router.getSegments()).toEqual([
        'users',
        '123',
      ])
    })

    test('when "location.pathname" has a beginning slash', () => {
      window.location.pathname = '/users/123'

      expect(router.getSegments()).toEqual([
        'users',
        '123',
      ])
    })

    test('when "location.pathname" has an ending slash', () => {
      window.location.pathname = 'users/123/'

      expect(router.getSegments()).toEqual([
        'users',
        '123',
      ])
    })

    test('when "location.pathname" has slashes on both ends', () => {
      window.location.pathname = '/users/123/'

      expect(router.getSegments()).toEqual([
        'users',
        '123',
      ])
    })
  })

  describe('navigate()', () => {
    test('when navigating to same route AND same querystring', () => {
      window.location.pathname = '/users/123'
      window.location.search = 'a=foo'

      router.navigate('/users/123', {
        a: 'foo',
      })

      expect(shouldChangeEventStub).not.toHaveBeenCalled()
      expect(changeEventStub).not.toHaveBeenCalled()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()
      expect(window.history.pushState).not.toHaveBeenCalled()
      expect(window.history.replaceState).not.toHaveBeenCalled()
    })

    test('when navigating to same route AND different querystring', () => {
      window.location.pathname = '/users/123'
      window.location.search = 'a=foo'

      router.navigate('/users/123', {
        a: 'bar',
      })

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()

      expect(window.history.pushState).toHaveBeenCalledOnce()
      expect(window.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/users/123?a=bar',
      )

      expect(window.history.replaceState).not.toHaveBeenCalled()
    })

    test('when navigating to different route AND same querystring', () => {
      window.location.pathname = '/users/123'
      window.location.search = 'a=foo'

      router.navigate('/photos/123?a=foo')

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()

      expect(window.history.pushState).toHaveBeenCalledOnce()
      expect(window.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/photos/123?a=foo',
      )

      expect(window.history.replaceState).not.toHaveBeenCalled()
    })

    test('when navigating to different route AND different querystring', () => {
      window.location.pathname = '/users/123'
      window.location.search = 'a=foo'

      router.navigate('/photos/123', {
        a: 'bar',
      })

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()

      expect(window.history.pushState).toHaveBeenCalledOnce()
      expect(window.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/photos/123?a=bar',
      )

      expect(window.history.replaceState).not.toHaveBeenCalled()
    })

    test('when invoked with NO query', () => {
      router.navigate('/users/123')

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/users/123')
      expect(window.history.replaceState).not.toHaveBeenCalled()
      expect(window.location.search).toBe('')
    })

    test('when invoked WITH query', () => {
      router.navigate('/users/123', {
        a: 'foo',
        b: 'bar',
      })

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()
      expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/users/123?a=foo&b=bar')
      expect(window.history.replaceState).not.toHaveBeenCalled()
    })
  })

  describe('redirect()', () => {
    test('when navigating to the current route', () => {
      window.location.pathname = '/users/123'

      router.redirect('/users/123')

      expect(shouldChangeEventStub).not.toHaveBeenCalled()
      expect(changeEventStub).not.toHaveBeenCalled()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()
      expect(window.history.pushState).not.toHaveBeenCalled()
      expect(window.history.replaceState).not.toHaveBeenCalled()
      expect(window.location.search).toBe('')
    })

    test('when invoked with NO query', () => {
      router.redirect('/users/123')

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()
      expect(window.history.pushState).not.toHaveBeenCalled()
      expect(window.history.replaceState).toHaveBeenCalledWith({}, '', '/users/123')
      expect(window.location.search).toBe('')
    })

    test('when invoked WITH query', () => {
      router.redirect('/users/123', {
        a: 'foo',
        b: 'bar',
      })

      expect(shouldChangeEventStub).toHaveBeenCalledOnce()
      expect(changeEventStub).toHaveBeenCalledOnce()
      expect(cancelEventStub).not.toHaveBeenCalledOnce()
      expect(window.history.pushState).not.toHaveBeenCalled()
      expect(window.history.replaceState).toHaveBeenCalledWith({}, '', '/users/123?a=foo&b=bar')
    })
  })

  describe('matchSwitch()', () => {
    test('when NO matching paths are provided', () => {
      const NAV_ITEMS = [
        {
          path: '/users',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          path: '/photos',
          resolver: vi.fn(() => '<p>PHOTOS</p>'),
        },
        {
          path: '/appointments',
          resolver: vi.fn(() => '<p>APPOINTMENTS</p>'),
        },
      ]

      window.location.pathname = '/asdf'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when multiple matching paths are provided', () => {
      const NAV_ITEMS = [
        {
          path: '/some-random-path',
          resolver: vi.fn(() => '<p>SOME RANDOM PATH</p>'),
        },
        {
          path: '/users/:userId',
          resolver: vi.fn(() => '<p>EXPECTED PATH</p>'),
        },
        {
          path: '/',
          resolver: vi.fn(() => '<p>ROOT PATH</p>'),
        },
      ]

      window.location.pathname = '/users/123'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('<p>EXPECTED PATH</p>')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledOnce()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledWith({
        routeTail: '/',
        navItem: NAV_ITEMS[1],
        params: {
          userId: '123',
        },
        query: {},
        data: {},
      })

      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when matching just the beginning of the path', () => {
      const NAV_ITEMS = [
        {
          path: '/photos',
          resolver: vi.fn(() => '<p>ROOT</p>'),
        },
        {
          path: '/users',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          path: '/appointments',
          resolver: vi.fn(() => '<p>USER ID</p>'),
        },
      ]

      window.location.pathname = '/users/123'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('<p>USERS</p>')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledOnce()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledWith({
        routeTail: '/123',
        navItem: NAV_ITEMS[1],
        params: {},
        query: {},
        data: {},
      })

      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when "routePath" is provided', () => {
      const NAV_ITEMS = [
        {
          path: '/photos',
          resolver: vi.fn(() => '<p>ROOT</p>'),
        },
        {
          path: '/users',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          path: '/appointments',
          resolver: vi.fn(() => '<p>USER ID</p>'),
        },
      ]

      window.location.pathname = '/'

      const result = router.matchSwitch(NAV_ITEMS, '/users/123')

      expect(result).toBe('<p>USERS</p>')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledOnce()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledWith({
        routeTail: '/123',
        navItem: NAV_ITEMS[1],
        params: {},
        query: {},
        data: {},
      })

      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when matching "exact" is "false"', () => {
      const NAV_ITEMS = [
        {
          exact: false,
          path: '/photos',
          resolver: vi.fn(() => '<p>ROOT</p>'),
        },
        {
          exact: false,
          path: '/users',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          exact: false,
          path: '/appointments',
          resolver: vi.fn(() => '<p>USER ID</p>'),
        },
      ]

      window.location.pathname = '/users/123'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('<p>USERS</p>')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledOnce()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledWith({
        routeTail: '/123',
        navItem: NAV_ITEMS[1],
        params: {},
        query: {},
        data: {},
      })

      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when matching "exact" is "true" with longer input route', () => {
      const NAV_ITEMS = [
        {
          exact: false,
          path: '/photos',
          resolver: vi.fn(() => '<p>ROOT</p>'),
        },
        {
          exact: true,
          path: '/users',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          exact: false,
          path: '/appointments',
          resolver: vi.fn(() => '<p>USER ID</p>'),
        },
      ]

      window.location.pathname = '/users/123'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[1].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when matching "exact" is "true" with an identical path', () => {
      const NAV_ITEMS = [
        {
          exact: false,
          path: '/photos',
          resolver: vi.fn(() => '<p>ROOT</p>'),
        },
        {
          exact: true,
          path: '/users',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          exact: false,
          path: '/appointments',
          resolver: vi.fn(() => '<p>USER ID</p>'),
        },
      ]

      window.location.pathname = '/users'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('<p>USERS</p>')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledOnce()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledWith({
        routeTail: '/',
        navItem: NAV_ITEMS[1],
        params: {},
        query: {},
        data: {},
      })

      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when matched with extra metadata', () => {
      const NAV_ITEMS = [
        {
          exact: false,
          path: '/photos',
          extra1: 'a',
          extra2: 'b',
          resolver: vi.fn(() => '<p>ROOT</p>'),
        },
        {
          exact: true,
          path: '/users',
          extra3: 'c',
          extra4: 'd',
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
        {
          exact: false,
          path: '/appointments',
          extra5: 'e',
          extra6: 'f',
          resolver: vi.fn(() => '<p>USER ID</p>'),
        },
      ]

      window.location.pathname = '/users'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('<p>USERS</p>')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledOnce()

      expect(NAV_ITEMS[1].resolver).toHaveBeenCalledWith({
        routeTail: '/',
        navItem: NAV_ITEMS[1],
        params: {},
        query: {},
        data: {},
      })

      expect(NAV_ITEMS[2].resolver).not.toHaveBeenCalled()
    })

    test('when matched item has a "redirect()" directive', () => {
      const NAV_ITEMS = [
        {
          path: '/users/:userId',
          resolver: vi.fn(() => '<p>SELECTED USER</p>'),
        },
        {
          path: '/users',
          redirect: vi.fn(() => '/users/123'),
          resolver: vi.fn(() => '<p>USERS</p>'),
        },
      ]

      window.location.pathname = '/users'

      const result = router.matchSwitch(NAV_ITEMS)

      expect(result).toBe('')
      expect(NAV_ITEMS[0].resolver).not.toHaveBeenCalled()
      expect(NAV_ITEMS[1].resolver).not.toHaveBeenCalled()

      expect(NAV_ITEMS[1].redirect).toHaveBeenCalledOnce()
      expect(NAV_ITEMS[1].redirect).toHaveBeenCalledWith({
        routeTail: '/',
        navItem: NAV_ITEMS[1],
        params: {},
        query: {},
        data: {},
      })

      expect(window.history.pushState).toHaveBeenCalledOnce()
      expect(window.history.pushState).toHaveBeenCalledWith(
        {},
        '',
        '/users/123',
      )
    })
  })
})
