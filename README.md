# zensen-router

A declarative router for native web components.

## Features

- Listens to any changes in the route
- Gives the ability to cancel route changes
- Easy way of parsing route and querystring params
- Conditionally invoke behahvior based on the current route

## Install

Using `bun`:

```
$ bun add @zensen/router
```

Using `npm`:

```
$ npm install @zensen/router
```

## API

The `router` can be imported like so:

```js
import router from '@zensen/router'
```

### `router.isInitialized()`

Returns `true` after `router.initialize()` is called.

### `router.initialize()`

Adds `window` listeners. This replaces the default anchor tag behavior, allowing them to leverage the `history` API internally, and enabling the application to prevent navigating events as needed. This is required to use most of the router's APIs.

### `router.shutdown()`

This undoes the `window` listeners, and restores anchor tags' behaviors back to normal browser behavior.

### `router.getPathname()`

Returns the `pathname` from the address bar. This does not include the hash.

For example:

Address bar: `http://www.my-domain.com/section/subsection/#/users/123/photos/456`

```js
const result = router.getPathname()

/* result: /section/subsection */
```

### `router.getHash()`

Returns the `hash` from the address bar. This does not include the pathname.

For example:

Address bar: `http://www.my-domain.com/section/subsection/#/users/123/photos/456`

```js
const result = router.getHash()

/* result: #/users/123/photos/456 */
```

### `router.getQuery()`

Returns the address bar's querystring as an object.

For example:

Address bar: `http://www.my-domain.com/section/#/users?a=foo&b=bar`

```js
const result = router.getQuery()

/*
  result: {
    a: 'foo',
    b: 'bar',
  }
 */
```

### `router.getSegments()`

This is a convenience function that returns the `pathname` from the address bar as an array of segments. This does not include the pathname.

For example:

Address bar: `http://www.my-domain.com/section/subsection/#/users/123/photos/456`

```js
const result = router.getSegments()

/* result: ['section', 'subsection'] */
```

### `router.navigate(route, query = {})`

Navigates to a new route.

### Params

- `route`: the relative route to navigate to
- `query` (optional): an object that gets converted to a querystring

The `route` parameter is bound to the origin, so you cannot navigate away to different domains such as `google.com`, etc.

Example:

```js
router.navigate('/users/123')
```

Navigates to: `/users/123`

```js
router.navigate('/users', {
  search: 'user',
  page_size: 10,
  page_inde: 1,
  sort_dir: 'asc',
  sort_key: 'firstName',
})
```

Navigates to: `/users?search=user&page_size=10&page_index=1`

### `router.redirect(route, query = {})`

Redirects to a new route.

### Params

- `route`: the relative route to navigate to
- `query` (optional): an object that gets converted to a querystring

The `route` parameter is bound to the origin, so you cannot navigate away to different domains such as `google.com`, etc.

Example:

```js
router.redirect('/users/123')
```

Redirects to: `/users/123`

```js
router.redirect('/users', {
  search: 'user',
  page_size: 10,
  page_inde: 1,
  sort_dir: 'asc',
  sort_key: 'firstName',
})
```

Redirects to: `/users?search=user&page_size=10&page_index=1`

### `matchRouteSwitch(items, routePath, data = {})`

Renders the appropriate navigation item that's provided from a list.

#### Params

- `items`: array of navigation items (see below)
- `routePath`: the route to match against
- `data`: application-specific cata that gets passed along to the matched navigation item

**TODO: complete documentation**


## Events

### `EVENT_ROUTE_CHANGE`

Triggered when a route changes when:

- An anchor tag is clicked
- `router.navigate()` is invoked
- `router.redirect()` is invoked

#### Event

```js
{
  detail: {
    full: 'http://my-app.com/users?search=Nancy',
    pathname: '/users',
    operation: 'PUSH',
    query: {
      search: 'Nancy',
    },
  }
}
```

### Usage

```js
import { EVENT_ROUTE_CHANGE } from '@zensen/router'

window.addEventListener(EVENT_ROUTE_CHANGE, event =>
  console.info('changing route:', event.detail)
)
```

NOTE: This event is only triggered if the route/query navigation event is _different_ from what's currently in the address bar.

For example, this will **not** trigger an event:

```js
/* address bar: `http://my-app.com/users` */

router.navigate('/users')
```

Neither will this:

```js
/* address bar: `http://my-app.com/users?a=foo` */

router.navigate('/users', {
  a: 'foo',
})
```

This **will** trigger an event:

```js
/* address bar: `http://my-app.com/users` */

router.navigate('/users/123')
```

And so will this:

```js
/* address bar: `http://my-app.com/users` */

router.navigate('/users', {
  a: 'foo',
})
```

And so will this:

```js
/* address bar: `http://my-app.com/users?a=foo` */

router.navigate('/users')
```

### `EVENT_ROUTE_SHOULD_CHANGE`

Allows the application's logic to prevent routing events.

#### Event

```js
{
  detail: {
    full: 'http://my-app.com/users?search=Nancy',
    pathname: '/users',
    operation: 'PUSH',
    query: {
      search: 'Nancy',
    },
  }
}
```

#### Usage

```js
import { EVENT_ROUTE_SHOULD_CHANGE } from '@zensen/router'

window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, event => {
  // block all route changes to /users/
  if (event.detail === '/users/') {
    return false
  }

  return true
})
```

### `EVENT_ROUTE_CANCEL`

Triggered when route changes are canceled.

#### Event

```js
{
  detail: {
    full: 'http://my-app.com/users?search=Nancy',
    pathname: '/users',
    operation: 'PUSH',
    query: {
      search: 'Nancy',
    },
  }
}
```

#### Usage

```js
import { EVENT_ROUTE_CANCEL } from '@zensen/router'

window.addEventListener(EVENT_ROUTE_CANCEL, event =>
  console.info('route change canceled:', event.detail)
)
```
