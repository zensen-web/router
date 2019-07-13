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
      setRoute(prevRoute)
      window.dispatchEvent(new CustomEvent(EVENT_ROUTE_CANCEL))
    }
  }
}

function getQuerylessRoute (pathTail = '') {
  const location = pathTail || getRoute()
  return location.replace(/\?.*/, '')
}

function __buildParamDict (pattern, keys, querylessRoute) {
  const match = pattern.exec(querylessRoute)
  return keys.reduce(
    (list, key, index) => ({
      ...list,
      [key]: (match && match[index + 1]) || '',
    }),
    {}
  )
}

function resolveRoute (pattern, keys, querylessRoute, callback) {
  const paramDict = __buildParamDict(pattern, keys, querylessRoute)
  const reg = new RegExp(pattern)
  const trimmed = querylessRoute.replace(reg, '')
  const pathTail = trimmed.indexOf('/') !== 0 ? `/${trimmed}` : '/'
  return callback(paramDict, pathTail)
}

export function configure (opts) {
  const prevLocation = options.stubbedLocation
  options = { ...options, ...opts }

  if (options.stubbedLocation !== prevLocation) {
    handleRouteChange()
  }
}

export function getParams (path, pathTail = '') {
  const querylessRoute = getQuerylessRoute(pathTail)
  const { pattern, keys } = regexparam(path, true)

  return __buildParamDict(pattern, keys, querylessRoute)
}

export function getQuerystring (pathTail) {
  const reg = /.*\?/
  const route = pathTail || getRoute()

  return route.replace(reg, '')
    .split('&')
    .map(keyValuePair => keyValuePair.split('='))
    .reduce((accum, [key, value]) => ({
      ...accum,
      [key]: value || true,
    }), {})
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

export function setRoute (route) {
  const result = options.useHash ? `/#${route}` : route
  window.history.replaceState({}, '', result)
}

export function pushRoute (route) {
  prevRoute = getRoute()

  const result = options.useHash ? `/#${route}` : route
  window.history.pushState({}, '', result)
  handleRouteChange()
}

export function matchRoute (path, callback, pathTail = '', exact = true) {
  const querylessRoute = getQuerylessRoute(pathTail)
  const { pattern, keys } = regexparam(path, !exact)
  const match = pattern.test(querylessRoute)

  return match ? resolveRoute(pattern, keys, querylessRoute, callback) : ''
}

export function matchRouteSwitch (items, pathTail = '') {
  let result = {}

  const querylessRoute = getQuerylessRoute(pathTail)
  const matchedRoute = items.find(item => {
    const exact = typeof item.exact !== 'undefined' ? item.exact : true
    result = regexparam(item.path, !exact)
    return result.pattern.test(querylessRoute)
  })

  const { pattern, keys } = result
  return matchedRoute
    ? resolveRoute(pattern, keys, querylessRoute, matchedRoute.renderer)
    : ''
}

installRouter(handleRouteChange)
