import {register} from '@shopify/theme-sections';

export default register('announcement', {
  onLoad() {
    const container = this.container;
    this.isAnimated = false;
    const isDismissed = sessionStorage.getItem('announcement-dismissed');
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);

    container.classList.remove('is-loading');

    if (isDismissed) {
      container.classList.add('is-hidden');
      this.setAnnoucementHeightVar();
    } else {
      const dismissButton = container.querySelector('[data-announcement-bar-dismiss]');
      if (dismissButton) {
        dismissButton.addEventListener('click', () => {
          sessionStorage.setItem('announcement-dismissed', true);
          container.classList.add('is-hidden');
          this.setAnnoucementHeightVar();
        });
      }

      this.setAnnoucementHeightVar();

      this.handleMarqueeAnimation.apply(this);
    }

    window.addEventListener('resize', this.handleMarqueeAnimation.bind(this));

    const desktopQueryCallback = () => {
      this.handleResize();
    };

    // Check for `addEventListener` is required to support iOS and Safari <14.
    if (typeof desktopQuery?.addEventListener === 'function') {
      desktopQuery.addEventListener('change', desktopQueryCallback.bind(this));
    } else {
      desktopQuery.addListener(desktopQueryCallback.bind(this));
    }
  },

  setAnnoucementHeightVar() {
    window.requestAnimationFrame(() => {
      const announcementHeight = this.container.offsetHeight;
      document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
    });
  },

  handleResize() {
    this.setAnnoucementHeightVar();
  },

  handleMarqueeAnimation() {
    const textWrapper = this.container.querySelector('.announcement__text');
    const textEl = this.container.querySelector('p');
    const textWidth = textEl.scrollWidth;

    if (textWrapper) {
      // Activate marquee when text width is bigger than window width
      if (textWidth + 40 > window.innerWidth) {
        // Check if animation is already activated
        if (!this.isAnimated) {
          const clone = textEl.cloneNode(true);
          textWrapper.appendChild(clone);
          textWrapper.style.width = `${(textWidth + 48) * 2}px`;
          this.container.classList.add('marquee');
          this.isAnimated = true;
        }

        // Check if animation is already deactivated
      } else if (this.isAnimated) {
        textWrapper.removeChild(textWrapper.lastElementChild);
        textWrapper.removeAttribute('style');
        this.container.classList.remove('marquee');
        this.isAnimated = false;
      }
    }
  },
});
