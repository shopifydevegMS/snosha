/*
 * dev2.js — scripts for session "dev2".
 * Loaded as a module only by sections that use a dev2 design option (inside that condition).
 */

import { DialogComponent, DialogCloseEvent } from '@theme/dialog';

/**
 * <dev2-carousel-progress>: visual-only scroll indicator for the carousel section's dev2 designs
 * (sections/carousel.liquid: Design 3 "Choose your care", Design 4 "Reviews · Screenshots").
 * It reads the native <slideshow-slides> scroller of its own
 * section and never handles input: no clicks, drags or focus (aria-hidden in the markup).
 *
 * Exposes on itself:
 *   --dev2-progress-size      visible part of the track (clientWidth / scrollWidth, 0–1)
 *   --dev2-progress-position  scroll position (0 at the carousel's start edge, 1 at its end)
 *   data-overflow="true|false"  false when nothing scrolls (CSS hides the bar)
 */
class Dev2CarouselProgress extends HTMLElement {
  /** @type {HTMLElement | null} */
  #scroller = null;
  /** @type {ResizeObserver | null} */
  #resizeObserver = null;
  #frame = 0;
  #startFrame = 0;
  #attempts = 0;

  connectedCallback() {
    this.#connect();
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.#frame);
    cancelAnimationFrame(this.#startFrame);
    this.#scroller?.removeEventListener('scroll', this.#schedule);
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#scroller = null;
    this.#attempts = 0;
  }

  /** Finds the section's native scroller; retries for a few frames while the slideshow renders. */
  #connect = () => {
    if (this.#scroller || !this.isConnected) return;

    const scroller = this.closest('.dev2-care, .dev2-shots')?.querySelector('slideshow-slides');
    if (!(scroller instanceof HTMLElement)) {
      if (this.#attempts++ < 60) this.#frame = requestAnimationFrame(this.#connect);
      return;
    }

    this.#scroller = scroller;
    this.#startOnFeatured(scroller);
    scroller.addEventListener('scroll', this.#schedule, { passive: true });
    this.#resizeObserver = new ResizeObserver(this.#schedule);
    this.#resizeObserver.observe(scroller);
    this.#update();
  };

  /**
   * Mobile (< 750px) only: open the centre-focused carousel on the featured card, through the native
   * slideshow's `initial-slide` attribute (slideshow.js selects it without animation, now or at init).
   * @param {HTMLElement} scroller
   */
  #startOnFeatured(scroller) {
    if (!window.matchMedia('(max-width: 749px)').matches) return;

    const slideshow = scroller.closest('slideshow-component');
    const slides = [...scroller.children];
    const index = slides.findIndex((slide) => slide.querySelector('.dev2-care-featured'));
    if (!slideshow || index < 1) return;

    slideshow.setAttribute('initial-slide', String(index));

    // If the slideshow was mid-init, its init (scheduler frame + one more frame) can still select the
    // slide it read before; select again once that has settled.
    let frames = 4;
    const settle = () => {
      if (!this.isConnected) return;
      if (--frames > 0) {
        this.#startFrame = requestAnimationFrame(settle);
        return;
      }
      if (typeof slideshow.select === 'function') slideshow.select(index, undefined, { animate: false });
    };
    this.#startFrame = requestAnimationFrame(settle);
  }

  #schedule = () => {
    cancelAnimationFrame(this.#frame);
    this.#frame = requestAnimationFrame(this.#update);
  };

  #update = () => {
    const scroller = this.#scroller;
    if (!scroller) return;

    const { scrollWidth, clientWidth } = scroller;
    const range = scrollWidth - clientWidth;
    const overflow = range > 1;
    this.dataset.overflow = String(overflow);
    if (!overflow) return;

    // scrollLeft is negative in RTL scrollers; the magnitude is the distance from the start edge.
    const position = Math.min(1, Math.max(0, Math.abs(scroller.scrollLeft) / range));
    this.style.setProperty('--dev2-progress-size', String(clientWidth / scrollWidth));
    this.style.setProperty('--dev2-progress-position', String(position));
  };
}

if (!customElements.get('dev2-carousel-progress')) {
  customElements.define('dev2-carousel-progress', Dev2CarouselProgress);
}

/**
 * <dev2-shots-lightbox>: full-image viewer for the "Reviews · Screenshots" carousel
 * (sections/carousel.liquid, Design 4). Built on the theme's DialogComponent (@theme/dialog):
 * a modal <dialog> (background inert, focus kept inside), Escape and outside-click close, scroll lock.
 *
 * Opens from any `[data-dev2-shot]` button in its own section (rendered by blocks/_card.liquid):
 * shows `data-full-src` uncropped with the screenshot's alt text, and returns focus to that button
 * on close. A click that ends a carousel drag never reaches the button (slideshow.js swallows it).
 */
class Dev2ShotsLightbox extends DialogComponent {
  requiredRefs = ['dialog', 'image'];

  /** @type {HTMLElement | null} */
  #scope = null;
  /** @type {HTMLElement | null} */
  #trigger = null;

  connectedCallback() {
    super.connectedCallback();
    this.#scope = this.closest('.dev2-shots');
    this.#scope?.addEventListener('click', this.#handleTrigger);
    this.addEventListener(DialogCloseEvent.eventName, this.#restoreFocus);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#scope?.removeEventListener('click', this.#handleTrigger);
    this.removeEventListener(DialogCloseEvent.eventName, this.#restoreFocus);
    this.#scope = null;
    this.#trigger = null;
  }

  /** @param {MouseEvent} event */
  #handleTrigger = (event) => {
    const target = /** @type {Element | null} */ (event.target);
    const trigger = target?.closest('[data-dev2-shot]');
    if (!(trigger instanceof HTMLElement) || !this.#scope?.contains(trigger)) return;

    const { image } = this.refs;
    const src = trigger.dataset.fullSrc;
    if (!(image instanceof HTMLImageElement) || !src) return;

    this.#trigger = trigger;
    image.alt = trigger.dataset.alt || '';
    if (trigger.dataset.width) image.width = Number(trigger.dataset.width);
    if (trigger.dataset.height) image.height = Number(trigger.dataset.height);
    image.src = src;
    this.showDialog();
  };

  #restoreFocus = () => {
    const trigger = this.#trigger;
    this.#trigger = null;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  };
}

if (!customElements.get('dev2-shots-lightbox')) {
  customElements.define('dev2-shots-lightbox', Dev2ShotsLightbox);
}

/**
 * <dev2-faq-open-first>: section "Design 4" (14 FAQ), setting "Open the first question automatically".
 * Rendered next to the section's .dev2-faq wrapper only while the setting is on.
 *
 * Opens the first question in reading order, through the native accordion's own breakpoint flags
 * (accordion-custom `open-by-default-on-mobile` / `open-by-default-on-desktop`, which the native
 * component re-applies when the screen crosses its 750px breakpoint):
 *   - mobile (one list): the first row in page order;
 *   - desktop (columns side by side): the first row of the column where reading starts —
 *     the right column for RTL (Arabic) questions, the left one for LTR.
 * The rows' own "Open row by default" is ignored while this is on. Runs again whenever the section
 * re-renders (Theme Editor: rows added, removed or reordered).
 */
class Dev2FaqOpenFirst extends HTMLElement {
  #frame = 0;

  connectedCallback() {
    this.#frame = requestAnimationFrame(this.#apply);
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.#frame);
  }

  #apply = () => {
    const scope = this.parentElement?.querySelector('.dev2-faq');
    if (!scope) return;

    const accordions = [...scope.querySelectorAll('.accordion')];
    const firstRow = (accordion) => accordion.querySelector(':scope > accordion-custom');
    const rows = accordions.flatMap((accordion) => [...accordion.querySelectorAll(':scope > accordion-custom')]);
    if (!rows.length) return;

    const rtl = getComputedStyle(accordions[0]).direction === 'rtl';
    const mobileFirst = rows[0];
    const desktopFirst = (rtl ? [...accordions].reverse() : accordions).map(firstRow).find(Boolean);

    for (const row of rows) {
      row.toggleAttribute('open-by-default-on-mobile', row === mobileFirst);
      row.toggleAttribute('open-by-default-on-desktop', row === desktopFirst);
    }

    // Same 750px breakpoint as the native accordion. The rows share one <details name>,
    // so opening this one closes any other row the native component opened first.
    const isDesktop = window.matchMedia('(min-width: 750px)').matches;
    const details = (isDesktop ? desktopFirst : mobileFirst)?.querySelector('details');
    if (details) details.open = true;
  };
}

if (!customElements.get('dev2-faq-open-first')) {
  customElements.define('dev2-faq-open-first', Dev2FaqOpenFirst);
}
