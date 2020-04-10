import { html, css, customElement } from 'lit-element';
import { LitItemBase } from './lit-item-base';

@customElement('lit-item')
export class LitItem extends LitItemBase {
  static styles = css`
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

    :host([hidden]) {
      display: none !important;
    }

    :host(:hover) {
      background: #eee;
    }

    :host([selected]) {
      background: #e2e2e2;
    }
  `;

  render() {
    return html`
      <div part="content"><slot></slot></div>
    `;
  }

  firstUpdated() {
    super.firstUpdated();

    this.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('lit-item-click', {
          detail: { value: this.getAttribute('value') },
          bubbles: true,
          composed: true
        })
      );
    });
  }
}
