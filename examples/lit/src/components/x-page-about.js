import {
  LitElement,
  html,
  css,
} from 'lit'

class AboutPage extends LitElement {
  static get properties () {
    return {
      routeTail: String,
    }
  }

  static get styles () {
    return css`
      :host {
        display: block;
        height: 100%;
        background-color: #FF00FF;
      }
    `
  }

  render () {
    return html`
      <h2>About Us</h2>

      <p>Route tail: ${this.routeTail}</p>
    `
  }
}

window.customElements.define('x-page-about', AboutPage)
