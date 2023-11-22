import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';

import 'flickity-imagesloaded';

export default register('collection-icons', {
  onLoad() {
    const iconsSlider = this.container.querySelector('.collection__icons-row');

    if (iconsSlider) {
      const isTabletUp = window.matchMedia(`(min-width: ${window.theme.breakpoints.medium}px)`).matches;
      const iconBlockCount = iconsSlider.querySelectorAll('.collection__icons-row-item')?.length;
      let isWrapAround = true;
      if (!iconBlockCount) return;
      if (iconBlockCount < 8) {
        iconsSlider.classList.add('collection__icons-row--sub-eight');
      }
      if (isTabletUp && iconBlockCount < 8) {
        isWrapAround = false;
      }
      // eslint-disable-next-line no-new
      new Flickity(iconsSlider, {
        // options
        draggable: '>1',
        prevNextButtons: true,
        pageDots: false,
        cellAlign: 'center',
        imagesLoaded: true,
        wrapAround: isWrapAround,
        freeScroll: false,
        watchCSS: true,
        contain: true,
        arrowShape:
          'M70.6 94.39A4.91 4.91 0 0 1 67.11 93L24.16 50l43-42.95a4.93 4.93 0 0 1 7 7l-36 36 36 36a4.93 4.93 0 0 1-3.48 8.42Z',
      });
    }
  },
});
