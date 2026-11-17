/*
 * dev4.js — scripts for session "dev4".
 * Loaded as a module only by sections whose Design is "Design - dev4".
 */

/**
 * <dev4-carousel-progress>
 * Visual-only scroll indicator for the dev4 collections carousel (shown below 750px by assets/dev4.css).
 * It reads the scroll position of the section's native <slideshow-slides> scroller and never handles input.
 * Sets on itself: --dev4-progress-size (visible share, 0–1), --dev4-progress-offset (0–1 of the track),
 * data-overflow="true|false" (false hides the bar when nothing scrolls).
 */
class Dev4CarouselProgress extends HTMLElement {
  /** @type {HTMLElement | null} */
  #scroller = null;
  /** @type {ResizeObserver | null} */
  #resizeObserver = null;
  /** @type {MutationObserver | null} */
  #mutationObserver = null;
  #frame = 0;
  #retryFrame = 0;
  #retries = 0;

  connectedCallback() {
    this.#retries = 0;
    this.#connect();
  }

  disconnectedCallback() {
    this.#disconnect();
  }

  #connect = () => {
    this.#retryFrame = 0;
    if (this.#scroller || !this.isConnected) return;

    const scroller = this.closest('.dev4-collections')?.querySelector('slideshow-slides');

    if (!(scroller instanceof HTMLElement)) {
      // Children may not be parsed yet (editor re-render, morph): retry briefly.
      if (this.#retries++ < 60) this.#retryFrame = requestAnimationFrame(this.#connect);
      return;
    }

    this.#scroller = scroller;
    scroller.addEventListener('scroll', this.#schedule, { passive: true });

    this.#resizeObserver = new ResizeObserver(this.#schedule);
    this.#resizeObserver.observe(scroller);

    this.#mutationObserver = new MutationObserver(this.#schedule);
    this.#mutationObserver.observe(scroller, { childList: true });

    this.#update();
  };

  #disconnect() {
    if (this.#retryFrame) cancelAnimationFrame(this.#retryFrame);
    if (this.#frame) cancelAnimationFrame(this.#frame);
    this.#retryFrame = 0;
    this.#frame = 0;

    this.#scroller?.removeEventListener('scroll', this.#schedule);
    this.#resizeObserver?.disconnect();
    this.#mutationObserver?.disconnect();

    this.#scroller = null;
    this.#resizeObserver = null;
    this.#mutationObserver = null;
  }

  #schedule = () => {
    if (!this.#frame) this.#frame = requestAnimationFrame(this.#update);
  };

  #update = () => {
    this.#frame = 0;
    const scroller = this.#scroller;
    if (!scroller) return;

    // The bar follows the scroller's own direction, so its start edge matches the carousel's start edge.
    const direction = getComputedStyle(scroller).direction;
    if (this.style.direction !== direction) this.style.direction = direction;

    const { scrollWidth, clientWidth } = scroller;
    const range = scrollWidth - clientWidth;
    const overflow = range > 1 && scrollWidth > 0;

    this.dataset.overflow = String(overflow);

    if (!overflow) {
      this.style.setProperty('--dev4-progress-size', '1');
      this.style.setProperty('--dev4-progress-offset', '0');
      return;
    }

    const size = clientWidth / scrollWidth;
    // RTL scrollers report 0 → negative scrollLeft; the magnitude is the distance from the start edge.
    const progress = Math.min(1, Math.max(0, Math.abs(scroller.scrollLeft) / range));

    this.style.setProperty('--dev4-progress-size', size.toFixed(4));
    this.style.setProperty('--dev4-progress-offset', (progress * (1 - size)).toFixed(4));
  };
}

if (!customElements.get('dev4-carousel-progress')) {
  customElements.define('dev4-carousel-progress', Dev4CarouselProgress);
}
