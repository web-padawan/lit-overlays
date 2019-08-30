import { LitElement, html, customElement, property, PropertyValues } from 'lit-element';
import { LitSelectOverlay } from './lit-select-overlay';
import { LitListBox } from './lit-list-box';
import { LitItem } from './lit-item';
import { portal } from './lit-portal-directive';
import './lit-list-box';
import './lit-item';
import { notify } from './utils/notify';

const $renderItem = Symbol('renderItem');

@customElement('lit-select-dropdown')
export class LitSelectDropdown extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Array }) items = [];

  @property({ type: String }) value = '';

  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  protected overlay: LitSelectOverlay | null = null;

  protected [$renderItem] = (item: unknown) => html`
    <lit-item>${item}</lit-item>
  `;

  protected render() {
    return html`
      ${portal(
        this.opened,
        html`
          <lit-list-box>
            ${this.items.map(this[$renderItem])}
          </lit-list-box>
        `,
        { component: LitSelectOverlay }
      )}
    `;
  }

  protected firstUpdated() {
    this.overlay = this.renderRoot.querySelector(LitSelectOverlay.is) as LitSelectOverlay;

    this.overlay.addEventListener('lit-overlay-outside-click', () => {
      notify(this, 'opened', false);
    });

    this.overlay.addEventListener('lit-overlay-escape-press', () => {
      notify(this, 'opened', false);
    });

    this.overlay.addEventListener('lit-item-click', (event: Event) => {
      notify(this, 'opened', false);
      notify(this, 'value', (event.target as LitItem).value);
    });
  }

  protected updated(props: PropertyValues) {
    if (props.has('positionTarget') && this.overlay) {
      this.overlay.positionTarget = this.positionTarget;
    }

    if (props.has('opened') && this.opened) {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          const listBox = (this.overlay as LitSelectOverlay).querySelector(
            'lit-list-box'
          ) as LitListBox;
          listBox.focus();
        });
      });
    }
  }

  get renderItem() {
    return this[$renderItem];
  }

  set renderItem(renderItem) {
    if (renderItem !== this.renderItem) {
      this[$renderItem] = renderItem;
      this.requestUpdate();
    }
  }
}
