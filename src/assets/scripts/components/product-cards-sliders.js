import Flickity from 'flickity';

import 'flickity-imagesloaded';

import {VAN11Y_TAB_ID_ATTRIBUTE} from '../constants';

import hydrateProductCard, {PRODUCT_CARD_SELECTOR, PRODUCT_CARD_SLIDER_SELECTOR} from './product-card';

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
    const cardCount = slider.querySelectorAll(PRODUCT_CARD_SELECTOR)?.length;
    if (!cardCount) return;
    if (isDesktop && cardCount < 5) {
      slider.classList.add('product-cards-carousel__slider--sub-five');
    }

    hydrateMainSlider(slider, {...options, isDesktop});
    hydrateProductsWithinElement(slider);
  });
};

/**
 * hydrateProductsWithinElement
 * @param {Element} element - element for which to hydrate descendant product cards
 */
const hydrateProductsWithinElement = (element) =>
  element.querySelectorAll(PRODUCT_CARD_SELECTOR).forEach(hydrateProductCard);

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
    pageDots: false,
    imagesLoaded: true,
    setGallerySize: true,
    cellAlign: isDesktop ? 'center' : 'left',
    groupCells: isDesktop ? 3 : false,
    watchCSS: true,
    wrapAround: isDesktop,
    contain: !isDesktop,
  });

/**
 * resizeSliderOnTabChange - finds tabs within the provided container and
 * sliders from the provided query and a listener to resize the sliders when
 * the tab changes.
 *
 * @param {Element}         container             - the container in which to find van11y tabs
 * @param {string|Element}  sliderSelectorOrNode  - selector to find the slider, or the slider node
 */
const resizeSliderOnTabChange = (container, sliderSelectorOrNode) => {
  container.querySelectorAll('.js-tablist__link').forEach((link) => {
    link.addEventListener('click', () => {
      const tabID = link.getAttribute(VAN11Y_TAB_ID_ATTRIBUTE);
      const tab = document.querySelector(`#${tabID}`);

      // Resize and update main flickity slider
      const slider =
        typeof sliderSelectorOrNode === 'string' ? tab.querySelector(sliderSelectorOrNode) : sliderSelectorOrNode;

      if (slider === null) return;
      const flickity = Flickity.data(slider);
      flickity.resize();

      // Resize and update product flickity sliders
      slider.querySelectorAll(PRODUCT_CARD_SLIDER_SELECTOR).forEach((cardSlider) => {
        const flick = Flickity.data(cardSlider);
        flick.resize();
      });
    });
  });
};

export {hydrateProductCardsSliders, hydrateProductsWithinElement, resizeSliderOnTabChange};
