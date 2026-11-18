/*
 * dev1.js — scripts for session "dev1". Loaded as a module only by sections whose Design is "Design 1".
 */

/* ==== dev1-carousel-progress — 06 Featured Collection (product-list) and 12 Reels (carousel) ==== */
/* Visual-only progress bar for the native mobile product carousel. It reads the scroll position of
   the visible native <slideshow-slides> scroller and never moves it, so it cannot drift from the slider. */
class Dev1CarouselProgress extends HTMLElement {
  #scope = null;
  #scrollers = [];
  #frame = 0;
  #retry = 0;
  #resizeObserver = null;
  #onScroll = () => this.#schedule();

  connectedCallback() {
    this.#scope = this.closest('.dev1-featured, .dev1-reels');
    this.#bind();
  }

  disconnectedCallback() {
    this.#unbind();
    cancelAnimationFrame(this.#retry);
    this.#retry = 0;
  }

  #bind() {
    this.#unbind();
    // Only the section's own slider track — never the image slideshows nested inside product cards.
    const scrollers = this.#scope
      ? [
          ...this.#scope.querySelectorAll(
            ':is(.resource-list__carousel, .carousel-content) > slideshow-container > slideshow-slides'
          ),
        ]
      : [];

    if (!scrollers.length) {
      // Slides may not be upgraded yet (or the section is re-rendering): try again on the next frame.
      this.#retry = requestAnimationFrame(() => this.#bind());
      return;
    }

    this.#scrollers = scrollers;
    this.#resizeObserver = new ResizeObserver(() => this.#schedule());
    for (const scroller of scrollers) {
      scroller.addEventListener('scroll', this.#onScroll, { passive: true });
      this.#resizeObserver.observe(scroller);
    }
    this.#update();
  }

  #unbind() {
    for (const scroller of this.#scrollers) scroller.removeEventListener('scroll', this.#onScroll);
    this.#scrollers = [];
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    cancelAnimationFrame(this.#frame);
    this.#frame = 0;
  }

  #schedule() {
    if (this.#frame) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = 0;
      this.#update();
    });
  }

  #update() {
    // Only the carousel that is currently displayed (mobile) has a layout box.
    const scroller = this.#scrollers.find((element) => element.offsetParent !== null);
    if (!scroller) return;

    const { scrollWidth, clientWidth } = scroller;
    const max = scrollWidth - clientWidth;
    const size = scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1;
    // scrollLeft is negative in RTL; the bar follows the same direction as the slider.
    const position = max > 1 ? Math.min(1, Math.abs(scroller.scrollLeft) / max) : 0;

    this.style.setProperty('--dev1-progress-size', size.toFixed(4));
    this.style.setProperty('--dev1-progress-position', position.toFixed(4));
    this.toggleAttribute('data-static', max <= 1);
  }
}

if (!customElements.get('dev1-carousel-progress')) {
  customElements.define('dev1-carousel-progress', Dev1CarouselProgress);
}

/* ==== dev1-discount-sync — Product Hero (product-information, Design 1) ==== */
/* The native <product-price> swaps only its price container when the variant changes. This wrapper
   (blocks/price.liquid) swaps the discount badge next to it from the same section HTML the theme
   fetched for the new variant, so the badge always matches the selected variant. It listens exactly
   like product-price.js (product select event on the closest section) and never changes the price. */
class Dev1DiscountSync extends HTMLElement {
  #section = null;
  #eventName = '';

  connectedCallback() {
    this.#section = this.closest('.shopify-section, dialog');
    if (!this.#section) return;
    // Dynamic import keeps the rest of this file working if the events module is unavailable.
    import('@shopify/events')
      .then(({ StandardEvents }) => {
        if (!this.isConnected || !this.#section || this.#eventName) return;
        this.#eventName = StandardEvents.productSelect;
        this.#section.addEventListener(this.#eventName, this.#onProductSelect);
      })
      .catch(() => {});
  }

  disconnectedCallback() {
    if (this.#section && this.#eventName) {
      this.#section.removeEventListener(this.#eventName, this.#onProductSelect);
    }
    this.#section = null;
    this.#eventName = '';
  }

  #onProductSelect = (event) => {
    if (!(event.target instanceof Element) || event.target.closest('product-card')) return;
    if (!event.promise) return;

    event.promise
      .then(({ detail } = {}) => {
        const html = detail?.html;
        if (!html || !this.isConnected) return;
        const next = html.querySelector(`dev1-discount-sync[data-block-id="${this.dataset.blockId}"]`);
        if (!next) return;
        this.innerHTML = next.innerHTML;
      })
      .catch(() => {});
  };
}

if (!customElements.get('dev1-discount-sync')) {
  customElements.define('dev1-discount-sync', Dev1DiscountSync);
}
