import { css } from 'lit-element';
import { LitDropdownOverlay } from './lit-dropdown-overlay';

class LitSelectOverlay extends LitDropdownOverlay {
  // Used to instantiate the class.
  static is = 'lit-select-overlay';

  static get styles() {
    return [
      super.styles,
      css`
        [part='overlay'] {
          max-height: 200px;
        }
      `
    ];
  }

  constructor() {
    super();

    this.noVerticalOverlap = false;
  }
}

customElements.define(LitSelectOverlay.is, LitSelectOverlay);

export { LitSelectOverlay };
