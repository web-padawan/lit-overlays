import { css } from 'lit-element';
import { LitOverlay } from './lit-overlay.js';

class LitComboBoxOverlay extends LitOverlay {

  static get is() {
    return 'lit-combo-box-overlay';
  }

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
          align-items: stretch;
        }

        [part="overlay"] {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        ::slotted(.scroller) {
          min-height: 200px;
        }
      `
    ];
  }

  constructor() {
    super();
    this._boundSetPosition = this._setPosition.bind(this);
  }

  open() {
    super.open()

    window.requestAnimationFrame(() => {
      this._setPosition();
    });
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._boundSetPosition);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._boundSetPosition);
  }

 _setPosition() {
    const rect = this.positionTarget.getBoundingClientRect();
    this.style.left = rect.left + 'px';
    this.style.top = rect.top + rect.height + 'px';
    this.style.width = rect.width + 'px';
    this.style.bottom = 'auto';
    this.style.right = 'auto';
  }
}

customElements.define(LitComboBoxOverlay.is, LitComboBoxOverlay);

export { LitComboBoxOverlay };
