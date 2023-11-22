import {register} from '@shopify/theme-sections';

import {openProductModal} from '../components/product-modal';

register('featured-product-tiles', {
  onLoad() {
    const productsInImages = this.container.querySelectorAll('.featured-product-tile__button-wrap');
    productsInImages.forEach((product) => this.productInit(product));
  },

  productInit(container) {
    const quickShopButton = container.querySelector('[data-open-quick-shop]');
    if (quickShopButton) {
      const productHandle = quickShopButton.dataset.openQuickShop;
      quickShopButton.addEventListener('click', () => {
        openProductModal(productHandle);
      });
    }
  },
});
