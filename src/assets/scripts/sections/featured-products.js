import {register} from '@shopify/theme-sections';
import Flickity from 'flickity';

import 'flickity-imagesloaded';
import ProductCard from '../components/product-card';

export default register('featured-products', {
  onLoad() {
    this.sliderId = `#featured-products__slider--${this.id}`;
    const thisSlider = document.querySelector(`#featured-products__slider--${this.id}`);
    const productCards = thisSlider.querySelectorAll('.product-card');
    if (productCards.length > 0) {
      productCards.forEach((product) => ProductCard(product));
    }
    // eslint-disable-next-line no-unused-vars
    const flickity = new Flickity(thisSlider, {
      // options
      freeScroll: false,
      prevNextButtons: false,
      pageDots: false,
      imagesLoaded: true,
      setGallerySize: true,
      cellAlign: 'left',
      watchCSS: true,
    });
  },
});
