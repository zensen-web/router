export const EVENT_ROUTE_CHANGE = 'routechange'
export const EVENT_ROUTE_CANCEL = 'routecancel'
export const EVENT_ROUTE_SHOULD_CHANGE = 'routeshouldchange'

const OPERATION = {
  PUSH: 'pushState',
  REPLACE: 'replaceState',
}

let __initialized = false

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

function __isRouteDifferent (routePath) {
  return routePath !== window.location.pathname
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

function __resolveRoute (pattern, keys, routePath, callback) {
  const reg = new RegExp(pattern)
  const trimmed = routePath.replace(reg, '')
  const tailRoute = trimmed.indexOf('/') !== 0 ? `/${trimmed}` : '/'

  return callback(tailRoute, {
    params: __buildParams(pattern, keys, routePath),
    query: getQuery(),
  })
}

function __changeRoute (href, query, operation) {
  const { pathname } = new URL(href)

  const result = window.dispatchEvent(
    new CustomEvent(EVENT_ROUTE_SHOULD_CHANGE, {
      detail: pathname,
      cancelable: true,
    }),
  )

  if (result) {
    if (operation) {
      if (query) {
        const params = new URLSearchParams(query)

        window.location.search = params.toString()
      }

      window.history[operation]({}, '', pathname)
    }

    window.dispatchEvent(
      new CustomEvent(EVENT_ROUTE_CHANGE, {
        detail: pathname,
      })
    )
  } else {
    window.dispatchEvent(new CustomEvent(EVENT_ROUTE_CANCEL))
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

function navigate (routePath, query = null) {
  __validateInitialized()

  if (!__isRouteDifferent(routePath)) {
    return
  }

  const { origin, hash } = window.location
  const href = `${origin}${routePath}${hash}`

  __changeRoute(href, query, OPERATION.PUSH)
}

function redirect (routePath, query = null) {
  __validateInitialized()

  if (!__isRouteDifferent(routePath)) {
    return
  }

  const { origin, hash} = window.location
  const href = `${origin}${routePath}${hash}`

  __changeRoute(href, query, OPERATION.REPLACE)
}

function match (path, callback, {
  routePath = null,
  exact = false,
} = {}) {
  __validateInitialized()

  const p = routePath !== null ? routePath : getPath()
  const { pattern, keys } = __regexparam(path, !exact)

  return pattern.test(p)
    ? __resolveRoute(pattern, keys, p, callback)
    : ''
}

function matchSwitch (items, routePath = null) {
  __validateInitialized()

  let result = {}
  const p = routePath !== null ? routePath : getPath()

  const matchedRoute = items.find(item => {
    const exact = item.exact !== undefined ? item.exact : false
    result = __regexparam(item.path, !exact)

    return result.pattern.test(p)
  })

  const { pattern, keys } = result

  return matchedRoute
    ? __resolveRoute(
      pattern,
      keys,
      p,
      matchedRoute.resolver,
    )
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

function isInitialized () {
  return __initialized
}

/* v8 ignore start */
function initialize () {
  window.addEventListener('click', handleAnchorClick)

  window.addEventListener('popstate', () => {
    __changeRoute(null, null, null)
  })

  __initialized = true
  __changeRoute(window.location.href, null, null)
}
/* v8 ignore end */

function shutdown () {
  __initialized = false
}

export default {
  isInitialized,
  initialize,
  shutdown,
  getPath,
  getHash,
  getQuery,
  navigate,
  redirect,
  match,
  matchSwitch,
}
