declare module 'lit-virtualizer' {
  import { LitElement } from 'lit-element';

  class LitVirtualizer extends LitElement {
    /**
     * The items array.
     */
    items: any[] | null | undefined;

    /**
     * The method used for rendering each item.
     */
    renderItem: Function;

    /**
     * Scroll to the specified index, placing that item at the given position
     * in the scroll view.
     */
    scrollToIndex(index: number, position: string): void;
  }

  export { LitVirtualizer };

  declare global {
    interface HTMLElementTagNameMap {
      'lit-virtualizer': LitVirtualizer;
    }
  }
}
