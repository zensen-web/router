# zen-router

A declarative router for native web components.

## Features

- Listens to any changes in the route
- Gives the ability to cancel route changes
- Easy way of parsing route and querystring params
- Conditionally invoke behahvior based on the current route

## Install

Using `npm`:

```
$ npm install @travistrue2008/zen-router
```

Using `yarn`:

```
$ yarn add @travistrue2008/zen-router
```

## API

Configuring routing settings (hash-based routing is enabled by default)

```js
configure({ useHash: false })
```

Getting routes with the following window URL:

`http://www.my-domain.com/sub-route/#/users/123/photos/456`

```js
import { getRoute } from '@travistrue2008/zen-router'

// hash-routing enabled
const route = getRoute() //  /users/123/photos/456

// hash-routing disabled
const route = getRoute() //  /sub-route/#/users/123/photos/456
```

Navigating to a different route

```js
import { navigate } from '@travistrue2008/zen-router'

// hash-routing enabled
navigate('/users/123') // http://www.my-domain.com/#/users/123

// hash-routing disabled
navigate('/users/123') // http://www.my-domain.com/users/123
```

Getting route params

```js
import { getParams } from '@travistrue2008/zen-router'

// Example window URL:
// http://www.my-domain.com/#/users/123/photos/456
const { userId, photoId } = getParams('/users/:userId/photos/:photoId')
```

```js
// Example when explicity providing route
const { userId, photoId } = getParams(
  '/users/:userId/photos/:photoId',
  '/users/123/photos/456'
)
```

Getting querystring params

```js
import { getQuerystring } from '@travistrue2008/zen-router'

// Example window URL:
// http://www.my-domain.com?search=asdf&sort=asc
const { search, sort } = getQuerystring()
```

```js
// Example when explicity providing route
const { search, sort } = getQuerystring(
  'http://www.my-domain.com?search=asdf&sort=asc'
)
```

Detecting route changes

```js
import { EVENT_ROUTE_CHANGE } from '@travistrue2008/zen-router'

window.addEventListener(EVENT_ROUTE_CHANGE, e =>
  console.info('changing route:', e.detail)
)
```

Canceling route changes

```js
import { EVENT_ROUTE_SHOULD_CHANGE } from '@travistrue2008/zen-router'

window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, e => {
  // block all route changes to /users/
  if (e.detail === '/users/') {
    e.preventDefault()
  }
})
```

Detecting when route changes are canceled

```js
import { EVENT_ROUTE_CANCEL } from '@travistrue2008/zen-router'

window.addEventListener(EVENT_ROUTE_CANCEL, e =>
  console.info('route change canceled:', e.detail)
)
```

Matching against a route

```js
import { matchRoute } from '@travistrue2008/zen-router'

// Example window URL:
// http://www.my-domain.com/#/users/123/photos/456?filter=upload-date&sort=asc
const result = matchRoute(
  '/users/:id/',
  (tail, { querystring, params }) => `
    <p>Tail URL: ${tail}</p>
    <p>User: ${params.id}</p>
    <p>Filter: ${querystring.filter}</p>
    <p>Sort: ${querystring.sort}</p>
  `,
  '', // do not explicity provide a route, so that it uses window.location
  false // set to false to allow routes to be longer than paths it's matched against
)

/*
  Result:
    <p>User: 123</p>
    <p>Tail URL: /photos/456</p>
    <p>Filter: upload</p>
    <p>Sort: asc</p>
 */
```

```js
import { matchRoute } from '@travistrue2008/zen-router'

const result = matchRoute(
  '/photos/:id/',
  (tail, { id }) =>
    `
    <p>Photo: ${id}</p>
    <p>Tail URL: ${tail}</p>
  `,
  '/photos/456' // providing the tail route from the previous example
)

/*
  Result:
    <p>Photo: 456</p>
    <p>Tail URL: /</p>
 */
```

Matching against multiple possible routes

```js
const items = [
  {
    path: '/users/',
    resolver: tail => `
      <p>Tail Route: ${tail}</p>
    `
  },
  {
    path: '/photos/',
    resolver: tail => `
      <p>Tail Route: ${tail}</p>
    `
  },
  {
    path: '/',
    resolver: () => `<p>404 - Not Found</p>`
  }
]
```

```js
import { matchRouteSwitch } from '@travistrue2008/zen-router'

// Example window URL:
// http://www.my-domain.com/#/users/123
const result = matchRouteSwitch(items)

/*
  Result:
    <p>Tail Route: /123</p>
 */
```

```js
import { matchRouteSwitch } from '@travistrue2008/zen-router'

// Example window URL:
// http://www.my-domain.com/#/photos/456
const result = matchRouteSwitch(items)

/*
  Result:
    <p>Tail Route: /456</p>
 */
```
