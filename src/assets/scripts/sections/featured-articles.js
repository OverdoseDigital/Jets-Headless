import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';
import 'flickity-imagesloaded';

export default register('featured-articles', {
  onLoad() {
    this.sliderId = `#articles__slider--${this.id}`;
    const thisSlider = document.querySelector(`#articles__slider--${this.id}`);

    // eslint-disable-next-line no-unused-vars
    const flickity = new Flickity(thisSlider, {
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
