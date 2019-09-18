import { property, PropertyValues } from 'lit-element';
import { LitOverlay } from './lit-overlay';

interface AlignmentProperties {
  start: 'top' | 'left';
  end: 'right' | 'bottom';
}

type AlignmentProperty = 'top' | 'right' | 'bottom' | 'left';

type AlignmentMargins = { [s: string]: number };

const dimensions = {
  HORIZONTAL: { start: 'left', end: 'right' } as AlignmentProperties,
  VERTICAL: { start: 'top', end: 'bottom' } as AlignmentProperties
};

const $margins = new WeakMap();

/**
 * Returns an object with CSS position properties to set,
 * e.g. { top: "100px", bottom: "" }
 */
const getPositionInOneDimension = (
  targetRect: ClientRect,
  contentSize: number,
  viewportSize: number,
  margins: AlignmentMargins,
  isDefaultStart: boolean,
  noOverlap: boolean,
  propNames: AlignmentProperties
) => {
  const { start, end } = propNames;
  const startProp = noOverlap ? end : start;
  const endProp = noOverlap ? start : end;

  const spaceForStart = viewportSize - targetRect[startProp] - margins[end];
  const spaceForEnd = targetRect[endProp] - margins[start];

  const defaultSpace = isDefaultStart ? spaceForStart : spaceForEnd;
  const otherSpace = isDefaultStart ? spaceForEnd : spaceForStart;

  const shouldAlignDefault = defaultSpace > otherSpace || defaultSpace > contentSize;

  const shouldAlignStart = isDefaultStart === shouldAlignDefault;

  const cssPropToSet = shouldAlignStart ? start : end;
  const cssPropToClear = shouldAlignStart ? end : start;

  const cssPropValueToSet = `${
    shouldAlignStart ? targetRect[startProp] : viewportSize - targetRect[startProp]
  }px`;

  const props: { [s: string]: string } = {};
  props[cssPropToSet] = cssPropValueToSet;
  props[cssPropToClear] = '';
  return props;
};

export abstract class LitPositionedOverlay extends LitOverlay {
  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  @property({ type: String }) horizontalAlign = 'start';

  @property({ type: String }) verticalAlign = 'top';

  @property({ type: Boolean }) noHorizontalOverlap = false;

  @property({ type: Boolean }) noVerticalOverlap = false;

  @property({ type: Boolean }) fitWidth = false;

  protected boundUpdatePosition = this.updatePosition.bind(this);

  updated(props: PropertyValues) {
    super.updated(props);

    if (
      props.has('positionTarget') ||
      props.has('horizontalAlign') ||
      props.has('verticalAlign') ||
      props.has('noHorizontalOverlap') ||
      props.has('noVerticalOverlap')
    ) {
      setTimeout(() => this.updatePosition());
    }

    if ((props.has('opened') && this.opened) || props.get('opened')) {
      const func = this.opened ? 'addEventListener' : 'removeEventListener';
      window[func]('scroll', this.boundUpdatePosition);
      window[func]('resize', this.boundUpdatePosition);
    }
  }

  updatePosition() {
    if (!this.positionTarget) {
      return;
    }

    this.setPosition();
  }

  protected getHorizontalPosition(targetRect: ClientRect, rtl: boolean) {
    const contentWidth = (this.$.overlay as HTMLElement).offsetWidth;
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const defaultAlignLeft = !!(
      (!rtl && this.horizontalAlign === 'start') ||
      (rtl && this.horizontalAlign === 'end')
    );

    return getPositionInOneDimension(
      targetRect,
      contentWidth,
      viewportWidth,
      $margins.get(this),
      defaultAlignLeft,
      this.noHorizontalOverlap,
      dimensions.HORIZONTAL
    );
  }

  protected getVerticalPosition(targetRect: ClientRect) {
    const contentHeight = (this.$.overlay as HTMLElement).offsetHeight;
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const defaultAlignTop = this.verticalAlign === 'top';

    return getPositionInOneDimension(
      targetRect,
      contentHeight,
      viewportHeight,
      $margins.get(this),
      defaultAlignTop,
      this.noVerticalOverlap,
      dimensions.VERTICAL
    );
  }

  protected setPosition() {
    const computedStyle = getComputedStyle(this);

    const props: Array<AlignmentProperty> = ['top', 'bottom', 'left', 'right'];

    if (!$margins.has(this)) {
      const margins: AlignmentMargins = {};
      props.forEach(propName => {
        margins[propName] = parseInt(computedStyle[propName] as string, 10);
      });
      $margins.set(this, margins);
    }

    const targetRect = (this.positionTarget as HTMLElement).getBoundingClientRect();

    const rtl = computedStyle.direction === 'rtl';

    const position = {
      ...this.getHorizontalPosition(targetRect, rtl),
      ...this.getVerticalPosition(targetRect)
    };

    props.forEach(prop => {
      if (position[prop] !== undefined) {
        this.style[prop as AlignmentProperty] = position[prop];
      } else {
        this.style[prop as AlignmentProperty] = '';
      }
    });

    const alignStart = (!rtl && position.left) || (rtl && position.right);

    this.style.alignItems = alignStart ? 'flex-start' : 'flex-end';

    this.style.justifyContent = position.top ? 'flex-start' : 'flex-end';

    if (this.fitWidth) {
      this.style.width = `${targetRect.width}px`;
    }
  }
}
