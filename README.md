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
configure({ useHash: false})
```

Getting routes with the following window URL:

`http://www.my-domain.com/sub-route/#/users/123/photos/456`
```js
// hash-routing enabled
const route = getRoute() //  /users/123/photos/456

// hash-routing disabled
const route = getRoute() //  /sub-route/#/users/123/photos/456
```

Setting the current route
```js
// hash-routing enabled
setRoute('/users/123') // http://www.my-domain.com/#/users/123

// hash-routing disabled
setRoute('/users/123') // http://www.my-domain.com/users/123
```

Getting route params
```js
// Example window URL:
// http://www.my-domain.com/#/users/123/photos/456
const { userId, photoId } = getParams('/users/:userId/photos/:photoId')
```

```js
// Example when explicity providing route
const { userId, photoId } = getParams(
  '/users/:userId/photos/:photoId',
  '/users/123/photos/456',
)
```

Getting querystring params
```js
// Example window URL:
// http://www.my-domain.com?search=asdf&sort=asc
const { search, sort } = getQuerystring('/users/:userId/photos/:photoId')
```

```js
// Example when explicity providing route
const { search, sort } = getQuerystring('http://www.my-domain.com?search=asdf&sort=asc')
```

Detecting route changes
```js
window.addEventListener(EVENT_ROUTE_CHANGE, e =>
  console.info('changing route:', e.detail))
```

Canceling route changes
```js
window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, e => {
  // block all route changes to /users/
  if (e.detail === '/users/') {
    e.preventDefault()
  }
})
```

Detecting when route changes are canceled
```js
window.addEventListener(EVENT_ROUTE_CANCEL, e =>
  console.info('route change canceled:', e.detail))
```

Matching against a route
```js
// Example window URL:
// http://www.my-domain.com/#/users/123/photos/456
const result = matchRoute ('/users/:id/', ({ id }, tail) =>
  `
    <p>User: ${id}</p>
    <p>Tail URL: ${tail}</p>
  `,
  '', // do not explicity provide a route, so that it uses window.location
  false, // set to false to allow routes to be longer than paths it's matched against
)

/*
  Result:
    <p>User: 123</p>
    <p>Tail URL: /photos/456</p>
 */
```

```js
const result = matchRoute ('/photos/:id/', ({ id }, tail) =>
  `
    <p>Photo: ${id}</p>
    <p>Tail URL: ${tail}</p>
  `,
  '/photos/456', // providing the tail route from the previous example
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
    renderer: (_params, tail) => `
      <p>Tail Route: ${tail}</p>
    `,
  },
  {
    path: '/photos/',
    renderer: (_params, tail) => `
      <p>Tail Route: ${tail}</p>
    `,
  },
  {
    path: '/',
    renderer: () => `<p>404 - Not Found</p>`,
  },
]
```

```js
// Example window URL:
// http://www.my-domain.com/#/users/123
const result = matchRouteSwitch(items)

/*
  Result:
    <p>Tail Route: /123</p>
 */
```

```js
// Example window URL:
// http://www.my-domain.com/#/photos/456
const result = matchRouteSwitch(items)

/*
  Result:
    <p>Tail Route: /456</p>
 */
```
