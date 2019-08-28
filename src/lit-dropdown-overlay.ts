import { css, PropertyValues } from 'lit-element';
import { LitPositionedOverlay } from './lit-positioned-overlay';

export abstract class LitDropdownOverlay extends LitPositionedOverlay {
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
        }

        [part='overlay'] {
          width: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `
    ];
  }

  constructor() {
    super();

    this.noVerticalOverlap = true;
    this.fitWidth = true;
  }

  updated(props: PropertyValues) {
    super.updated(props);
    if (props.has('opened') && this.opened) {
      window.requestAnimationFrame(() => {
        this.setPosition();
      });
    }
  }
}
