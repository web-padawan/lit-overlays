import { LitElement, html, customElement, property, PropertyValues } from 'lit-element';
import { LitSelectOverlay } from './lit-select-overlay';
import './lit-select-overlay';
import { OverlayRenderer } from './lit-overlay';
import { notify } from './utils/notify';

@customElement('lit-select-dropdown')
export class LitSelectDropdown extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: String }) value = '';

  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  @property({ attribute: false, hasChanged: () => true }) renderer?: OverlayRenderer;

  protected overlay?: LitSelectOverlay;

  protected render() {
    return html`
      <lit-select-overlay
        .opened="${this.opened}"
        .owner="${this}"
        .renderer="${this.renderer}"
        .positionTarget="${this.positionTarget}"
        @lit-overlay-outside-click="${this._onOutsideClick}"
        @lit-overlay-escape-press="${this._onEscapePress}"
        @lit-item-click="${this._onItemClick}"
      ></lit-select-overlay>
    `;
  }

  protected firstUpdated() {
    this.overlay = this.renderRoot.querySelector('lit-select-overlay') as LitSelectOverlay;
  }

  protected updated(props: PropertyValues) {
    if (props.has('opened') && this.opened) {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          if (this.overlay) {
            const listBox = this.overlay.querySelector('lit-list-box') as HTMLElement;
            if (listBox) {
              listBox.focus();
            }
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
