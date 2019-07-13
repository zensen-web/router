import { html, LitElement } from '@polymer/lit-element/lit-element'

class App extends LitElement {

  render() {
    return html`
      <style>
        :host {
          display: block;
          font-size: 1.4rem;
        }

        .container {
          display: flex;
          width: 60rem;
          height: 6rem;
          align-items: center;
        }

        .col {
          height: 100%;
          flex: 1 0 0;
        }

        .col-1 {
          background-color: #F00;
        }

        .col-2 {
          background-color: #0F0;
        }

        .col-3 {
          background-color: #00F;
        }

        .col-4 {
          background-color: #FF0;
        }

        .col-5 {
          background-color: #F0F;
        }

        .col-6 {
          background-color: #0FF;
        }
      </style>

      <div class="container">
        <div class="col col-1"></div>
        <div class="col col-2"></div>
        <div class="col col-3"></div>
        <div class="col col-4"></div>
        <div class="col col-5"></div>
        <div class="col col-6"></div>
        <div class="col col-7"></div>
      </div>
    `
  }
}

window.customElements.define('x-app', App)
