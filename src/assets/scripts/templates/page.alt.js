import {load} from '@shopify/theme-sections';

import '../sections/hero-slider';
import '../sections/collection-icons';
import '../sections/contact';
import '../sections/faq-accordion';
import '../sections/featured-articles';
import '../sections/featured-products';
import '../sections/featured-product-tiles';
import '../sections/featured-collections';
import '../sections/featured-media';
import '../sections/featured-images';
import '../sections/speak-to-a-fit-specialist';
import '../sections/template-careers';
import '../sections/template-gift-card-balance-check';
import '../sections/template-rewards-account';
import '../sections/product-recommendations';
import '../sections/ss-recommendations';

document.addEventListener('DOMContentLoaded', () => {
  load('*');
});
