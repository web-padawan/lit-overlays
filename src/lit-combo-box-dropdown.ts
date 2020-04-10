import { LitElement, html, customElement, property, PropertyValues } from 'lit-element';
import 'lit-virtualizer';
import { LitVirtualizer } from 'lit-virtualizer';
import { LitComboBoxOverlay } from './lit-combo-box-overlay';
import { OverlayRenderer } from './lit-overlay';
import './lit-combo-box-item';
import { notify } from './utils/notify';

export interface ComboBoxItem {
  value: string;
  label: string;
}

@customElement('lit-combo-box-dropdown')
export class LitComboBoxDropdown extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Array }) items = [];

  @property({ type: String }) value = '';

  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  @property({ attribute: false, hasChanged: () => true }) renderer?: OverlayRenderer;

  protected overlay: LitComboBoxOverlay | null = null;

  protected render() {
    return html`
      <lit-combo-box-overlay
        .opened="${this.opened}"
        .renderer="${this.renderer}"
        .owner="${this}"
        .positionTarget="${this.positionTarget}"
        @lit-overlay-outside-click="${this._onOutsideClick}"
        @lit-overlay-escape-press="${this._onEscapePress}"
        @lit-combo-box-item-click="${this._onItemClick}"
      ></lit-combo-box-overlay>
    `;
  }

  protected firstUpdated() {
    this.overlay = this.renderRoot.querySelector(LitComboBoxOverlay.is) as LitComboBoxOverlay;
  }

  protected updated(props: PropertyValues) {
    if (props.has('opened') && this.opened && this.value && this.items) {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          const scroller = (this.overlay as LitComboBoxOverlay).renderRoot.querySelector(
            'lit-virtualizer'
          ) as LitVirtualizer<ComboBoxItem>;
          const index = this.items.findIndex((item: ComboBoxItem) => item.value === this.value);
          if (index > -1) {
            scroller.scrollToIndex(index, 'end');
          }
        });
      });
    }
  }

  private _onOutsideClick() {
    notify(this, 'opened', false);
  }

  private _onEscapePress() {
    notify(this, 'opened', false);
  }

  private _onItemClick(event: CustomEvent) {
    notify(this, 'opened', false);
    notify(this, 'value', event.detail.value);
  }
}
