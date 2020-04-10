import { css, customElement } from 'lit-element';
import { LitDropdownOverlay } from './lit-dropdown-overlay';

@customElement('lit-select-overlay')
export class LitSelectOverlay extends LitDropdownOverlay {
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

declare global {
  interface HTMLElementTagNameMap {
    'lit-select-overlay': LitSelectOverlay;
  }
}
