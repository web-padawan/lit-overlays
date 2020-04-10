import { LitElement, html, customElement, property } from 'lit-element';
import './lit-select-dropdown';
import './lit-list-box';
import './lit-item';
import { renderer } from './renderer';

@customElement('lit-select')
export class LitSelect extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Array }) items = [];

  @property({ type: String }) value = '';

  @property({ attribute: false }) protected inputElement: HTMLElement | null = null;

  @property({ attribute: false }) protected dropdownElement: HTMLElement | null = null;

  protected render() {
    return html`
      <label>
        <input type="text" .value="${this.value}" @click="${this.toggle}" readonly />
      </label>

      <lit-select-dropdown
        .value="${this.value}"
        .opened="${this.opened}"
        .positionTarget="${this.inputElement}"
        @opened-changed="${this.onOpenedChanged}"
        @value-changed="${this.onValueChanged}"
      >
        ${renderer(
          this.items,
          () => html`
            <lit-list-box>
              ${this.items.map(
                (item: { label: string; value: string }) => html`
                  <lit-item value="${item.value}">${item.label}</lit-item>
                `
              )}
            </lit-list-box>
          `
        )}
      </lit-select-dropdown>
    `;
  }

  protected firstUpdated() {
    this.inputElement = this.renderRoot.querySelector('input');
    this.dropdownElement = this.renderRoot.querySelector('lit-select-dropdown');
  }

  protected toggle() {
    this.opened = !this.opened;
  }

  protected onOpenedChanged(event: CustomEvent) {
    this.opened = event.detail.value;
  }

  protected onValueChanged(event: CustomEvent) {
    this.value = event.detail.value;
  }
}
