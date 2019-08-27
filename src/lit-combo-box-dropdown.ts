import { LitElement, html, customElement, property, PropertyValues } from 'lit-element';
import 'lit-virtualizer';
import { LitVirtualizer } from 'lit-virtualizer';
import { LitComboBoxOverlay } from './lit-combo-box-overlay';
import { LitComboBoxItem } from './lit-combo-box-item';
import { portal } from './lit-portal-directive';
import './lit-combo-box-item';
import { notify } from './utils/notify';

interface ComboBoxItem {
  value: string;
  label: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-virtualizer': LitVirtualizer<ComboBoxItem>;
  }
}

@customElement('lit-combo-box-dropdown')
export class LitComboBoxDropdown extends LitElement {
  @property({ type: Boolean }) opened = false;

  @property({ type: Array }) items = [];

  @property({ type: String }) value = '';

  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  protected renderItem = (item: ComboBoxItem) => {
    const { value, label } = item;
    return html`
      <lit-combo-box-item .value="${value}" .label="${label}" class="scroller"></lit-combo-box-item>
    `;
  };

  protected overlay: LitComboBoxOverlay | null = null;

  protected render() {
    return html`
      ${portal(
        this.opened,
        html`
          <lit-virtualizer
            .items="${this.items}"
            .renderItem="${this.renderItem}"
          ></lit-virtualizer>
        `,
        { component: LitComboBoxOverlay }
      )}
    `;
  }

  protected firstUpdated() {
    this.overlay = this.renderRoot.querySelector(LitComboBoxOverlay.is) as LitComboBoxOverlay;

    this.overlay.addEventListener('lit-overlay-outside-click', () => {
      notify(this, 'opened', false);
    });

    this.overlay.addEventListener('lit-overlay-escape-press', () => {
      notify(this, 'opened', false);
    });

    this.overlay.addEventListener('lit-combo-box-item-click', (event: Event) => {
      notify(this, 'opened', false);
      notify(this, 'value', (event.target as LitComboBoxItem).value);
    });
  }

  protected updated(props: PropertyValues) {
    if (props.has('opened') && this.opened && this.value && this.items) {
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          const scroller = (this.overlay as LitComboBoxOverlay).querySelector(
            'lit-virtualizer'
          ) as LitVirtualizer<ComboBoxItem>;
          const index = this.items.findIndex((item: ComboBoxItem) => item.value === this.value);
          if (index > -1) {
            scroller.scrollToIndex(index, 'end');
          }
        });
      });
    }

    if (props.has('positionTarget') && this.overlay) {
      this.overlay.positionTarget = this.positionTarget;
    }
  }
}
