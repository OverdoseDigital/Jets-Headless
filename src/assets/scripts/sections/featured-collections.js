/* global van11yAccessibleTabPanelAria */
import {register} from '@shopify/theme-sections';

import {hydrateProductCardsSliders, resizeSliderOnTabChange} from '../components/product-cards-sliders';

const SELECTORS = {
  featuredCollectionsSlider: '.js-featured-collections-slider',
  tabs: '.js-tabs',
}

export default register('featured-collections', {
  onLoad() {
    const sliders = this.container.querySelectorAll(SELECTORS.featuredCollectionsSlider);

    hydrateProductCardsSliders(sliders);
    resizeSliderOnTabChange(this.container, SELECTORS.featuredCollectionsSlider);

    // Only run in the admin theme customizer
    if (Shopify.designMode) {
      // Reinitialise tabs after adding/removing blocks
      const tabs = this.container.querySelector(SELECTORS.tabs);

      // Only reinitialise if the tabs exist and tabs JS hasn't already run (it gives the tabs div an id)
      if(tabs && !tabs.id) {
        van11yAccessibleTabPanelAria(this.container);
      }
    }
  }
});
