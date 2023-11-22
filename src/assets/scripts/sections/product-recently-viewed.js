import {register} from '@shopify/theme-sections';

import { saveAndFetchRecentlyViewed } from "../utils/recently-viewed"
import {hydrateProductCardsSliders} from '../components/product-cards-sliders';

const SELECTORS = {
  slider: '.js-recently-viewed__slider',
}

export default register('product-recently-viewed', {
  onLoad() {
   recentlyViewedProducts(this.container)
  },
});

async function recentlyViewedProducts(container) {
  const limit = container.dataset.limit;
  const productHandle = container.dataset.productHandle;
  const sliderContainer = container.querySelector(SELECTORS.slider);

  const markup = await saveAndFetchRecentlyViewed({
    limit,
    productHandle,
  });

  if (markup && sliderContainer) {
    sliderContainer.innerHTML = markup;
    container.classList.remove('hide');

    hydrateProductCardsSliders([sliderContainer]);
  } else {
    container.classList.add('hide');
  }
}
