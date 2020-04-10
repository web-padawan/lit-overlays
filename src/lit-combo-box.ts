import { LitElement, html, customElement, property } from 'lit-element';
import 'lit-virtualizer';
import './lit-combo-box-dropdown';
import { ComboBoxItem } from './lit-combo-box-dropdown';
import './lit-combo-box-item';
import { renderer } from './renderer';

@customElement('lit-combo-box')
export class LitComboBox extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Array }) items = [];

  @property({ type: String }) value = '';

  @property({ attribute: false }) protected inputElement: HTMLElement | null = null;

  protected renderItem = (item: ComboBoxItem) => {
    const { value, label } = item;
    return html`
      <lit-combo-box-item value="${value}" .label="${label}" class="scroller"></lit-combo-box-item>
    `;
  };

  protected render() {
    return html`
      <label>
        <input type="text" .value="${this.value}" @click="${this.toggle}" />
      </label>

      <lit-combo-box-dropdown
        .value="${this.value}"
        .opened="${this.opened}"
        .items="${this.items}"
        .positionTarget="${this.inputElement}"
        @opened-changed="${this.onOpenedChanged}"
        @value-changed="${this.onValueChanged}"
      >
        ${renderer(
          this.items,
          () => html`
            <lit-virtualizer
              .items="${this.items}"
              .renderItem="${this.renderItem}"
            ></lit-virtualizer>
          `
        )}
      </lit-combo-box-dropdown>
    `;
  }

  protected firstUpdated() {
    this.inputElement = this.renderRoot.querySelector('input');
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
