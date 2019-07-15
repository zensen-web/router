import {
  LitElement,
  html,
  css,
} from 'lit-element'

class App extends LitElement {
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
      }
    `
  }

  render () {
    return html`
      <div class="container">
      </div>
    `
  }
}

window.customElements.define('x-app', App)
