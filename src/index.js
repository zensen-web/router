import { installRouter } from 'pwa-helpers'

import regexparam from 'regexparam'

export const EVENT_ROUTE_CHANGE = 'routechange'
export const EVENT_ROUTE_CANCEL = 'routecancel'
export const EVENT_ROUTE_SHOULD_CHANGE = 'routeshouldchange'

let prevRoute = ''

let options = {
  useHash: true,
  stubbedLocation: null,
}

const handleRouteChange = () => {
  if (getRoute() !== prevRoute) {
    const result = window.dispatchEvent(
      new CustomEvent(EVENT_ROUTE_SHOULD_CHANGE, {
        cancelable: true,
        detail: getRoute(),
      }),
    )

    if (result) {
      window.dispatchEvent(
        new CustomEvent(EVENT_ROUTE_CHANGE, {
          detail: getRoute(),
        })
      )
    } else {
      const result = options.useHash
        ? `${window.location.pathname}#${prevRoute}`
        : prevRoute

      window.history.replaceState({}, '', result)
      window.dispatchEvent(new CustomEvent(EVENT_ROUTE_CANCEL))
    }
  }
}

function sanitizeRoute (route) {
  return options.useHash && route.charAt(0) === '#'
    ? route.replace('#', '')
    : route
}

function getQuerylessRoute (route = '') {
  const location = sanitizeRoute(route) || getRoute()
  return location.replace(/\?.*/, '')
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

function resolveRoute (pattern, keys, querylessRoute, querystring, callback) {
  const ctx = {
    querystring,
    params: __buildParams(pattern, keys, querylessRoute),
  }

  const reg = new RegExp(pattern)
  const trimmed = querylessRoute.replace(reg, '')
  const tailRoute = trimmed.indexOf('/') !== 0 ? `/${trimmed}` : '/'
  return callback(tailRoute, ctx)
}

export function configure (opts) {
  const prevLocation = options.stubbedLocation
  options = { ...options, ...opts }

  if (options.stubbedLocation !== prevLocation) {
    handleRouteChange()
  }
}

export function getParams (path, route = '') {
  const querylessRoute = getQuerylessRoute(route)
  const { pattern, keys } = regexparam(path, true)

  return __buildParams(pattern, keys, querylessRoute)
}

export function getQuerystring (route = '') {
  const reg = /.*\?/
  const input = route || getRoute()

  return input.indexOf('?') !== -1
    ? input.replace(reg, '')
      .split('&')
      .map(keyValuePair => keyValuePair.split('='))
      .reduce((accum, [key, value]) => ({
        ...accum,
        [key]: value || true,
      }), {})
    : {}
}

/*
  Used as a work-around to mock out window.location
  since mocha doesn't want us to modify it directly

  See: https://stackoverflow.com/questions/34575750/how-to-stub-exported-function-in-es6
*/

export function getRoute () {
  const stub = options.stubbedLocation
  const { pathname, hash } = stub || window.location
  return options.useHash ? hash.replace('#', '') : `${pathname}${hash}`
}

export function syncRoute (prev) {
  prevRoute = prev
  handleRouteChange()
}

export function navigate (route) {
  prevRoute = getRoute()

  const result = options.useHash
    ? `${window.location.pathname}#${sanitizeRoute(route)}`
    : route

  window.history.pushState({}, '', result)
  handleRouteChange()
}

export function redirect (route) {
  prevRoute = getRoute()

  const result = options.useHash
    ? `${window.location.pathname}#${sanitizeRoute(route)}`
    : route

  window.history.replaceState({}, '', result)
  handleRouteChange()
}

export function matchRoute (path, callback, route = '', exact = true) {
  const querystring = getQuerystring(route)
  const querylessRoute = getQuerylessRoute(route)
  const sanitizedPath = sanitizeRoute(path)
  const { pattern, keys } = regexparam(sanitizedPath, !exact)
  return pattern.test(querylessRoute)
    ? resolveRoute(pattern, keys, querylessRoute, querystring, callback)
    : ''
}

export function matchRouteSwitch (items, route = '') {
  let result = {}

  const querystring = getQuerystring(route)
  const querylessRoute = getQuerylessRoute(route)
  const matchedRoute = items.find(item => {
    const exact = typeof item.exact !== 'undefined' ? item.exact : true
    result = regexparam(item.path, !exact)
    return result.pattern.test(querylessRoute)
  })

  const { pattern, keys } = result
  return matchedRoute
    ? resolveRoute(pattern, keys, querylessRoute, querystring, matchedRoute.resolver)
    : ''
}

installRouter(handleRouteChange)
