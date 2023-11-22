/* eslint-disable import/order */
import {load} from '@shopify/theme-sections';
import '../../styles/layouts/theme.scss';
import 'preact/devtools';
import 'lazyvids';
import 'dragscroll';

import getSymbolFromCurrency from 'currency-symbol-map';
import Headroom from 'headroom.js';

import ProductCard from '../components/product-card';
import accordionsInit from '../components/accordions';
import detailsA11y from '../components/details-a11y';
import customSelectHybrid from '../components/custom-select-hybrid';
import fadeInPage from '../components/fader';
import testTouch from '../utils/detect-touch';
import lazyImageLoader from '../utils/lazy-image-loader';
import rteTablesInit from '../utils/rte-tables';
import rteVideosInit from '../utils/rte-videos';
import initProductModal from '../components/product-modal';
import {initTabMenu} from '../components/tab-menu';
import {initWishlist} from '../wishlist';
import fetchRewardsInfo from '../components/fetch-rewards';
import initFooterRewards from '../components/footer-rewards';
import initFourSixtyAdditional from '../utils/foursixty-additional';

import '../components/web-vitals';
import '../sections/announcement';
import '../sections/header';
import '../sections/popup';
import '../sections/exit-intent';
import '../sections/footer';
import '../sections/product-modal';
import 'van11y-accessible-tab-panel-aria';

// Make the currency symbols available on the window (including customer requested overrides)
window.getSymbolFromCurrency = (currency) => getSymbolFromCurrency(currency).replace('S$', '$');

document.addEventListener('DOMContentLoaded', () => {
  load('*');
  // Conditionally loads lazySizes for Safari
  lazyImageLoader();
  accordionsInit();
  detailsA11y();
  fadeInPage();
  initProductModal();
  rteTablesInit();
  rteVideosInit();
  initTabMenu();
  initWishlist();
  fetchRewardsInfo();
  initFooterRewards();
  initFourSixtyAdditional();

  const isTouchEnabled = testTouch();
  if (isTouchEnabled) {
    document.body.classList.add('is-touch-enabled');
  }

  const customSelectHybridsSelectors = document.querySelectorAll('.custom-select-hybrid');
  customSelectHybrid(customSelectHybridsSelectors);

  // Handle visibility of search input for mobile
  const headroomOptions = {
    offset: 100,
  };
  const mobileSearch = document.querySelector('.search__form-wrapper--mobile');
  const headroom = new Headroom(mobileSearch, headroomOptions);
  headroom.init();

  /**
   * Dynamic imports are used to reduce main thread blocking time
   * during page load. Webpack handles code splitting these modules.
   */

  /**
   * Preact App entry point
   */
  import(/* webpackChunkName: 'app' */ '../../../app')
    .then((module) => module.default())
    .catch((error) => window.console.error('Could not load App module', error));
});

if (Shopify.designMode) {
  document.addEventListener('shopify:section:load', () => {
    accordionsInit();
  });
}

function initProductCardsSS(container) {
  const productCards = container.querySelectorAll('.product-card');
  productCards.forEach((product) => ProductCard(product));
}

const searchspringRecommendationsWrapper = document.querySelector('.searchspring-recommendations');
if (searchspringRecommendationsWrapper) {
  window.addEventListener('searchspring.domReady', () => initProductCardsSS(searchspringRecommendationsWrapper));
}
