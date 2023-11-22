import {load} from '@shopify/theme-sections';

import '../sections/hero-slider';
import '../sections/collection-icons';
import '../sections/featured-articles';
import '../sections/featured-products';
import '../sections/featured-product-tiles';
import '../sections/featured-collections';
import '../sections/featured-media';
import '../sections/featured-images';
import '../sections/ss-recommendations';

document.addEventListener('DOMContentLoaded', () => {
  load('*');
});
