export const EVENT_ROUTE_CHANGE = 'routechange'
export const EVENT_ROUTE_CANCEL = 'routecancel'
export const EVENT_ROUTE_SHOULD_CHANGE = 'routeshouldchange'

const OPERATION = {
  POP: 'popState',
  PUSH: 'pushState',
  REPLACE: 'replaceState',
}

let __initialized = false
let __currentHref = ''

/*
  TEMPORARY:
  This was borrowed from a very specific version of regexparam. Going
  to write an easier-to-understand implementation.
 */

/* v8 ignore start */
function __regexparam (str, loose) {
  var c, o, tmp, ext, keys=[], pattern='', arr=str.split('/')
  arr[0] || arr.shift()

  while (tmp = arr.shift()) {
    c = tmp[0]

    if (c === '*') {
      keys.push('wild')
      pattern += '/(.*)'
    } else if (c === ':') {
      o = tmp.indexOf('?', 1)
      ext = tmp.indexOf('.', 1)
      keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) )
      pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)'
      if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext)
    } else {
      pattern += '/' + tmp
    }
  }

  return {
    keys: keys,
    pattern: new RegExp('^' + pattern + (loose ? '(?:$|\/)' : '\/?$'), 'i')
  }
}
/* v8 ignore end */

function __isRouteDifferent (routePath, query) {
  const querystring = __buildQuerystring(query)

  return (
    routePath !== window.location.pathname ||
    querystring !== window.location.search.substring(1)
  )
}

function __validateInitialized () {
  if (!__initialized) {
    throw new Error('Router is not initialized')
  }
}

function __buildParams (pattern, keys, querylessRoute) {
  const match = pattern.exec(querylessRoute)

  return keys.reduce(
    (list, key, index) => ({
      ...list,
      [key]: (match && match[index + 1]) || '',
    }),
    {}
  )
}

function __buildQuerystring (query) {
  const params = query && new URLSearchParams(query)

  return params
    ? params.toString()
    : window.location.search.substring(1)
}

function __resolveRoute (pattern, keys, routePath, navItem, data) {
  const reg = new RegExp(pattern)
  const trimmed = routePath.replace(reg, '')
  const routeTail = trimmed.indexOf('/') !== 0 ? `/${trimmed}` : '/'

  const ctx = {
    routeTail,
    navItem,
    params: __buildParams(pattern, keys, routePath),
    query: getQuery(),
    data,
  }

  if (navItem.redirect) {
    const redirectPath = navItem.redirect(ctx)
    navigate(redirectPath)

    return ''
  }

  return navItem.resolver(ctx)
}

function __updateCurrentHref () {
  __currentHref = [
    window.location.pathname,
    window.location.search,
  ].filter(Boolean).join('')
}

function __changeRoute (href, query, operation) {
  const { pathname } = new URL(href)
  const querystring = __buildQuerystring(query)
  const full = [pathname, querystring].filter(Boolean).join('?')

  const result = window.dispatchEvent(
    new CustomEvent(EVENT_ROUTE_SHOULD_CHANGE, {
      cancelable: true,
      detail: {
        full,
        pathname,
        operation,
        query,
      },
    }),
  )

  if (result) {
    const href = [pathname, querystring]
      .filter(item => item)
      .join('?')

    if (operation && operation !== OPERATION.POP) {
      window.history[operation]({}, '', href)
      __updateCurrentHref()
    }

    window.dispatchEvent(
      new CustomEvent(EVENT_ROUTE_CHANGE, {
        detail: {
          full,
          pathname,
          operation,
          query,
        },
      })
    )
  } else {
    if (operation && operation === OPERATION.POP) {
      window.history.pushState({}, '', __currentHref)
    }

    window.dispatchEvent(new CustomEvent(EVENT_ROUTE_CANCEL, {
      cancelable: true,
      detail: {
        full,
        pathname,
        operation,
        query,
      },
    }))
  }
}

function getPath () {
  return window.location.pathname
}

function getHash () {
  return window.location.hash
}

function getQuery () {
  const params = new URLSearchParams(window.location.search)

  return Object.fromEntries(params)
}

function getSegments () {
  return window.location.pathname.split('/').filter(Boolean)
}

function navigate (routePath, query = null) {
  __validateInitialized()

  if (!__isRouteDifferent(routePath, query)) {
    return
  }

  const { origin, hash } = window.location
  const pathname = routePath.split('?')[0]
  const href = `${origin}${pathname}${hash}`

  __changeRoute(href, query, OPERATION.PUSH)
}

function redirect (routePath, query = null) {
  __validateInitialized()

  if (!__isRouteDifferent(routePath, query)) {
    return
  }

  const { origin, hash} = window.location
  const pathname = routePath.split('?')[0]
  const href = `${origin}${pathname}${hash}`

  __changeRoute(href, query, OPERATION.REPLACE)
}

function matchSwitch (items, routePath = null, data = {}) {
  __validateInitialized()

  let result = {}
  const p = routePath !== null ? routePath.split('?')[0] : getPath()

  const matchedRoute = items.find(item => {
    const exact = item.exact !== undefined ? item.exact : false
    result = __regexparam(item.path, !exact)

    return result.pattern.test(p)
  })

  const { pattern, keys } = result

  return matchedRoute
    ? __resolveRoute(pattern, keys, p, matchedRoute, data)
    : ''
}

/* only exposed for testing purposes */

export function handleAnchorClick(event) {
  if (
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.defaultPrevented
  ) {
    return
  }

  const anchor = event
    .composedPath()
    .find(n => n.tagName === 'A')

  if (
    !anchor || anchor.target ||
    anchor.hasAttribute('download') ||
    anchor.getAttribute('rel') === 'external'
  ) {
    return
  }

  if (!anchor.href || anchor.href.indexOf('mailto:') !== -1) {
    return
  }

  const origin =
    window.location.origin ||
    window.location.protocol + '//' + window.location.host

  if (anchor.href.indexOf(origin) !== 0) {
    return
  }

  event.preventDefault()

  if (anchor.href !== window.location.href) {
    __changeRoute(anchor.href, null, OPERATION.PUSH)
  }
}

export function handlePopState () {
  __changeRoute(window.location.href, null, OPERATION.POP)
}

function isInitialized () {
  return __initialized
}

/* v8 ignore start */
function initialize () {
  if (__initialized) {
    throw new Error('Router is already initialized')
  }

  window.addEventListener('click', handleAnchorClick)
  window.addEventListener('popstate', handlePopState)

  __initialized = true
  __changeRoute(window.location.href, null, null)
}
/* v8 ignore end */

function shutdown () {
  __validateInitialized()

  window.removeEventListener('click', handleAnchorClick)
  window.removeEventListener('popstate', handlePopState)

  __initialized = false
}

export default {
  isInitialized,
  initialize,
  shutdown,
  getPath,
  getHash,
  getQuery,
  getSegments,
  navigate,
  redirect,
  matchSwitch,
}
