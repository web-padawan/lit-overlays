import { LitElement, property, PropertyValues } from 'lit-element';

const $mousedown = Symbol('mousedown');
const $value = Symbol('value');

export class LitItemBase extends LitElement {
  @property({ type: Boolean, reflect: true }) selected = false;

  @property({ type: Boolean, reflect: true }) focused = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  protected [$mousedown] = false;

  protected [$value]: string | null | undefined;

  get value() {
    return this[$value] !== undefined ? this[$value] : this.textContent && this.textContent.trim();
  }

  set value(value) {
    this[$value] = value;
  }

  update(props: PropertyValues) {
    super.update(props);

    if (props.has('disabled')) {
      this._disabledChanged(this.disabled);
    }

    if (props.has('selected')) {
      this._selectedChanged(this.selected);
    }

    if (props.has('focused')) {
      this._setFocused(this.focused);
    }
  }

  firstUpdated() {
    const attrValue = this.getAttribute('value');
    if (attrValue !== null) {
      this.value = attrValue;
    }

    this.addEventListener('focus', () => this._setFocused(true), true);
    this.addEventListener('blur', () => this._setFocused(false), true);

    this.addEventListener('mousedown', () => {
      this._setActive((this[$mousedown] = true));
      const mouseUpListener = () => {
        this._setActive((this[$mousedown] = false));
        document.removeEventListener('mouseup', mouseUpListener);
      };
      document.addEventListener('mouseup', mouseUpListener);
    });

    this.addEventListener('keydown', e => this._onKeydown(e));

    this.addEventListener('keyup', () => this._onKeyup());
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // in Firefox and Safari, blur does not fire on the element when it is removed,
    // especially between keydown and keyup events, being active at the same time.
    if (this.hasAttribute('active')) {
      this._setFocused(false);
    }
  }

  protected _selectedChanged(selected: boolean) {
    this.setAttribute('aria-selected', String(selected));
  }

  protected _disabledChanged(disabled: boolean) {
    if (disabled) {
      this.selected = false;
      this.setAttribute('aria-disabled', 'true');
      this.blur();
    } else {
      this.removeAttribute('aria-disabled');
    }
  }

  protected _setFocused(focused: boolean) {
    if (focused) {
      this.setAttribute('focused', '');
      if (!this[$mousedown]) {
        this.setAttribute('focus-ring', '');
      }
    } else {
      this.removeAttribute('focused');
      this.removeAttribute('focus-ring');
      this._setActive(false);
    }
  }

  protected _setActive(active: boolean) {
    if (active) {
      this.setAttribute('active', '');
    } else {
      this.removeAttribute('active');
    }
  }

  protected _onKeydown(event: KeyboardEvent) {
    if (/^( |SpaceBar|Enter)$/.test(event.key) && !event.defaultPrevented) {
      // event.preventDefault();
      this._setActive(true);
    }
  }

  protected _onKeyup() {
    if (this.hasAttribute('active')) {
      this._setActive(false);
      this.click();
    }
  }
}
