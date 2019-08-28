import { property, PropertyValues, css } from 'lit-element';
import { LitOverlay } from './lit-overlay';

interface AlignmentProperties {
  start: 'top' | 'left';
  end: 'right' | 'bottom';
}

type AlignmentProperty = 'top' | 'right' | 'bottom' | 'left';

const dimensions = {
  HORIZONTAL: { start: 'left', end: 'right' } as AlignmentProperties,
  VERTICAL: { start: 'top', end: 'bottom' } as AlignmentProperties
};

const shouldAlignDefault = (
  isCurrentDefault: boolean,
  overlaySize: number,
  contentSize: number,
  spaceOnDefaultSide: number,
  spaceOnOtherSide: number
) => {
  if (spaceOnDefaultSide > spaceOnOtherSide) {
    return true;
  }

  const fitsOnCurrentSide = contentSize < overlaySize;

  if (isCurrentDefault) {
    return fitsOnCurrentSide;
  }

  if (!fitsOnCurrentSide) {
    return false;
  }

  return contentSize < spaceOnDefaultSide;
};

const getSpace = (
  targetRect: ClientRect,
  viewportSize: number,
  isDefaultStart: boolean,
  startProp: AlignmentProperty,
  endProp: AlignmentProperty
) => {
  const spaceForStart = viewportSize - targetRect[startProp];
  const spaceForEnd = targetRect[endProp];

  return isDefaultStart
    ? { defaultSpace: spaceForStart, otherSpace: spaceForEnd }
    : { defaultSpace: spaceForEnd, otherSpace: spaceForStart };
};

const getPositionInOneDimension = (
  targetRect: ClientRect,
  overlaySize: number,
  contentSize: number,
  viewportSize: number,
  isDefaultStart: boolean,
  isCurrentStart: boolean,
  noOverlap: boolean,
  propNames: AlignmentProperties
) => {
  const startProp = noOverlap ? propNames.end : propNames.start;
  const endProp = noOverlap ? propNames.start : propNames.end;

  const { defaultSpace, otherSpace } = getSpace(
    targetRect,
    viewportSize,
    isDefaultStart,
    startProp,
    endProp
  );

  const isShouldAlignDefault = shouldAlignDefault(
    isCurrentStart === isDefaultStart,
    overlaySize,
    contentSize,
    defaultSpace,
    otherSpace
  );

  const shouldAlignStart =
    (isShouldAlignDefault && isDefaultStart) || (!isShouldAlignDefault && !isDefaultStart);

  if (shouldAlignStart) {
    return [propNames.start, targetRect[startProp]];
  }

  return [propNames.end, viewportSize - targetRect[endProp]];
};

export abstract class LitPositionedOverlay extends LitOverlay {
  @property({ attribute: false }) positionTarget: HTMLElement | null = null;

  @property({ type: String }) horizontalAlign = 'start';

  @property({ type: String }) verticalAlign = 'top';

  @property({ type: Boolean }) noHorizontalOverlap = false;

  @property({ type: Boolean }) noVerticalOverlap = false;

  @property({ type: Boolean }) fitWidth = false;

  protected boundUpdatePosition = this.updatePosition.bind(this);

  static get styles() {
    return [
      super.styles,
      css`
        :host {
          top: auto;
          right: auto;
          bottom: auto;
          left: auto;
        }
      `
    ];
  }

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
    const overlayWidth = this.clientWidth;
    const contentWidth = (this.$.content as HTMLElement).clientWidth;
    const viewportWidth = Math.min(window.innerWidth, document.documentElement.clientWidth);
    const defaultAlignLeft = !!(
      (!rtl && this.horizontalAlign === 'start') ||
      (rtl && this.horizontalAlign === 'end')
    );
    const currentAlignLeft = !!this.style.left;

    return getPositionInOneDimension(
      targetRect,
      overlayWidth,
      contentWidth,
      viewportWidth,
      defaultAlignLeft,
      currentAlignLeft,
      this.noHorizontalOverlap,
      dimensions.HORIZONTAL
    );
  }

  protected getVerticalPosition(targetRect: ClientRect) {
    const overlayHeight = this.clientHeight;
    const contentHeight = (this.$.content as HTMLElement).clientHeight;
    const viewportHeight = Math.min(window.innerHeight, document.documentElement.clientHeight);
    const defaultAlignTop = this.verticalAlign === 'top';
    const currentAlignTop = !!this.style.top;

    return getPositionInOneDimension(
      targetRect,
      overlayHeight,
      contentHeight,
      viewportHeight,
      defaultAlignTop,
      currentAlignTop,
      this.noVerticalOverlap,
      dimensions.VERTICAL
    );
  }

  protected setPosition() {
    const targetRect = (this.positionTarget as HTMLElement).getBoundingClientRect();

    const rtl = getComputedStyle(this).direction === 'rtl';

    const position = Object.fromEntries([
      this.getHorizontalPosition(targetRect, rtl),
      this.getVerticalPosition(targetRect)
    ]);

    ['left', 'right', 'top', 'bottom'].forEach(prop => {
      if (position[prop] !== undefined) {
        this.style[prop as AlignmentProperty] = `${position[prop]}px`;
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
