import { directive, TemplateResult, Part, NodePart, nothing } from 'lit-html';
import { LitOverlay } from './lit-overlay';

const overlayCaches = new WeakMap();
const defaultConfig = { component: LitOverlay };

export const overlay = directive(
  (opened: unknown, value, config = defaultConfig) => (part: Part) => {
    if (!(part instanceof NodePart)) {
      throw new Error('overlay can only be used in text bindings');
    }

    if (value instanceof TemplateResult) {
      let container;
      let innerPart;
      const overlayCache = overlayCaches.get(part);

      if (overlayCache === undefined) {
        let { component } = config;

        if (Object.getPrototypeOf(component) !== LitOverlay) {
          console.warn('Custom overlay component must extend lit-overlay');
          component = LitOverlay;
        }

        // create a new overlay
        container = document.createElement(component.is);

        // configure properties
        container.withBackdrop = config.backdrop;

        // set the initial value
        part.setValue(container);
        part.commit();

        // render the passed template result
        innerPart = new NodePart(part.options);
        innerPart.appendInto(container);
        innerPart.setValue(value);
        innerPart.commit();

        // save overlay into cache
        overlayCaches.set(part, { container, innerPart });
      } else {
        container = overlayCache.container;
        innerPart = overlayCache.innerPart;
      }

      if (opened) {
        innerPart.value.update(value.values);
        container.open();
        part.setValue(nothing);
      } else if (container.parentNode === document.body) {
        container.close();
        part.setValue(container);
      }
    }
  }
);
