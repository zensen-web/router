import {
  LitElement,
  html,
  css,
} from 'lit'

class HomePage extends LitElement {
  static get properties () {
    return {
      ctx: Object,
    }
  }

  static get styles () {
    return css`
      :host {
        display: block;
        height: 100%;
        background-color: #00FF00;
      }
    `
  }

  constructor () {
    super()

    this.ctx = {
      params: {},
      query: {},
    }
  }

  __renderObject (title, obj) {
    return html`
      <h3>${title}</h3>

      <ul>
        ${Object.entries(obj).map(([key, val]) => html`
          <li>${key}: ${val}</li>
        `)}
      </ul>
    `
  }

  render () {
    return html`
      <h2>Home</h2>
      ${this.__renderObject('Params', this.ctx.params)}
      ${this.__renderObject('Query', this.ctx.query)}
    `
  }
}

window.customElements.define('x-page-home', HomePage)
