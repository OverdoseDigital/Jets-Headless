import Flickity from 'flickity';
import 'flickity-imagesloaded';

import {removeFromWishList} from '../wishlist';

import {openProductModal, createSizeModalUI} from './product-sizes-modal';
import {openWishlistModal, createWishlistModalUI} from './wishlist-modal';

export const PRODUCT_CARD_SLIDER_SELECTOR = '.product-card__slider';

function ProductCard(container, isReload) {
  if (container.classList.contains('is-loaded') && !isReload) return;
  container.classList.add('is-loaded');

  const swatches = container.querySelectorAll('.swatch__item');
  const sliderEl = container.querySelector(PRODUCT_CARD_SLIDER_SELECTOR);
  const previousButton = container.querySelector('.btn--control-prev');
  const nextButton = container.querySelector('.btn--control-next');
  const sizesElement = container.querySelector('.product-card__form');
  const wishlistSizesSelect = container.querySelector('[data-wishlist-size-selector]');
  const wishlistSizesSelectCustom = container.querySelector('[data-wishlist-size-selector-custom]');
  const wishlistBtn = container.querySelector('[data-trigger-wishlist-modal]');
  const productColour = container.querySelector('.swatch__item--selected')?.dataset?.colour || null;
  const isWishlistPage = Boolean(container.closest('.wishlist-container'));
  let selectedVariantId = wishlistSizesSelect?.options[wishlistSizesSelect.selectedIndex]?.value;
  let comparePrice = Number(container.dataset.comparePrice);
  const productCardId = container.dataset.productId;

  // Handle colour swatch click
  swatches?.forEach((swatch) => {
    swatch.addEventListener('click', (event) => {
      event.preventDefault();
      if (swatch.matches('.swatch__item--selected')) return;
      const swatchHandle = swatch.dataset.product;
      replaceProduct(event, swatchHandle);
    });
  });

  // Handles Wishlist UI
  if (wishlistBtn) {
    // set initial wishlist UI state
    applyButtonWishlistState(wishlistBtn, productCardId);
    // re-update wishlist state whenever wishlisting items fetched.
    document.addEventListener('wishlistItemsFetched', () => applyButtonWishlistState(wishlistBtn, productCardId));

    const {productHandle, productId, productPrice, productTitle} = wishlistBtn.dataset;

    const wishlistProduct = {
      epi: null,
      du: `${window.location.origin}/products/${productHandle}`,
      empi: productId,
      pr: productPrice,
    };

    if (isWishlistPage) {
      const gridWrapper = document.querySelector('.wishlist-container');
      const currentVariant = wishlistBtn.dataset.selectedVariantId;
      const parentElement = wishlistBtn.closest('.wishlist__item');
      const addToCartBtn = wishlistBtn.closest('.wishlist__item').querySelector('.wishlist__addToCart');
      wishlistProduct.epi = currentVariant;
      const comparePriceWishlist = Number(parentElement.querySelector('.product-card').dataset.comparePrice);

      wishlistBtn.addEventListener('click', async () => {
        const response = await removeFromWishList(wishlistProduct);
        if (response.ok === false) throw new Error('Could not remove item from wishlist');

        parentElement.remove();
        gridWrapper.dataset.itemCount = Number(gridWrapper.dataset.itemCount) - 1;
      });

      addToCartBtn.addEventListener('click', async () => {
        const properties = {};
        Object.assign(properties, {_compare_price: comparePriceWishlist});
        const item = {
          id: wishlistProduct.epi,
          quantity: 1,
          properties,
        };
        await window.sideCart.handleAddToCartEvent(item, true, async () => {
          const removeResponse = await removeFromWishList(wishlistProduct);
          if (removeResponse.ok === false) throw new Error('Could not remove item from wishlist');
          addToCartBtn.closest('.wishlist__item').remove();
        });
      });
    } else {
      createWishlistModalUI('#modal--wishlist');
      wishlistBtn.addEventListener('click', () => {
        openWishlistModal(
          productHandle,
          wishlistSizesSelect,
          wishlistSizesSelectCustom,
          productTitle,
          productColour,
          wishlistProduct
        );
      });
    }
  }

  const mediaQueryList = window.matchMedia(`(min-width: ${window?.theme?.breakpoints?.large || 990}px)`);

  if (sliderEl) {
    let initialSliderIndex = 0;
    if (mediaQueryList.matches) {
      initialSliderIndex = 1;
    }

    const slider = new Flickity(sliderEl, {
      cellSelector: '.product-card__slide',
      draggable: false,
      prevNextButtons: false,
      pageDots: false,
      adaptiveHeight: true,
      watchCSS: true,
      wrapAround: true,
      initialIndex: initialSliderIndex,
    });

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', (mq) => {
        if (!mq.matches) {
          slider.select(0);
        }
      });
    }

    // Reset slider to 2nd image on desktop after mouse left & primary image is shown
    sliderEl.addEventListener('mouseleave', () => {
      if (slider.selectedIndex !== 0) return;
      const sliderWrapper = sliderEl.closest('.product-card__image--secondary');
      sliderWrapper.addEventListener('transitionend', () => {
        slider.select(1, true, true);
      });
    });

    previousButton?.addEventListener('click', () => slider.previous());
    nextButton?.addEventListener('click', () => slider.next());

    // re-render flickity when collection layout is switched
    window.addEventListener('collection:layoutChange', () => {
      setTimeout(() => {
        slider.resize();
      }, 500);
    });
  }

  // Handles Product Sizes modal (for mobile)
  createSizeModalUI('#modal--product-sizes');

  const toggleProductSizesModal = container.querySelector('[data-open-product-sizes]');
  if (toggleProductSizesModal) {
    const productHandle = toggleProductSizesModal.dataset.productHandle;
    toggleProductSizesModal.addEventListener('click', () => {
      openProductModal(productHandle, sizesElement);
    });
  }

  // Handles Add to Cart by clicking Size Variant
  if (sizesElement) {
    sizesElement.addEventListener('click', (evt) => {
      const target = evt.target;
      if (wishlistSizesSelect) {
        if (target.matches('.product-card__variant')) {
          evt.preventDefault();
          selectedVariantId = Number(evt.target.dataset.variantId);
          const properties = {};
          comparePrice = Number(evt.target.dataset.variantComparePrice);
          Object.assign(properties, {_compare_price: comparePrice});

          const item = {
            id: selectedVariantId,
            quantity: 1,
            properties,
          };
          window.sideCart.handleAddToCartEvent(item, true);
        }
      }
    });
  }

  /**
   * Function that updates product card with new fetched product
   */
  async function replaceProduct(event, handle) {
    const rootUrl = window.theme.locale?.primary ? '' : window.theme.locale.rootUrl;
    const url = `${rootUrl}/products/${handle}?view=card`;

    const response = await fetch(url);
    if (response.ok) {
      const contentFetched = await response.text();
      const parser = new DOMParser();
      const containerFetched = parser.parseFromString(contentFetched, 'text/html');
      const productCardFetched = containerFetched.querySelector('.product-card');

      const originalSwatches = container.querySelector('.product-stitched__swatches');
      originalSwatches.querySelector('.swatch__item--selected')?.classList.remove('swatch__item--selected');
      event.target.classList.add('swatch__item--selected');
      const originalSwatchesContent = originalSwatches.innerHTML;

      // Swap out most of the product card contents (except swatches)
      container.innerHTML = productCardFetched.innerHTML;
      const newSwatches = container.querySelector('.product-stitched__swatches');
      newSwatches.innerHTML = originalSwatchesContent;

      // update the product card outer element
      container.dataset.selectedVariantId = productCardFetched.dataset.selectedVariantId;
      container.dataset.productId = productCardFetched.dataset.productId;
      container.dataset.productHandle = productCardFetched.dataset.productHandle;
      container.dataset.productPrice = productCardFetched.dataset.productPrice;

      // rehydrate the new DOM
      ProductCard(container, true);
    }
  }
}

/**
 * @function applyButtonWishlistState - compares the wishlistItems according to
 * swym and update the present product cards wishlisting state based on whether
 * it is in the wishlisted items.
 *
 * @param {Element}       wishlistBtn
 * @param {string|number} productCardId
 *
 * @returns void
 */
function applyButtonWishlistState(wishlistBtn, productCardId) {
  const isWishlisted = window.wishlistItems?.some((item) => Number(item.empi) === Number(productCardId));
  if (isWishlisted) {
    wishlistBtn.classList.add('icon-animate');
  } else {
    wishlistBtn.classList.remove('icon-animate');
  }
}

export const PRODUCT_CARD_SELECTOR = '.product-card';

export default ProductCard;
