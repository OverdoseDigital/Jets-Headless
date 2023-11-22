import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';
import 'flickity-imagesloaded';

export default register('hero-slider', {
  onLoad() {
    this.sliderId = `#hero-slider--${this.id}`;
    const thisSlider = document.querySelector(`#hero-slider--${this.id}`);

    this.userSettings = {
      prevNextButtons: JSON.parse(this.container.dataset.prevNextBtns),
      autoplaySpeed: JSON.parse(this.container.dataset.autoplaySpeed),
      pageDots: JSON.parse(this.container.dataset.pageDots),
      wrapAround: JSON.parse(this.container.dataset.wrapAround),
    };

    this.slider = new Flickity(thisSlider, {
      draggable: '>1',
      prevNextButtons: this.userSettings.prevNextButtons,
      autoPlay: this.userSettings.autoplaySpeed,
      pageDots: this.userSettings.pageDots,
      adaptiveHeight: false,
      watchCSS: true,
      wrapAround: this.userSettings.wrapAround,
      groupCells: true,
      on: {
        ready() {
          thisSlider.classList.add('is-visible');
        },
      },
    });
  },

  onBlockSelect(event) {
    // Only run in the admin theme customizer
    if (!Shopify.designMode) {
      return;
    }

    // Turn off autoplay when slide selected
    if (this.userSettings.autoplaySpeed !== 0) {
      this.slider.pausePlayer();
    }

    // Scroll to selected slide
    const index = Array.from(event.target.parentElement.children).indexOf(event.target);
    this.slider.select(index);
  },

  onDeselect() {
    // Only run in the admin theme customizer
    if (!Shopify.designMode) {
      return;
    }

    // Turn back on autoplay when slider deselected
    if (this.userSettings.autoplaySpeed !== 0) {
      this.slider.unpausePlayer();
    }
  },
});
