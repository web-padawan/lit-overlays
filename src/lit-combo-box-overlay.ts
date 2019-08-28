import { css } from 'lit-element';
import { LitDropdownOverlay } from './lit-dropdown-overlay';

class LitComboBoxOverlay extends LitDropdownOverlay {
  // Used to instantiate the class.
  static is = 'lit-combo-box-overlay';

  static get styles() {
    return [
      super.styles,
      css`
        [part='overlay'] {
          max-height: 200px;
          overflow: hidden;
        }

        ::slotted(lit-virtualizer) {
          height: 200px;
        }

        :host(:not([opened])) ::slotted(lit-virtualizer) {
          height: 0;
        }
      `
    ];
  }
}

customElements.define(LitComboBoxOverlay.is, LitComboBoxOverlay);

export { LitComboBoxOverlay };
