import './x-page-home'
import './x-page-about'

import { LitElement, html, css } from 'lit'

import router, {
  EVENT_ROUTE_CHANGE,
  EVENT_ROUTE_SHOULD_CHANGE,
} from '../../../../src'

class App extends LitElement {
  static get properties () {
    return {
      __route: String,
    }
  }

  static get styles () {
    return css`
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      :host {
        display: block;
        min-height: 100vh;
        font-size: 1.4rem;
      }

      .container {
        display: grid;
        width: 100%;
        height: 100%;
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }

      .nav {
        display: flex;
        padding-left: 1.2rem;
        width: 100%;
        height: 6rem;
        align-items: center;
        background-color: #353535;
      }

      .nav-item {
        margin-right: 1.2rem;
        color: #FFF;
        font-size: 1.4rem;
        text-decoration: none;
      }
    `
  }

  constructor () {
    super()
    router.initialize()

    this.__route = router.getPath()
    this.__navItems = this.genNavItems()

    this.__handlers = {
      shouldChangeRoute: (event) => {
        console.info(`shouldChangeRoute(): "${event.detail}"`)
        // event.preventDefault()
      },
      changeRoute: event => {
        console.info(`changeRoute(): "${event.detail}"`)
        this.__route = event.detail
      },
    }
  }

  connectedCallback () {
    super.connectedCallback()

    window.addEventListener(EVENT_ROUTE_CHANGE, this.__handlers.changeRoute)
    window.addEventListener(EVENT_ROUTE_SHOULD_CHANGE, this.__handlers.shouldChangeRoute)
  }

  disconnectedCallback () {
    super.disconnectedCallback()

    window.removeEventListener(EVENT_ROUTE_CHANGE, this.__handlers.changeRoute)
    window.removeEventListener(EVENT_ROUTE_SHOULD_CHANGE, this.__handlers.shouldChangeRoute)
  }

  genNavItems () {
    return [
      {
        exact: false,
        path: '/about',
        resolver: (routeTail) => {
          console.info('routeTail:', routeTail)

          return html`
            <x-page-about
              .routeTail=${routeTail}
            ></x-page-about>
          `
        },
      },
      {
        exact: true,
        path: '/',
        resolver: (_routeTail, ctx) => {
          console.info('ctx:', ctx)

          return html`
            <x-page-home
              .ctx=${ctx}
            ></x-page-home>
          `
        },
      },
      {
        exact: false,
        path: '/',
        resolver: () => {
          console.info('not found')

          return html`
            <p>Not Found</p>
          `
        },
      },
    ]
  }

  render () {
    return html`
      <div class="container">
        <nav class="nav">
          <a
            class="nav-item"
            href="/"
          >Home</a>

          <a
            class="nav-item"
            href="/about"
          >About Us</a>
        </nav>

        ${router.matchSwitch(this.__navItems, this.__route)}
      </div>
    `
  }
}

window.customElements.define('x-app', App)
