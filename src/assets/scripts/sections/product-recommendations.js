import {register} from '@shopify/theme-sections';

import {hydrateProductCardsSliders, hydrateProductsWithinElement} from '../components/product-cards-sliders';
import { placeRecommendationsIntoDOM } from "../utils/recommendations"

const SELECTORS = {
  recommendedResponseWrapper: '.js-product-recommendations__wrapper',
  recommendationsSlider: '.js-product-recommendations__slider',
  recommendationsGrid: '.js-product-recommendations__grid',
}

export default register('product-recommendations', {
  async onLoad() {
    const container = this.container;
    const limit = container.dataset.limit;
    const productId = container.dataset.productId;
    const sectionId = container.dataset.sectionId;

    const result = await placeRecommendationsIntoDOM({
      productId,
      sectionId,
      limit,
      responseWrapperSelector: SELECTORS.recommendedResponseWrapper,
      targetElement: container,
    })

    if (result) {
      const sliderContainer = container.querySelector(SELECTORS.recommendationsSlider);
      const sliderGrid = container.querySelector(SELECTORS.recommendationsGrid);

      if (sliderContainer) {
        hydrateProductCardsSliders([sliderContainer]);
      } else if (sliderGrid) {
        hydrateProductsWithinElement(sliderGrid)
      }
    }
  },
});
