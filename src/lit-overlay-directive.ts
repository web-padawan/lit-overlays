import { directive, TemplateResult, Part, NodePart, nothing } from 'lit-html';
import { render } from 'lit-html/lib/shady-render';
import { LitOverlay } from './lit-overlay';

const teleportCaches = new WeakMap();

export const overlay = directive((opened: unknown, value, config = {}) => (part: Part) => {
  if (!(part instanceof NodePart)) {
    throw new Error('overlay can only be used in text bindings');
  }

  if (value instanceof TemplateResult) {
    let template, teleport;
    let teleportCache = teleportCaches.get(part);

    if (teleportCache === undefined) {
      // initialize the template
      template = part.options.templateFactory(value);

      let {component, backdrop} = config;

      if (Object.getPrototypeOf(component) !== LitOverlay) {
        console.warn('Custom overlay component must extend lit-overlay');
        component = LitOverlay;
      }

      // create a new overlay
      teleport = document.createElement(component.is);
      teleport.withBackdrop = backdrop;

      // save overlay into cache
      teleportCaches.set(part, {template, teleport});

      // set the initial value
      part.setValue(teleport);
    } else {
      template = teleportCache.template;
      teleport = teleportCache.teleport;
    }

    if (opened) {
      render(value, teleport, {
        scopeName: teleport.tagName.toLowerCase(),
        eventContext: teleport.getRootNode().host
      });
      teleport.open();
      part.setValue(nothing);
    } else if (teleport.parentNode === document.body) {
      teleport.close();
      part.setValue(teleport);
    }
  }
});
