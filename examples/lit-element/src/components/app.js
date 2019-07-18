import { matchRouteSwitch, EVENT_ROUTE_CHANGE } from '@travistrue2008/zen-router'

import {
  LitElement,
  html,
  css,
} from 'lit-element'

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
        font-size: 1.4rem;
      }

      .container {
        display: flex;
        width: 100%;
        height: 100%;
        flex-flow: nowrap column;
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

      .spacer {
        height: 2rem;
      }
    `
  }

  constructor () {
    super()
    this.__initState()
    this.__initHandlers()
  }

  __initState () {
    this.__route = ''
    this.__navItems = this.genNavItems()
  }

  __initHandlers () {
    this.__handlers = {
      changeRoute: e => (this.__route = e.detail),
    }
  }

  connectedCallback () {
    super.connectedCallback()

    window.addEventListener(EVENT_ROUTE_CHANGE, this.__handlers.changeRoute)
  }

  disconnectedCallback () {
    super.disconnectedCallback()

    window.removeEventListener(EVENT_ROUTE_CHANGE, this.__handlers.changeRoute)
  }

  genNavItems () {
    return [
      {
        exact: false,
        label: 'Home',
        path: '/home/',
        href: '#/home',
        resolver: () => html`
          <p>Home</p>
        `,
      },
      {
        exact: false,
        label: 'About Us',
        path: '/about/',
        href: '#/about',
        resolver: () => html`
          <p>About Us</p>
        `,
      },
    ]
  }

  render () {
    return html`
      <div class="container">
        <nav class="nav">
          ${this.__navItems.map(item => html`
            <a
              class="nav-item"
              href="${item.href}"
            >${item.label}</a>
          `)}
        </nav>

        <div class="spacer"></div>

        ${matchRouteSwitch(this.__navItems, this.__route)}
      </div>
    `
  }
}

window.customElements.define('x-app', App)
