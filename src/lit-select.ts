import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import { LitSelectDropdown } from './lit-select-dropdown';
import './lit-select-dropdown';

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
        .items="${this.items}"
        .positionTarget="${this.inputElement}"
        @opened-changed="${this.onOpenedChanged}"
        @value-changed="${this.onValueChanged}"
      ></lit-select-dropdown>
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

  get renderItem() {
    return (this.dropdownElement as LitSelectDropdown).renderItem;
  }

  set renderItem(value: (item: unknown) => TemplateResult) {
    (this.dropdownElement as LitSelectDropdown).renderItem = value;
  }
}
