import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';
import 'flickity-imagesloaded';

const selectors = {
  sliderContainer: '[data-slider-container]',
};

export default register('featured-images', {
  onLoad() {
    const container = this.container;

    const slider = container.querySelector(selectors.sliderContainer);
    if (!slider) return;

    // eslint-disable-next-line no-unused-vars
    const flickity = new Flickity(slider, {
      // options
      contain: true,
      freeScroll: false,
      prevNextButtons: false,
      pageDots: false,
      cellAlign: 'left',
      watchCSS: true,
    });
  },
});
