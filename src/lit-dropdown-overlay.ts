import { css, property, PropertyValues } from 'lit-element';
import { LitOverlay } from './lit-overlay';

export abstract class LitDropdownOverlay extends LitOverlay {
  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          margin: 0;
          align-items: stretch;
        }

        [part='overlay'] {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `
    ];
  }

  protected boundSetPosition = this.setPosition.bind(this);

  updated(props: PropertyValues) {
    super.updated(props);
    if (props.has('opened') && this.opened) {
      window.requestAnimationFrame(() => {
        this.setPosition();
      });
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this.boundSetPosition);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this.boundSetPosition);
  }

  protected setPosition() {
    const rect = (this.positionTarget as HTMLElement).getBoundingClientRect();
    this.style.left = `${rect.left}px`;
    this.style.top = `${rect.top + rect.height}px`;
    this.style.width = `${rect.width}px`;
    this.style.bottom = 'auto';
    this.style.right = 'auto';
  }
}
