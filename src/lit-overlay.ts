import { LitElement, html, css, customElement, property, CSSResultArray } from 'lit-element';

interface IdCache {
  overlay?: HTMLElement | null;
}

interface ListenersMap {
  mousedown: Function;
  mouseup: Function;
  keydown: Function;
  click: Function;
}

@customElement('lit-overlay')
export class LitOverlay extends LitElement {
  // Used to instantiate the class.
  static is = 'lit-overlay';

  @property({ type: Boolean }) withBackdrop: boolean = false;

  @property({ type: Boolean }) mouseDownInside: boolean = false;

  @property({ type: Boolean }) mouseUpInside: boolean = false;

  protected $: IdCache = {};

  protected listeners: ListenersMap = Object.freeze({
    mousedown: this.mouseDownListener.bind(this),
    mouseup: this.mouseUpListener.bind(this),
    click: this.outsideClickListener.bind(this),
    keydown: this.keydownListener.bind(this)
  });

  static get styles() {
    return [
      css`
        :host {
          z-index: 200;
          position: fixed;

          /*
            Despite of what the names say, <lit-overlay> is just a container
            for position/sizing/alignment. The actual overlay is the overlay part.
          */

          /*
            Default position constraints: the entire viewport. Note: themes can
            override this to introduce gaps between the overlay and the viewport.
          */
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;

          /* Use flexbox alignment for the overlay part. */
          display: flex;
          flex-direction: column; /* makes dropdown sizing easier */
          /* Align to center by default. */
          align-items: center;
          justify-content: center;

          /* Allow centering when max-width/max-height applies. */
          margin: auto;

          /* The host is not clickable, only the overlay part is. */
          pointer-events: none;

          /* Remove tap highlight on touch devices. */
          -webkit-tap-highlight-color: transparent;
        }

        :host(:not([opened]):not([closing])),
        :host([hidden]) {
          display: none !important;
        }

        [part="overlay"] {
          -webkit-overflow-scrolling: touch;
          overflow: auto;
          pointer-events: auto;

          /* Prevent overflowing the host in MSIE 11 */
          max-width: 100%;
          box-sizing: border-box;

          -webkit-tap-highlight-color: initial; /* re-enable tap highlight inside */
          background: #fff;
        }

        [part="backdrop"] {
          z-index: -1;
          content: "";
          background: rgba(0, 0, 0, 0.5);
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          pointer-events: auto;
        }
      `
    ] as CSSResultArray;
  }

  protected render() {
    return html`
      <div id="backdrop" part="backdrop" ?hidden="${!this.withBackdrop}"></div>
      <div part="overlay" id="overlay" tabindex="0">
        <div part="content" id="content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  protected firstUpdated() {
    this.$.overlay = this.shadowRoot!.getElementById('overlay');
  }

  open() {
    document.body.appendChild(this);
    this.addGlobalListeners();
    this.setAttribute('opened', '');
  }

  close() {
    document.body.removeChild(this);
    this.removeGlobalListeners();
    this.removeAttribute('opened');
  }

  protected addGlobalListeners() {
    document.addEventListener('mousedown', this.listeners.mousedown as EventListener);
    document.addEventListener('mouseup', this.listeners.mouseup as EventListener);
    document.addEventListener('click', this.listeners.click as EventListener, true);
    document.addEventListener('keydown', this.listeners.keydown as EventListener);
  }

  protected removeGlobalListeners() {
    document.removeEventListener('mousedown', this.listeners.mousedown as EventListener);
    document.removeEventListener('mouseup', this.listeners.mouseup as EventListener);
    document.removeEventListener('click', this.listeners.click as EventListener, true);
    document.removeEventListener('keydown', this.listeners.keydown as EventListener);
  }

  protected mouseDownListener(event: MouseEvent) {
    this.mouseDownInside = event.composedPath().indexOf(this.$.overlay as HTMLElement) >= 0;
  }

  protected mouseUpListener(event: MouseEvent) {
    this.mouseDownInside = event.composedPath().indexOf(this.$.overlay as HTMLElement) >= 0;
  }

  protected outsideClickListener(event: MouseEvent) {
    if (
      event.composedPath().indexOf(this.$.overlay as HTMLElement) !== -1 ||
      this.mouseDownInside ||
      this.mouseUpInside
    ) {
      this.mouseDownInside = false;
      this.mouseUpInside = false;
      return;
    }

    this.dispatchEvent(
      new CustomEvent('lit-overlay-outside-click', {
        bubbles: true,
        detail: {sourceEvent: event}
      })
    );
  }

  protected keydownListener(event: KeyboardEvent) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.dispatchEvent(
        new CustomEvent('lit-overlay-escape-press', {
          bubbles: true,
          detail: {sourceEvent: event}
        })
      );
    }
  }
}
