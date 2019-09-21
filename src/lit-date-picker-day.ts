import { LitElement, html, css, customElement, property } from 'lit-element';

@customElement('lit-date-picker-day')
export class LitDatePickerDay extends LitElement {
  @property({ attribute: false }) date: Date | null | undefined = undefined;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean, reflect: true }) selected = false;

  @property({ type: Boolean, reflect: true }) focused = false;

  @property({ type: Boolean, reflect: true }) today = false;

  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`
      ${this.date ? this.date.getDate() : ''}
    `;
  }
}
