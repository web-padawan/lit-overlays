import { directive, TemplateResult, Part, NodePart } from 'lit-html';
import { LitOverlay } from './lit-overlay';

const overlayCaches = new WeakMap();
const defaultConfig = { component: LitOverlay };

export const portal = directive(
  (opened: unknown, value, config = defaultConfig) => (part: Part) => {
    if (!(part instanceof NodePart)) {
      throw new Error('portal can only be used in text bindings');
    }

    if (value instanceof TemplateResult) {
      let overlay;
      let content;
      const overlayCache = overlayCaches.get(part);

      if (overlayCache === undefined) {
        const { component } = config;

        // create a new overlay
        overlay = document.createElement(component.is);

        // configure properties
        overlay.withBackdrop = config.backdrop;

        // store part reference
        overlay.placeholder = part;

        // set the initial value
        part.setValue(overlay);
        part.commit();

        // render the passed template result
        content = new NodePart(part.options);
        content.appendInto(overlay);
        content.setValue(value);
        content.commit();

        // save overlay into cache
        overlayCaches.set(part, { overlay, content });
      } else {
        overlay = overlayCache.overlay;
        content = overlayCache.content;
      }

      if (opened) {
        content.value.update(value.values);
        overlay.opened = true;
      } else if (overlay.parentNode === document.body) {
        overlay.opened = false;
      }
    }
  }
);
