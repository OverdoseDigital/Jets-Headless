import {load} from '@shopify/theme-sections';
import '../sections/product';
import '../sections/recommended-and-recently-viewed';
import '../sections/ss-recommendations';
import '../sections/hero-slider';
import '../sections/faq-accordion';
import '../sections/featured-articles';
import '../sections/featured-products';
import '../sections/featured-collections';
import '../sections/featured-media';
import '../sections/featured-images';

document.addEventListener('DOMContentLoaded', () => {
  load('*');
});
