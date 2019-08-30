import { customElement, html, css } from 'lit-element';
import { LitListBase } from './lit-list-base';

@customElement('lit-list-box')
export class LitListBox extends LitListBase {
  static styles = css`
    :host {
      display: flex;
      align-items: center;
    }

    :host([hidden]) {
      display: none !important;
    }

    [part='items'] {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  `;

  render() {
    return html`
      <div part="items"><slot></slot></div>
    `;
  }

  constructor() {
    super();

    this.orientation = 'vertical';
  }

  firstUpdated() {
    super.firstUpdated();

    this.setAttribute('role', 'list');
  }

  protected get _scrollerElement(): Element {
    return this.renderRoot.querySelector('[part="items"]') as Element;
  }
}
