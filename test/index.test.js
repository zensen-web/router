import sinon from 'sinon'

import { expect } from 'chai'

import {
  EVENT_ROUTE_CHANGE,
  EVENT_ROUTE_CANCEL,
  EVENT_ROUTE_SHOULD_CHANGE,
  configure,
  getParams,
  getRoute,
  matchRoute,
  matchRouteSwitch,
  getQuerystring,
} from '../src'

const ROUTES = [
  {
    path: '/',
    renderer: () => 0,
  },
  {
    path: '/users/',
    renderer: () => 1,
  },
]

const pass = () => true
const passInput = (params, tail) => ({ tail, params })

function mockHash(route) {
  configure({
    useHash: true,
    stubbedLocation: {
      pathname: '/',
      hash: `#${route}`,
    },
  })
}

describe.only('router', () => {
  let sandbox, changeStub

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    changeStub = sandbox.stub()

    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, changeStub)
  })

  afterEach(() => {
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, changeStub)
    sandbox.restore()
  })

  context('getParams()', () => {
    it('provides params', () =>
      expect(
        getParams('/users/:userId/photos/:photoId', '/users/123/photos/456')
      ).to.deep.eq({
        userId: '123',
        photoId: '456',
      }))
  })

  context('getRoute()', () => {
    beforeEach(() => {
      configure({
        useHash: true,
        stubbedLocation: {
          pathname: '/sub-domain/',
          hash: `#/users/`,
        }
      })
    })

    context('when useHash is set', () => {
      it('only reports the hash', () => expect(getRoute()).to.be.eq('/users/'))

      it('invokes routechange event', () =>
        expect(changeStub.calledOnce).to.be.true)
    })

    context('when useHash is NOT set', () => {
      beforeEach(() => {
        configure({ useHash: false })
      })

      it('only reports the hash', () =>
        expect(getRoute()).to.be.eq('/sub-domain/#/users/'))
    })
  })

  context('getQuerystring()', () => {
    it('provides querystring params', () => {
      expect(
        getQuerystring('/users?sort=asc&limit=20&offset=4&flagged')
      ).to.deep.eq({
        flagged: true,
        sort: 'asc',
        limit: '20',
        offset: '4',
      })
    })
  })

  context('matchRoute()', () => {
    context('when matching against exact routes', () => {
      beforeEach(() => {
        mockHash('/users/123/')
      })

      it('does not render the non-matching route', () =>
        expect(matchRoute('/nonsense/', pass)).to.eq(''))

      it('renders the route', () =>
        expect(matchRoute('/users/123/', pass)).to.be.true)

      it('renders the route with params', () =>
        expect(matchRoute('/users/:id/', passInput)).to.deep.eq({
          tail: '/',
          params: { id: '123' },
        }))

      it('does not render routes that are longer than pattern', () =>
        expect(matchRoute('/users/', passInput)).to.eq(''))
    })

    context('when extended', () => {
      beforeEach(() => {
        mockHash('/users/123/')
      })

      it('renders the route along with a tail route', () =>
        expect(matchRoute('/users/', passInput, '', false)).to.deep.eq({
          tail: '/123/',
          params: {},
        }))

      context('when the tail is used as an input', () => {
        const TAIL_1 = '/123/photos/456/'

        it('renders the route along the new, smaller tail', () =>
          expect(
            matchRoute('/:userId/photos', passInput, TAIL_1, false)
          ).to.deep.eq({
            tail: '/456/',
            params: { userId: '123' },
          }))
      })
    })
  })

  context('matchRouteSwitch()', () => {
    beforeEach(() => {
      mockHash('/users/')
    })

    it('renders the second route', () =>
      expect(matchRouteSwitch(ROUTES)).to.eq(1))

    context('when extending routes', () => {
      const extendedRoutes = ROUTES.map(route => ({
        ...route,
        exact: false,
      }))

      it('renders the first route', () =>
        expect(matchRouteSwitch(extendedRoutes)).to.eq(0))

      it('renders renders the more complex route', () =>
        expect(matchRouteSwitch(extendedRoutes.slice().reverse())).to.eq(1))
    })
  })

  context('when a route changes', () => {
    let changeStub

    beforeEach(() => {
      changeStub = sandbox.stub()
      window.addEventListener(EVENT_ROUTE_CHANGE, changeStub)

      mockHash('/users/')
    })

    afterEach(() => {
      window.removeEventListener(EVENT_ROUTE_CHANGE, changeStub)
    })

    it('invokes', () => expect(changeStub.calledOnce).to.be.true)
  })

  context('when a route change is canceled', () => {
    let cancelStub

    const cancel = e => e.preventDefault()

    beforeEach(() => {
      cancelStub = sandbox.stub()
      window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, cancel)
      window.addEventListener(EVENT_ROUTE_CANCEL, cancelStub)

      mockHash('/users/')
    })

    afterEach(() => {
      window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, cancel)
      window.removeEventListener(EVENT_ROUTE_CANCEL, cancelStub)
    })

    it('cancels the route', () => expect(cancelStub.calledOnce).to.be.true)
  })
})
