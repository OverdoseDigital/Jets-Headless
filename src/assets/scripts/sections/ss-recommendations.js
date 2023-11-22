import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';

import 'flickity-imagesloaded';

const SELECTORS = {
  recommendationsSliders: '.product-cards-carousel__slider',
  productCards: '.product-card',
};

export default register('ss-recommendations', {
  onLoad() {
    /**
     * hydrateProductCardsSliders adds the slider behaviour to the raw slider HTML
     * and the raw products within that.
     *
     * @param {NodeList|array} sliders                - Slider nodes to hydrate
     * @param {object}         options                - options object
     */
    const hydrateProductCardsSliders = (sliders, options) => {
      if (sliders.length === 0) {
        return;
      }
      const isDesktop = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`).matches;

      sliders.forEach((slider) => {
        const cardCount = slider.querySelectorAll(SELECTORS.productCards)?.length;
        if (!cardCount) return;
        if (isDesktop && cardCount < 5) {
          slider.classList.add('product-cards-carousel__slider--sub-five', 'searchspring-slider');
        }

        hydrateMainSlider(slider, {...options, isDesktop});
      });
    };

    /**
     * hydrateMainSlider adds the slider behaviour to the raw slider HTML
     * and the raw products within that.
     *
     * @param {Element}  slider                 - Slider to hydrate
     * @param {object}   options                - options object
     * @param {boolean}  options.productCount   - how many products are contained in this slider?
     */
    const hydrateMainSlider = (slider, {isDesktop}) =>
      new Flickity(slider, {
        // options
        prevNextButtons: true,
        pageDots: isDesktop,
        imagesLoaded: true,
        setGallerySize: true,
        cellAlign: isDesktop ? 'center' : 'left',
        groupCells: isDesktop ? 3 : false,
        watchCSS: true,
        wrapAround: isDesktop,
        contain: !isDesktop,
      });

    window.addEventListener('searchspring.domReady', () => {
      const tabSliders = this.container.querySelectorAll(SELECTORS.recommendationsSliders);

      tabSliders.forEach((sliderContainer) => {
        hydrateProductCardsSliders([sliderContainer]);
      });
    });

    // Adds a desktop query resize event to reinitialise the sliders because the config is different between mobile and desktop
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);

    const desktopQueryCallback = () => {
      const tabSliders = this.container.querySelectorAll(SELECTORS.recommendationsSliders);

      tabSliders.forEach((sliderContainer) => {
        hydrateProductCardsSliders([sliderContainer]);
      });
    };

    // Check for `addEventListener` is required to support iOS and Safari <14.
    if (typeof desktopQuery?.addEventListener === 'function') {
      desktopQuery.addEventListener('change', desktopQueryCallback.bind(this));
    } else {
      desktopQuery.addListener(desktopQueryCallback.bind(this));
    }
  },
});
