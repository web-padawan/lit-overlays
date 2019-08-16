import { LitElement, html, css } from 'lit-element';

class LitOverlay extends LitElement {

  static get is() {
    return 'lit-overlay';
  }

  static get properties() {
    return {
      withBackdrop: {
        type: Boolean
      }
    }
  }

  static get styles() {
    return css`
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
    `;
  }

  render() {
    return html`
      <div id="backdrop" part="backdrop" ?hidden="${!this.withBackdrop}"></div>
      <div part="overlay" id="overlay" tabindex="0">
        <div part="content" id="content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  constructor() {
    super();
    this._boundMouseDownListener = this._mouseDownListener.bind(this);
    this._boundMouseUpListener = this._mouseUpListener.bind(this);
    this._boundOutsideClickListener = this._outsideClickListener.bind(this);
    this._boundKeydownListener = this._keydownListener.bind(this);
  }

  firstUpdated() {
    this.$ = {};
    this.$.overlay = this.shadowRoot.getElementById('overlay');
  }

  open() {
    document.body.appendChild(this);
    this._addGlobalListeners();
    this.setAttribute('opened', '');
  }

  close() {
    document.body.removeChild(this);
    this._removeGlobalListeners();
    this.removeAttribute('opened');
  }

  _addGlobalListeners() {
    document.addEventListener('mousedown', this._boundMouseDownListener);
    document.addEventListener('mouseup', this._boundMouseUpListener);
    document.addEventListener('click', this._boundOutsideClickListener, true);
    document.addEventListener('keydown', this._boundKeydownListener);
  }

  _removeGlobalListeners() {
    document.removeEventListener('mousedown', this._boundMouseDownListener);
    document.removeEventListener('mouseup', this._boundMouseUpListener);
    document.removeEventListener('click', this._boundOutsideClickListener, true);
    document.removeEventListener('keydown', this._boundKeydownListener);
  }

  _mouseDownListener(event) {
    this._mouseDownInside = event.composedPath().indexOf(this.$.overlay) >= 0;
  }

  _mouseUpListener(event) {
    this._mouseUpInside = event.composedPath().indexOf(this.$.overlay) >= 0;
  }

  _outsideClickListener(event) {
    if (
      event.composedPath().indexOf(this.$.overlay) !== -1 ||
      this._mouseDownInside ||
      this._mouseUpInside
    ) {
      this._mouseDownInside = false;
      this._mouseUpInside = false;
      return;
    }

    this.dispatchEvent(
      new CustomEvent('lit-overlay-outside-click', {
        bubbles: true,
        detail: {sourceEvent: event}
      })
    );
  }

  _keydownListener(event) {
    // TAB
    if (event.key === 'Tab' && this.focusTrap) {
      // if only tab key is pressed, cycle forward, else cycle backwards.
      this._cycleTab(event.shiftKey ? -1 : 1);

      event.preventDefault();

    // ESC
    } else if (event.key === 'Escape' || event.key === 'Esc') {
      this.dispatchEvent(
        new CustomEvent('lit-overlay-escape-press', {
          bubbles: true,
          detail: {sourceEvent: event}
        })
      );
    }
  }
}

customElements.define(LitOverlay.is, LitOverlay);

export { LitOverlay };
