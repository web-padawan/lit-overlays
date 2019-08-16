import { LitElement, html, css } from 'lit-element';

class LitComboBoxItem extends LitElement {

  static get is() {
    return 'lit-combo-box-item';
  }

  static get properties() {
    return {
      label: {
        type: String
      },
      value: {
        type: String
      }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        box-sizing: border-box;
        width: 100%;
        max-width: 100%;
        padding: 5px 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
      }

      :host(:hover) {
        background: #eee;
      }
    `;
  }

  render() {
    return html`
      <span>${this.label}</span>
    `;
  }

  firstUpdated() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('lit-combo-box-item-click', {
        detail: {
          value: this.value
        },
        bubbles: true
      }));
    });
  }
}

customElements.define(LitComboBoxItem.is, LitComboBoxItem);
