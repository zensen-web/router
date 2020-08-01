import sinon from 'sinon'

import { expect } from '@open-wc/testing'

import {
  EVENT_ROUTE_CHANGE,
  EVENT_ROUTE_CANCEL,
  EVENT_ROUTE_SHOULD_CHANGE,
  configure,
  getParams,
  getRoute,
  syncRoute,
  matchRoute,
  matchRouteSwitch,
  getQuerystring,
} from '../src'

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

const pass = () => true
const passInput = (tail, ctx) => ({ tail, ctx })

function mockHash (route) {
  configure({
    useHash: true,
    stubbedLocation: {
      pathname: '/',
      hash: `#${route}`,
    },
  })
}

describe('router', () => {
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

  describe('getParams()', () => {
    const HASH = '/users/123/photos/456'
    const PARAMS_PART = { userId: '123' }
    const PARAMS_FULL = {
      userId: '123',
      photoId: '456',
    }

    let pattern

    describe('window.location', () => {
      context('when the pattern does not match the route', () => {
        beforeEach(() => {
          pattern = '/asdf/'
        })

        it('returns an empty object', () =>
          expect(getParams(pattern)).to.be.eql({}))
      })

      context('when location has trailing slash', () => {
        beforeEach(() => {
          mockHash(`${HASH}/`)
        })

        context('when pattern has trailing slash', () => {
          beforeEach(() => {
            pattern = '/users/:userId/photos/:photoId/'
          })
  
          it('decodes params', () =>
            expect(getParams(pattern)).to.be.eql(PARAMS_FULL))
        })

        context('when pattern has NO trailing slash', () => {
          beforeEach(() => {
            pattern = '/users/:userId/photos/:photoId'
          })
  
          it('decodes params', () =>
            expect(getParams(pattern)).to.be.eql(PARAMS_FULL))
        })

        context('when pattern is shorter than route', () => {
          beforeEach(() => {
            pattern = '/users/:userId/'
          })
  
          it('decodes params', () =>
            expect(getParams(pattern)).to.be.eql(PARAMS_PART))
        })

        context('when pattern is longer than route', () => {
          beforeEach(() => {
            mockHash('/users/123/')
            pattern = '/users/:userId/photos/:photoId/'
          })
  
          it('decodes params', () =>
            expect(getParams(pattern)).to.be.eql({
              userId: '123',
              photoId: undefined,
            }))
        })

        context('when pattern has two params next to each other', () => {
          beforeEach(() => {
            pattern = '/:subApp/:userId/'
          })
  
          context('when route has all params', () => {
            beforeEach(() => {
              mockHash('/settings/123/')
            })
    
            it('decodes params', () =>
              expect(getParams(pattern)).to.be.eql({
                subApp: 'settings',
                userId: '123',
              }))
          })

          context('when route is shorter than pattern', () => {
            beforeEach(() => {
              mockHash('/settings/')
            })
    
            it('decodes params', () =>
              expect(getParams(pattern)).to.be.eql({
                subApp: 'settings',
                userId: undefined,
              }))
          })
        })
      })

      context('when location has NO trailing slash', () => {
        beforeEach(() => {
          mockHash(HASH)
        })

        context('when pattern has trailing slash', () => {
          beforeEach(() => {
            pattern = '/users/:userId/photos/:photoId/'
          })
  
          it('decodes params', () =>
            expect(getParams(pattern)).to.be.eql(PARAMS_FULL))
        })

        context('when pattern has NO trailing slash', () => {
          beforeEach(() => {
            pattern = '/users/:userId/photos/:photoId'
          })
  
          it('decodes params', () =>
            expect(getParams(pattern)).to.be.eql(PARAMS_FULL))
        })
      })
    })
  })

  describe('syncRoute()', () => {
    const ROUTE_USERS = '/users'
    const ROUTE_STORIES = '/stories'

    beforeEach(() => {
      syncRoute(ROUTE_USERS, ROUTE_STORIES)
    })

    it('invokes routechange event', () =>
      expect(changeStub.calledOnce).to.be.true)

    context('when setting to current route', () => {
      beforeEach(() => {
        syncRoute(ROUTE_USERS, ROUTE_USERS)
      })

      it('does not invoke routechange event', () =>
        expect(changeStub.calledOnce).to.be.false)
    })
  })

  describe('getRoute()', () => {
    beforeEach(() => {
      configure({
        useHash: true,
        stubbedLocation: {
          pathname: '/sub-domain/',
          hash: '#/users/',
        },
      })
    })

    it('only reports the hash', () => expect(getRoute()).to.be.eq('/users/'))

    it('invokes routechange event', () =>
      expect(changeStub.calledOnce).to.be.true)

    context('when useHash is NOT set', () => {
      beforeEach(() => {
        configure({ useHash: false })
      })

      it('only reports the hash', () =>
        expect(getRoute()).to.be.eq('/sub-domain/#/users/'))
    })
  })

  describe('getQuerystring()', () => {
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

    it('returns nothing', () => {
      expect(getQuerystring('/users')).to.deep.eq({})
    })
  })

  describe('matchRoute()', () => {
    context('when matching against exact routes', () => {
      beforeEach(() => {
        mockHash('/users/123/')
      })

      it('renders', () =>
        expect(matchRoute('/users/123/', pass)).to.be.true)

      it('fails against non-matching route', () =>
        expect(matchRoute('/nonsense/', pass)).to.eq(''))

      it('renders with params', () =>
        expect(matchRoute('/users/:id/', passInput)).to.deep.eq({
          tail: '/',
          ctx: {
            params: { id: '123' },
            querystring: {},
          },
        }))

      it('fails with routes that are longer than pattern', () =>
        expect(matchRoute('/users/', passInput)).to.eq(''))

      context('when a route is provided', () => {
        it('renders', () =>
          expect(matchRoute('/users/123/', pass, '/users/123')).to.be.true)

        it('renders with trailing slash', () =>
          expect(matchRoute('/users/123/', pass, '/users/123/')).to.be.true)

        it('renders with hash in provided route', () =>
          expect(matchRoute('/users/123/', pass, '#/users/123')).to.be.true)

        it('renders with hash in path', () =>
          expect(matchRoute('#/users/123/', pass, '/users/123')).to.be.true)

        it('renders with hash in both the path and provided route', () =>
          expect(matchRoute('#/users/123/', pass, '#/users/123')).to.be.true)

        it('renders with hash in path and pattern, but not in front', () =>
          expect(matchRoute('/users/#123/', pass, '/users/#123')).to.be.true)
      })
    })

    context('when extended', () => {
      beforeEach(() => {
        mockHash('/users/123/')
      })

      it('renders along with a tail route', () =>
        expect(matchRoute('/users/', passInput, '', false)).to.deep.eq({
          tail: '/123/',
          ctx: {
            params: {},
            querystring: {},
          },
        }))

      context('when the tail is used as an input', () => {
        const TAIL_1 = '/123/photos/456/'

        it('renders along the new, smaller tail', () =>
          expect(
            matchRoute('/:userId/photos', passInput, TAIL_1, false)
          ).to.deep.eq({
            tail: '/456/',
            ctx: {
              params: { userId: '123' },
              querystring: {},
            },
          }))
      })

      context('when the route does not have a trailing slash', () => {
        beforeEach(() => {
          mockHash('/users/123')
        })

        it('renders against path with no trailing slash', () =>
          expect(matchRoute('/users/123', pass, '', false)).to.true)

        it('renders against path with trailing slash', () =>
          expect(matchRoute('/users/123/', pass, '', false)).to.true)
      })

      context('when an otherwise matching route has extra characters', () => {
        beforeEach(() => {
          mockHash('/users/123sss')
        })

        it('fail against path with no trailing slash', () =>
          expect(matchRoute('/users/123', pass, '', false)).to.eq(''))

        it('fails against path with trailing slash', () =>
          expect(matchRoute('/users/123/', pass, '', false)).to.eq(''))
      })
    })
  })

  describe('matchRouteSwitch()', () => {
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

    it('invokes routechange event', () =>
      expect(changeStub.calledOnce).to.be.true)
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
