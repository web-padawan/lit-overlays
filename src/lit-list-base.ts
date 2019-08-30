import { LitElement, property, PropertyValues } from 'lit-element';
import { LitItemBase } from './lit-item-base';

type RectStart = 'top' | 'left';

type RectEnd = 'bottom' | 'right';

function filterItems(array: Array<Element>): Array<LitItemBase> {
  return array.filter((el: Element): el is LitItemBase => el instanceof LitItemBase);
}

export class LitListBase extends LitElement {
  @property({ type: Number, reflect: true }) selected: number | undefined;

  @property({ type: String, reflect: true }) orientation = 'horizontal';

  @property({ attribute: false }) _items: Array<LitItemBase> = [];

  get focused(): LitItemBase {
    return (this.getRootNode() as Document | ShadowRoot).activeElement as LitItemBase;
  }

  get items(): Array<LitItemBase> {
    return this._items;
  }

  protected get _scrollerElement(): Element {
    // Returning scroller element of the component
    console.warn(`Please implement the '_scrollerElement' property in <${this.localName}>`);
    return this;
  }

  protected get _vertical() {
    return this.orientation !== 'horizontal';
  }

  update(props: PropertyValues) {
    if (props.has('_items') || props.has('orientation') || props.has('selected')) {
      this._enhanceItems(this.items, this.orientation, this.selected);
    }

    super.update(props);
  }

  firstUpdated() {
    this.addEventListener('keydown', event => this._onKeydown(event));
    this.addEventListener('click', event => this._onClick(event));

    this._setItems(filterItems(Array.from(this.children)));

    const slot = this.renderRoot.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => {
        this._setItems(filterItems(Array.from(this.children)));
      });
    }
  }

  protected _setItems(items: Array<LitItemBase>) {
    this._items = items;
  }

  _enhanceItems(items: Array<LitItemBase>, orientation: string, selected?: number) {
    if (items) {
      this.setAttribute('aria-orientation', orientation || 'vertical');
      this.items.forEach(item => {
        if (orientation) {
          item.setAttribute('orientation', orientation);
        } else {
          item.removeAttribute('orientation');
        }
      });

      if (selected !== undefined) {
        this._setFocusable(selected);

        const itemToSelect = items[selected];
        items.forEach((item: LitItemBase) => {
          item.selected = item === itemToSelect;
        });
        if (itemToSelect && !itemToSelect.disabled) {
          this._scrollToItem(selected);
        }
      }
    }
  }

  protected _onClick(event: MouseEvent) {
    if (event.metaKey || event.shiftKey || event.ctrlKey) {
      return;
    }

    const path = Array.from(event.composedPath()) as Array<Element>;
    const item = filterItems(path)[0] as LitItemBase;
    if (!item) {
      return;
    }
    const idx = this.items.indexOf(item);
    if (!item.disabled && idx > -1) {
      this.selected = idx;
    }
  }

  protected _onKeydown(event: KeyboardEvent) {
    if (event.metaKey || event.shiftKey || event.ctrlKey) {
      return;
    }

    const key = event.key.replace(/^Arrow/, '');

    const currentIdx = this.items.indexOf(this.focused);
    let condition = (item: LitItemBase) => !item.disabled;
    let idx;
    let increment;

    if ((this._vertical && key === 'Up') || (!this._vertical && key === 'Left')) {
      increment = -1;
      idx = currentIdx - 1;
    } else if ((this._vertical && key === 'Down') || (!this._vertical && key === 'Right')) {
      increment = 1;
      idx = currentIdx + 1;
    } else if (key === 'Home') {
      increment = 1;
      idx = 0;
    } else if (key === 'End') {
      increment = -1;
      idx = this.items.length - 1;
    } else if (key.length === 1) {
      increment = 1;
      idx = currentIdx + 1;
      condition = item =>
        !item.disabled &&
        (item.textContent as string)
          .trim()
          .toLowerCase()
          .indexOf(key.toLowerCase()) === 0;
    }

    const index = this._getAvailableIndex(idx as number, increment as number, condition);

    if (index >= 0) {
      this._focus(index);
      event.preventDefault();
    }
  }

  protected _getAvailableIndex(index: number, increment: number, condition: Function) {
    const totalItems = this.items.length;
    let idx = index;
    for (let i = 0; typeof idx === 'number' && i < totalItems; i += 1, idx += increment || 1) {
      if (idx < 0) {
        idx = totalItems - 1;
      } else if (idx >= totalItems) {
        idx = 0;
      }

      const item = this.items[idx];
      if (condition(item)) {
        return idx;
      }
    }
    return -1;
  }

  protected _setFocusable(index: number) {
    let idx = index;
    idx = this._getAvailableIndex(idx, 1, (item: LitItemBase) => !item.disabled);
    const itemToFocus = this.items[idx] || this.items[0];
    this.items.forEach(item => {
      item.focused = item === itemToFocus;
      item.tabIndex = item === itemToFocus ? 0 : -1;
    });
    itemToFocus.focus();
  }

  protected _focus(idx: number) {
    this._setFocusable(idx);
    this._scrollToItem(idx);
  }

  focus() {
    this._focus(0);
  }

  // Scroll the container to have the next item by the edge of the viewport
  _scrollToItem(idx: number) {
    const item = this.items[idx];
    if (!item) {
      return;
    }

    const scrollerRect = this._scrollerElement.getBoundingClientRect() as ClientRect;
    const nextItemRect = (this.items[idx + 1] || item).getBoundingClientRect();
    const prevItemRect = (this.items[idx - 1] || item).getBoundingClientRect();

    const [start, end] = this._vertical ? ['top', 'bottom'] : ['left', 'right'];

    let scrollDistance = 0;
    if (nextItemRect[end as RectEnd] >= scrollerRect[end as RectEnd]) {
      scrollDistance = nextItemRect[end as RectEnd] - scrollerRect[end as RectEnd];
    } else if (prevItemRect[start as RectStart] <= scrollerRect[start as RectStart]) {
      scrollDistance = prevItemRect[start as RectStart] - scrollerRect[start as RectStart];
    }

    this._scroll(scrollDistance);
  }

  _scroll(pixels: number) {
    const scroll = this._vertical ? 'scrollTop' : 'scrollLeft';
    this._scrollerElement[scroll] += pixels;
  }
}
