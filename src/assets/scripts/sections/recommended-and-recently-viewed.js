import {register} from '@shopify/theme-sections';

import {hydrateProductCardsSliders, resizeSliderOnTabChange} from '../components/product-cards-sliders';
import {saveAndFetchRecentlyViewed} from '../utils/recently-viewed';
import {placeRecommendationsIntoDOM} from '../utils/recommendations';

const SELECTORS = {
  recommendedResponseWrapper: '.js-recommended-api-response-wrapper',
  recommendationsContainer: '.js-product-recommendations-container',
  reccommendationsSlider: '.js-product-recommendations-slider',
  recentlyViewedSlider: '.js-recently-viewed-slider',
  recentlyViewedTab: '.js-recently-viewed-tab',
  recentlyViewedTabContent: '.js-recently-viewed-tab-content',
};

export default register('recommended-and-recently-viewed', {
  onLoad() {
    productRecommendations(this.container);
    recentlyViewedProducts(this.container);
  },
});

/**
 * Product recommendations - populates product recommendations and initialises the slider.
 *
 * @param {Element} container
 */
async function productRecommendations(container) {
  const targetElement = container.querySelector(SELECTORS.recommendationsContainer);

  const productId = container.dataset.productId;
  const sectionId = container.dataset.sectionId;
  const limit = container.dataset.recommendedLimit;

  await placeRecommendationsIntoDOM({
    productId,
    sectionId,
    limit,
    responseWrapperSelector: SELECTORS.recommendedResponseWrapper,
    targetElement,
  });

  const sliderContainer = container.querySelector(SELECTORS.reccommendationsSlider);
  if (sliderContainer) {
    hydrateProductCardsSliders([sliderContainer]);
    resizeSliderOnTabChange(container, SELECTORS.reccommendationsSlider);
  }
}

/**
 * Recently viewed products - populates recently viewed products and initialises the slider.
 *
 * @param {Element} container
 */
async function recentlyViewedProducts(container) {
  const limit = container.dataset.recentlyViewedLimit;
  const productHandle = container.dataset.productHandle;
  const sliderContainer = container.querySelector(SELECTORS.recentlyViewedSlider);

  const markup = await saveAndFetchRecentlyViewed({
    limit,
    productHandle,
  });

  if (markup && sliderContainer) {
    sliderContainer.innerHTML = markup;

    hydrateProductCardsSliders([sliderContainer]);
    resizeSliderOnTabChange(container, sliderContainer);
  } else {
    container.querySelector(SELECTORS.recentlyViewedTab).classList.add('hide');
    container.querySelector(SELECTORS.recentlyViewedTab).parentElement.classList.add('recently-is-hidden');
    container.querySelector(SELECTORS.recentlyViewedTabContent).classList.add('hide');

    if (window.location.hash === '#recently-viewed') {
      // in case someone lands on recently-viewed link specifically with no recently-viewed items
      const van11yPrefixedMayAlsoLikeId = 'label_may-also-like';
      document.getElementById(van11yPrefixedMayAlsoLikeId).click();
    }
  }
}
