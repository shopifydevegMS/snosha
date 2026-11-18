/* ==== dev3-solo-video — video block "Play one video at a time" (blocks/video.liquid) ==== */
/* Rendered (hidden) inside a native <deferred-media> only when the setting is on. It adds two things the
   native player doesn't do: when this video starts — also when it's resumed from its own controls — any
   other opted-in video is paused, and a playing video is paused once it's no longer meaningfully visible
   (scrolled away, or swiped out of a carousel). It never starts playback. */

const DEV3_VISIBLE_RATIO = 0.5;

/** @param {Element} media */
function dev3PauseMedia(media) {
  const playing = [...media.querySelectorAll('video')].some((video) => !video.paused);
  if (!playing) return;
  // DeferredMedia#pauseMedia keeps the component's own play state in sync.
  if (typeof media.pauseMedia === 'function') media.pauseMedia();
  else media.querySelectorAll('video').forEach((video) => video.pause());
}

class Dev3SoloVideo extends HTMLElement {
  /** @type {Element | null} */
  #media = null;
  /** @type {AbortController | null} */
  #abortController = null;
  /** @type {IntersectionObserver | null} */
  #observer = null;

  connectedCallback() {
    this.#media = this.closest('deferred-media');
    if (!this.#media || this.#abortController) return;

    this.#abortController = new AbortController();
    // `play` doesn't bubble: capture on the player also catches the <video> it appends on click.
    this.#media.addEventListener('play', this.#onPlay, { capture: true, signal: this.#abortController.signal });

    this.#observer = new IntersectionObserver(this.#onVisibilityChange, { threshold: [0, DEV3_VISIBLE_RATIO] });
    this.#observer.observe(this.#media);
  }

  disconnectedCallback() {
    this.#abortController?.abort();
    this.#abortController = null;
    this.#observer?.disconnect();
    this.#observer = null;
    this.#media = null;
  }

  #onPlay = () => {
    for (const other of document.querySelectorAll('dev3-solo-video')) {
      const media = other.closest('deferred-media');
      if (media && media !== this.#media) dev3PauseMedia(media);
    }
  };

  /** @param {IntersectionObserverEntry[]} entries */
  #onVisibilityChange = (entries) => {
    const entry = entries[entries.length - 1];
    if (this.#media && entry && entry.intersectionRatio < DEV3_VISIBLE_RATIO) dev3PauseMedia(this.#media);
  };
}

if (!customElements.get('dev3-solo-video')) {
  customElements.define('dev3-solo-video', Dev3SoloVideo);
}
