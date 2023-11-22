import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';
import 'flickity-imagesloaded';

export default register('featured-media', {
  onLoad() {
    this.sliderId = `#featured-media__slider--${this.id}`;
    const thisSlider = document.querySelector(`#featured-media__slider--${this.id}`);

    // eslint-disable-next-line no-unused-vars
    const flickity = new Flickity(thisSlider, {
      // options
      freeScroll: false,
      prevNextButtons: false,
      pageDots: false,
      cellAlign: 'left',
      watchCSS: true,
    });
  },
});
