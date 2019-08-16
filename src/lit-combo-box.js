import { LitElement, html } from 'lit-element';
import 'lit-virtualizer';
import { LitComboBoxOverlay } from './lit-combo-box-overlay.js';
import { overlay } from './lit-overlay-directive.js';
import './lit-combo-box-item.js';

export class LitComboBox extends LitElement {
  static get properties() {
    return {
      opened: {
        type: Boolean
      },
      items: {
        type: Array
      },
      value: {
        type: String
      },
      _items: {
        type: Array
      }
    };
  }

  constructor() {
    super();

    this.opened = false;

    // overlay component class
    this._config = {component: LitComboBoxOverlay};

    // item rendering function
    this._renderItem = ({ name, index }) => {
      return html`
        <lit-combo-box-item
          value="${name}"
          label="${index} ${name}"
          @click="${this._updateValue}"
          class="scroller"
        ></lit-combo-box-item>
      `;
    };
  }

  render() {
    return html`
      <label>
        <input type="text" .value="${this.value}" @click="${this._toggle}">
      </label>

      ${overlay(
        this.opened,
        html`
          <lit-virtualizer
            .items=${this._items}
            .renderItem="${this._renderItem}"
            class="scroller"
          ></lit-virtualizer>
        `,
        this._config
      )}
    `;
  }

  update(props) {
    if (props.has('opened')) {
      this._items = this.opened ? this.items : [];
    }

    super.update(props);
  }

  firstUpdated() {
    const overlay = this.shadowRoot.querySelector(LitComboBoxOverlay.is);

    overlay.addEventListener('lit-overlay-outside-click', () => {
      this.opened = false;
    });

    overlay.addEventListener('lit-combo-box-item-click', e => {
      this.opened = false;
      this.value = e.detail.value;
    });

    overlay.positionTarget = this.shadowRoot.querySelector('input');

    this._overlay = overlay;
  }

  updated(props) {
    if (props.has('opened') && this.opened && this.value && this.items) {
      window.requestAnimationFrame(() => {
        const scroller = this._overlay.querySelector('.scroller');
        const index = this.items.findIndex(item => item.name === this.value);
        if (index > -1) {
          scroller.scrollToIndex(index, 'start');
        }
      });
    }
  }

  _toggle() {
    this.opened = !this.opened;
  }
}

customElements.define('lit-combo-box', LitComboBox);
