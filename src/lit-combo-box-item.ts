import { LitElement, html, css, customElement, property } from 'lit-element';

@customElement('lit-combo-box-item')
export class LitComboBoxItem extends LitElement {
  @property({ type: String }) label: string = '';

  @property({ type: String }) value: string = '';

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

    :host(:hover) {
      background: #eee;
    }
  `;

  protected render() {
    return html`
      <span>${this.label}</span>
    `;
  }

  protected firstUpdated() {
    this.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('lit-combo-box-item-click', {
        bubbles: true
      }));
    });
  }
}
