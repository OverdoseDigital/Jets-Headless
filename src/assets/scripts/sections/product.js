/**
 * Product Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled to the Product template.
 *
 * @namespace product
 */
 import {formatMoney} from '@shopify/theme-currency';
 import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';
 import {register} from '@shopify/theme-sections';
 import {ScrollSnapArrows} from 'scroll-snap-arrows';
 import Flickity from 'flickity';
 import Drift from 'drift-zoom';
 import Pristine from 'pristinejs';

 import 'flickity-imagesloaded';

 import qtySelector from '../components/qty-selector';
 import modelViewerLoader from '../components/model-viewer-loader';
 import mapRanges from '../utils/map-ranges';
 import handleProductOptionsArrows from '../utils/product-options-arrows';
 import handleThumbnailsArrows from '../utils/product-thumbs-arrows';
 import {addToWishList, removeFromWishList, fetchWishlistItems} from '../wishlist';
 import ModalDialog from '../components/modal-dialog';
 import {initialiseReserveInStoreButton, initialiseBookAppointmentButton} from '../components/brauz';
 import customSelectHybrid from '../components/custom-select-hybrid';

 const selectors = {
   addToCart: '[data-add-to-cart]',
   comparePrice: '[data-product-compare-at-price]',
   priceWrapper: '[data-price-wrapper]',
   formElement: '[data-product-form]',
   productJson: '[data-product-json]',
   modelsJson: '[data-product-models-json]',
   slider: '.product__slideshow',
   sliderMediaItems: '.product__slideshow .product__media-item',
   productImageWrapper: '[data-product-image-wrapper]',
   productThumbnailsWrapper: '.product__thumbnails-container',
   productThumbnails: '[data-product-thumbnails]',
   pagerDotsWrapper: '.product__media-pager-dots',
   productPrice: '[data-product-price]',
   storeAvailabilityContainer: '[data-store-availability-container]',
   decrementQtyBtn: '[data-decrement-qty]',
   incrementQtyBtn: '[data-increment-qty]',
   qtyInput: '[data-qty-input]',
   addToWishlist: '[data-trigger-wishlist-modal]',
   productOptions: '[data-product-options]',
   storeStateLocator: '[data-store-location-state]',
   reserveInStore: '[data-reserve-in-store]',
   bookAppointment: '[data-book-appointment]',
   sizeFitIndicator: '[data-size-fit]',
   stickyProductForm: '.btn-container--fixed'
 };

 const cssClasses = {
   hide: 'hide',
   onsale: 'product__price--on-sale',
   hidden: 'hidden',
 };

 /**
  * Product section constructor. Runs on page load as well as Theme Editor
  * `section:load` events.
  * @param {string} container - selector for the section container DOM element
  */
 export default register('product', {
   /**
    * @method onLoad()
    */
   onLoad() {
     // Register the product form using @shopify/theme-product-form
     const formElement = this.container.querySelector(selectors.formElement);
     const productJSON = window.productJSON || {};
     const options = {
       onOptionChange: this.onOptionChange.bind(this),
       onFormSubmit: this.onFormSubmit.bind(this),
       // theme-product-form requires callbacks to be passed
       // for all four form events.
       onQuantityChange: () => true,
       onPropertyChange: () => true,
     };
     const productId = this.container.dataset.productId;
     const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
     this.isDesktop = desktopQuery.matches;

     const desktopQueryCallback = () => {
       this.handleResize();
     };

     // Check for `addEventListener` is required to support iOS and Safari <14.
     if (typeof desktopQuery?.addEventListener === 'function') {
       desktopQuery.addEventListener('change', desktopQueryCallback.bind(this));
     } else {
       desktopQuery.addListener(desktopQueryCallback.bind(this));
     }

     this.productForm = new ProductForm(formElement, productJSON, options);

     // If URL contains ?variant= param, get the selected variant ID
     const selectedVariant = this.container.dataset.selectedVariant;

     const mediaItems = this.container.querySelectorAll(selectors.sliderMediaItems);

     // Parse the settings string passed through from liquid
     const displayPickupAvailabilities = this.container.dataset.displayPickupAvailabilities;
     this.displayPickupAvailabilities = JSON.parse(displayPickupAvailabilities);
     const stockAvailabilityThreshold = this.container.dataset.stockAvailabilityThreshold;
     this.stockAvailabilityThreshold = JSON.parse(stockAvailabilityThreshold);

     if (this.displayPickupAvailabilities) {
       this.storeAvailability = new theme.StoreAvailability(
         this.container.querySelector(selectors.storeAvailabilityContainer),
         this.handleStoreLocationChange.bind(this)
       );
       this.storeAvailability.updateContent(selectedVariant);
     }

     this.setMediaHeightVars();

     if (mediaItems) {
       this.handleMediaPopup(mediaItems);
     }

     // Look for a product image slideshow.
     this.slideShow = this.container.querySelector(selectors.slider);
     if (this.slideShow) {
       const container = this.container;
       const slideshow = this.slideShow;
       const sliderThumbnails = this.container.querySelector(selectors.productThumbnails);
       const indicatorsWrapper = container.querySelector(selectors.pagerDotsWrapper);

       // Init pager dots for slider
       this.mobileMediaGallery(slideshow, indicatorsWrapper, mediaItems);

       if (sliderThumbnails) {
         this.thumbnailGallery(slideshow, sliderThumbnails, mediaItems);
         handleThumbnailsArrows(sliderThumbnails);
       }

       const modelViewers = this.slideShow.querySelectorAll('model-viewer');
       if (modelViewers.length > 0) {
         const modelViewerVersion = modelViewers[0].dataset.version;
         const modelsData = container.querySelector(selectors.modelsJson)?.textContent;
         if (modelViewerVersion && modelsData) {
           const modelsDataJson = JSON.parse(modelsData);
           modelViewerLoader(modelViewerVersion, modelsDataJson)
             .then(() => null)
             .catch(() => null);
         }

         // Stop slider drag events from impacting 3D model interaction
         const modelStopPropagation = (event) => event.stopPropagation();
         modelViewers.forEach((modelViewer) => {
           modelViewer.addEventListener('mousedown', modelStopPropagation);
           modelViewer.addEventListener('touchstart', modelStopPropagation);
           modelViewer.addEventListener('pointerdown', modelStopPropagation);
         });
       }
     }

     const productHighlights = this.container.querySelector('.product-highlights__highlights--slider');

     if (productHighlights) {
       // eslint-disable-next-line no-new
       new Flickity(productHighlights, {
         // options
         draggable: '>3',
         prevNextButtons: true,
         pageDots: false,
         cellAlign: 'left',
         imagesLoaded: true,
         wrapAround: false,
         freeScroll: false,
         contain: true,
         groupCells: true,
         watchCSS: true,
         arrowShape:
           'M70.6 94.39A4.91 4.91 0 0 1 67.11 93L24.16 50l43-42.95a4.93 4.93 0 0 1 7 7l-36 36 36 36a4.93 4.93 0 0 1-3.48 8.42Z',
       });
     }

     const mediaPopupSlider = this.container.querySelector('.product__slideshow-zoom');
     this.popupSlider = null;

     if (mediaPopupSlider) {
       this.popupSlider = new Flickity(mediaPopupSlider, {
         draggable: '>1',
         prevNextButtons: true,
         pageDots: true,
         cellAlign: 'center',
         imagesLoaded: true,
         wrapAround: false,
         freeScroll: false,
         contain: true,
         groupCells: false,
         watchCSS: true,
         setGallerySize: false,
         cellSelector: '.product__media-item',
         arrowShape:
           'M70.6 94.39A4.91 4.91 0 0 1 67.11 93L24.16 50l43-42.95a4.93 4.93 0 0 1 7 7l-36 36 36 36a4.93 4.93 0 0 1-3.48 8.42Z',
       });
     }

     const productOptions = this.container.querySelector(selectors.productOptions);
     handleProductOptionsArrows(productOptions);

     qtySelector(
       this.container.querySelector(selectors.decrementQtyBtn),
       this.container.querySelector(selectors.incrementQtyBtn),
       this.container.querySelector(selectors.qtyInput)
     );

     // Handle wishlist add / remove
     this.setWishlistVariant(selectedVariant);

     const addToWishlistBtn = this.container.querySelector('[data-wishlist-add]');

     if (addToWishlistBtn) {
       addToWishlistBtn.addEventListener('click', () => {
         if (this.isCurrentWishlisted) {
           removeFromWishList(this.wishlistProduct);
           addToWishlistBtn.classList.remove('icon-animate');
           this.isCurrentWishlisted = false;
         } else {
           addToWishList(this.wishlistProduct);
           addToWishlistBtn.classList.add('icon-animate');
           this.isCurrentWishlisted = true;
         }
       });
     }

     const payLaterModal = this.container.querySelector(`#modal--pay-later--${productId}`);
     const payLaterTrigger = this.container.querySelectorAll(`[data-pay-later-${productId}-modal-trigger]`);

     if (payLaterModal && payLaterTrigger.length > 0) {
       // eslint-disable-next-line no-unused-vars
       const sizeGuideModal = new ModalDialog(payLaterModal, {
         triggerEl: payLaterTrigger,
         modalId: `pay-later--${productId}`,
       });
     }

     const findInStoreModalEl = this.container.querySelector(`#modal--find-in-store--${productId}`);
     const findInStoreTrigger = this.container.querySelectorAll(`[data-find-in-store-${productId}-modal-trigger]`);

     if (findInStoreModalEl && findInStoreTrigger.length > 0) {
       // eslint-disable-next-line no-unused-vars
       const findInStoreModal = new ModalDialog(findInStoreModalEl, {
         triggerEl: findInStoreTrigger,
         modalId: `find-in-store--${productId}`,
       });
     }

     const sizeGuideModalEl = this.container.querySelector(`#modal--size-guide--${productId}`);
     const sizeGuideTrigger = this.container.querySelectorAll(`[data-size-guide-modal-trigger]`);

     if (sizeGuideModalEl && sizeGuideTrigger.length > 0) {
       // eslint-disable-next-line no-unused-vars
       const findInStoreModal = new ModalDialog(sizeGuideModalEl, {
         triggerEl: sizeGuideTrigger,
         modalId: `size-guide--${productId}`,
       });
     }

     window.addEventListener('DOMContentLoaded', () => {
       initialiseReserveInStoreButton(selectors.reserveInStore, this.container.dataset.selectedVariant);
       initialiseBookAppointmentButton(selectors.bookAppointment);
     });

     // OKENDO Size-Fit
     const fetchOkendoSizeFitData = this.fetchOkendoSizeFitData;
     const sizeFitIndicator = document.querySelector(selectors.sizeFitIndicator);
     if (sizeFitIndicator) {
       const userId = sizeFitIndicator.dataset?.userId;
       if (userId && productId) fetchOkendoSizeFitData(userId, productId, sizeFitIndicator);
     }

     window.theme.setCurrentVariant = this.setCurrentVariant.bind(this);

     this.ensureOnlyOneAddToCartButtonVisible();

     if (this.container.hasAttribute('data-gift-card')) {
       const giftCardForm = this.container.querySelector(selectors.formElement);
       this.initFormValidation(giftCardForm);
     }

    const stickyProductForm = document.querySelector(selectors.stickyProductForm);
    if (stickyProductForm) {
      const stickyFormOptionSelectors = Array.from(stickyProductForm.querySelectorAll('input[type="radio"]'));
      stickyFormOptionSelectors.forEach(optionSelector => optionSelector.addEventListener('change', (event) => {
        const index = event.target.dataset.index
        const matchingInput = this.container.querySelector(`[name^="options"][data-index="${index}"][value="${event.target.value}"]`)
        if (!matchingInput) return;
        matchingInput.checked = true
        matchingInput.dispatchEvent(new Event('change'))
      }))
    }

    const recentProducts = JSON.parse(localStorage.getItem('ss_recently_viewed_products')) || [];
    recentProducts.push(productId)
    localStorage.setItem('ss_recently_viewed_products', JSON.stringify(recentProducts))
   },

   initFormValidation(form) {
     const config = {
       classTo: 'form__group',
       errorClass: 'has-error',
       errorTextParent: 'form__group',
       errorTextTag: 'p',
       errorTextClass: 'form__field-error',
     };

     // create the pristine instance
     this.pristine = new Pristine(form, config, true);
   },

   handleMediaPopup(mediaItems) {
     mediaItems.forEach((item) => {
       item.addEventListener('click', () => {
         if (!this.isDesktop) return;
         const mediaIndex = Number(item.dataset.slideIndex);
         document.body.classList.add('media-popup-active');
         this.popupSlider.select(mediaIndex, false, true);
       });
     });

     const exitFullScreenBtn = this.container.querySelector('[data-media-exit-fullscreen]');
     if (exitFullScreenBtn) {
       exitFullScreenBtn.addEventListener('click', () => {
         document.body.classList.remove('media-popup-active');
       });
     }

     if (!this.isDesktop) return;
     const sliderImages = this.container.querySelectorAll(
       '.product__slideshow [data-product-image-wrapper] .component-image__image'
     );
     sliderImages.forEach((item) => {
       // eslint-disable-next-line no-new
       new Drift(item, {
         paneContainer: this.container.querySelector('.product__zoom-detail'),
         containInline: false,
         handleTouch: false,
         inlinePane: false,
       });
     });
   },

   setMediaHeightVars() {
     window.requestAnimationFrame(() => {
       const mediaEl = this.container.querySelector('.product__slideshow');
       if (mediaEl) {
         const mediaHeight = mediaEl.offsetHeight;
         document.documentElement.style.setProperty('--media-height', `${mediaHeight}px`);
       }
       const detailPanel = this.container.querySelector('.product__details');
       if (detailPanel) {
         const detailPanelHeight = detailPanel.offsetWidth;
         document.documentElement.style.setProperty('--product-details-width', `${detailPanelHeight}px`);
       }
     });
   },

   handleResize(mediaItems) {
     this.setMediaHeightVars();
     window.requestAnimationFrame(() => {
       const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
       this.isDesktop = desktopQuery.matches;
       document.body.classList.remove('media-popup-active');
       if (mediaItems) {
         this.handleMediaPopup(mediaItems);
       }
     });
   },

   /**
    * @method mobileMediaGallery
    */
   mobileMediaGallery(slideshow, indicatorsWrapper, mediaItems) {
     let currentIndex = 0;
     const pagerDots = indicatorsWrapper.querySelectorAll('.product__media-pager-dot');

     const updatePagerButtonStates = () => {
       pagerDots.forEach((button) => {
         if (Number(button.dataset.pagerIndex) === currentIndex) {
           button.classList.add('is-active');
         } else {
           button.classList.remove('is-active');
         }
       });
     };

     indicatorsWrapper.addEventListener('click', (evt) => {
       if (!evt.target.classList.contains('product__media-pager-dot')) return;
       const targetIndex = Number(evt.target.dataset.pagerIndex);
       const targetSlide = [...mediaItems].filter((item) => Number(item.dataset.slideIndex) === targetIndex)[0];
       const targetSlideOffset = targetSlide.offsetLeft;
       slideshow.scrollLeft = targetSlideOffset;
     });

     const observer = new IntersectionObserver(
       (entries) => {
         // find the entry with the largest intersection ratio
         const activated = entries.reduce((max, entry) =>
           entry.intersectionRatio > max.intersectionRatio ? entry : max
         );
         if (activated.intersectionRatio > 0) {
           currentIndex = elementIndices[activated.target.dataset.slideIndex];
           updatePagerButtonStates(currentIndex);
         }
       },
       {
         root: slideshow,
         threshold: 0.5,
       }
     );
     const elementIndices = {};

     mediaItems.forEach((item, index) => {
       elementIndices[mediaItems[index].dataset.slideIndex] = index;
       observer.observe(mediaItems[index]);
     });

     // eslint-disable-next-line no-new
     new ScrollSnapArrows(slideshow);
   },

   /**
    * @method thumbnailGallery
    */
   thumbnailGallery(slideshow, thumbsWrapper, mediaItems) {
     thumbsWrapper.addEventListener('click', (evt) => {
       evt.stopPropagation();
       if (!evt.target.closest('button').classList.contains('product__media-thumbnail')) return;
       const targetIndex = Number(evt.target.closest('button').dataset.imageIndex);
       const targetSlide = [...mediaItems].filter((item) => Number(item.dataset.slideIndex) === targetIndex)[0];
       const targetSlideOffset = targetSlide.offsetLeft;
       slideshow.scrollLeft = targetSlideOffset;
     });
   },

   /**
    * @method ensureOnlyOneAddToCartButtonVisible - uses an intersection observer
    * to hide the sticky button when the inline button is on the page.
    *
    * @return void
    */
   ensureOnlyOneAddToCartButtonVisible() {
     const [inlineAddToCart, stickyAddToCart] = Array.from(this.container.querySelectorAll(selectors.addToCart)).map(
       (el) => el.parentElement
     );

     const stickyWrapper = stickyAddToCart.parentElement;

     const observer = new IntersectionObserver(
       ([{isIntersecting}]) => {
         if (isIntersecting) {
          stickyWrapper.classList.add('btn-container--add-to-cart-hidden');
         } else {
          stickyWrapper.classList.remove('btn-container--add-to-cart-hidden');
         }
       },
       {rootMargin: '-130px 0px -80px 0px'}
     );

     observer.observe(inlineAddToCart);
   },

   /**
   * @method selectMatchingStickySelector - Selects a matching option select on sticky product form when option selected on main form selectors
   */
    selectMatchingStickySelector(variant) {
      const stickyProductForm = document.querySelector(selectors.stickyProductForm);
      if (!stickyProductForm) return
      const optionNumbers = [1, 2, 3];
      optionNumbers.forEach((number) => {
        const optionNumber = stickyProductForm.querySelectorAll(`[data-index="option${number}"]`);
        optionNumber.forEach((radio) => {
          const variantIdMatchesValue = variant[`option${number}`] === radio.value;
          radio.classList.remove('checked')
          radio.checked = variant[`option${number}`] === radio.value;
          if (variantIdMatchesValue) {
            radio.classList.add('checked')
          }
        });
      });
    },

    /**
     * @method stickyFormReset - Replicates the form reset that occurs after add to cart in onFormSubmit
     */
    stickyFormReset() {
      const stickyProductForm = document.querySelector(selectors.stickyProductForm);
      if (!stickyProductForm) return
      const optionSelectors = stickyProductForm.querySelectorAll('input[type="radio"]');
      optionSelectors.forEach( optionSelector => {
        optionSelector.classList.remove('checked')
      })
    },

   /**
    * @property isCurrentWishlisted
    */
   isCurrentWishlisted: false,

   /**
    * @property wishlistProduct
    */
   wishlistProduct: {
     // will be updated during variant selection
     epi: null,
     du: `${window.location.origin}/products/${window.productJSON.handle}`,
     empi: window.productJSON.id,
     pr: window.productJSON.price,
     iu: window.productJSON.featured_image,
   },

   /**
    * @method setWishlistVariant(currentVariantId)
    */
   setWishlistVariant(currentVariantId) {
     const addToWishlistBtn = this.container.querySelector('[data-wishlist-add]');

     fetchWishlistItems()
       .then((currentWishlistItems) => {
         this.isCurrentWishlisted = currentWishlistItems.some((item) => Number(item.epi) === Number(currentVariantId));

         if (addToWishlistBtn) {
           if (this.isCurrentWishlisted) {
             addToWishlistBtn.classList.add('icon-animate');
           } else {
             addToWishlistBtn.classList.remove('icon-animate');
           }
         }

         return true;
       })
       .catch((error) => {
         window.console.log(error);
       });

     this.wishlistProduct.epi = currentVariantId;
   },

   /**
    * @method handleStoreLocationChange
    */
   handleStoreLocationChange(evt) {
     if (evt.target !== this.container.querySelector(selectors.storeStateLocator)) return;
     const storeAddresses = this.container.querySelectorAll('.store-availability-list__item');
     const noStoresMessage = this.container.querySelector('.store-availability-list__item--no-results');
     const matchingStores = this.container.querySelectorAll(
       `.store-availabilities-list [data-state="${evt.target.value}"]`
     );
     storeAddresses.forEach((address) => {
       if (address.dataset.state === evt.target.value) {
         address.classList.remove('hidden');
       } else {
         address.classList.add('hidden');
       }
     });
     if (matchingStores.length > 0) {
       noStoresMessage.classList.add('hidden');
     } else {
       noStoresMessage.classList.remove('hidden');
     }
   },

   /**
    * @method handleStoreLocationChange - Event callback for option/variant switch event
    */
  onOptionChange(evt) {
    const variant = evt.dataset.variant;
     this.changeVariant(variant);
   },

   /**
    * @method changeVariant
    */
   changeVariant(variant) {
     /* eslint-disable no-negated-condition */
     if (!variant) {
       // The combination of selected options does not have a matching variant
       this.updateAddToCartState(null);
       this.updateProductPrices(false);
       this.updateStockLevelsIndicator(false);
       this.updateOptions(null);
       this.container.dataset.selectedVariant = null;
     } else if (!variant.available) {
       // The combination of selected options has a matching variant but it is
       // currently unavailable
       this.updateAddToCartState(false);
       this.updateProductPrices(true, variant.price, variant.compare_at_price);
       this.updateStockLevelsIndicator(variant.id);
       this.setWishlistVariant(variant.id);
       this.updateOptions(variant);
       const url = getUrlWithVariant(window.location.href, variant.id);
       window.history.replaceState({path: url}, '', url);
       this.container.dataset.selectedVariant = null;
     } else {
       // The combination of selected options has a matching variant and it is
       // available
       this.updateAddToCartState(true);
       this.updateProductPrices(true, variant.price, variant.compare_at_price);
       this.setWishlistVariant(variant.id);
       this.updateOptions(variant);
       this.selectMatchingStickySelector(variant)
       const url = getUrlWithVariant(window.location.href, variant.id);
       window.history.replaceState({path: url}, '', url);
       this.container.dataset.selectedVariant = variant.id;
       this.updateStockLevelsIndicator(variant.id);
       if (this.displayPickupAvailabilities) {
         this.storeAvailability.updateContent(variant.id);
       }
     }
     /* eslint-enable no-negated-condition */
   },

   /**
    * @method setCurrentVariant
    */
   setCurrentVariant(variantId) {
     if (!variantId) return;
     const variantIdInt = Number(variantId);
     const matchingVariant = this.productForm.product.variants.find((variant) => variant.id === variantIdInt);
     if (!matchingVariant) return;
     this.changeVariant(matchingVariant);
   },

   /**
    * @method updateOptions
    */
   updateOptions(variant) {
     if (!variant) return;
     const optionNumbers = [1, 2, 3];
     optionNumbers.forEach((number) => {
       const optionNumber = this.container.querySelectorAll(`[data-index="option${number}"]`);
       optionNumber.forEach((radio) => {
         radio.checked = variant[`option${number}`] === radio.value;
       });
     });
   },

   /**
    * @method onUnload - Event callback for Theme Editor `section:unload` event
    */
   onUnload() {
     this.productForm.destroy();
     delete window.theme.setCurrentVariant;
   },

   /**
    * @method onFormSubmit - Event callback for product form submit event
    */
   async onFormSubmit(evt) {
     evt.preventDefault();
     if (this.pristine) {
      const valid = this.pristine.validate();
      if (!valid) return;
     }
     const variant = evt.dataset.variant;
     const quantity = evt.dataset.quantity;
     let properties = {};
     if (evt.dataset.properties !== null) {
       properties = evt.dataset.properties;
     }
     const comparePrice = Number(evt.dataset.variant.compare_at_price);
     Object.assign(properties, {_compare_price: comparePrice});
     if (variant && variant.id && quantity) {
       const item = {
         id: variant.id,
         quantity,
         properties,
       };
       try {
         await window.sideCart.handleAddToCartEvent(item, true);
         evt.target.reset();
         this.stickyFormReset();
       } catch (err) {
         window.console.error(err);
       }
     }
   },

   /**
    * @method updateAddToCartState - Updates the DOM state of the add to cart button
    *
    * @param {boolean} enabledState - True is enabled. False is disabled. Null is disabled without prices.
    * @param {string} priceWrapper - DOM selector for prices container div
    * @param {string} button - DOM selector for add to cart button
    */
   updateAddToCartState(enabledState) {
     const addToCartBtns = this.container.querySelectorAll(selectors.addToCart);
     const priceWrapper = this.container.querySelector(selectors.priceWrapper);

     switch (enabledState) {
       // Variant is available
       case true: {
         priceWrapper.classList.remove(cssClasses.hide);
         addToCartBtns.forEach((btn) => {
           btn.removeAttribute('disabled');
           btn.textContent = theme.strings.addToCart;
         });
         break;
       }
       // Variant is unavailable
       case false: {
         priceWrapper.classList.remove(cssClasses.hide);
         addToCartBtns.forEach((btn) => {
           btn.setAttribute('disabled', '');
           btn.textContent = theme.strings.soldOut;
         });
         break;
       }
       // No matching variant
       case null: {
         priceWrapper.classList.add(cssClasses.hide);
         addToCartBtns.forEach((btn) => {
           btn.setAttribute('disabled', '');
           btn.textContent = theme.strings.unavailable;
         });
         break;
       }
     }
   },

   /**
    * @method updateProductPrices - Updates the DOM with specified prices
    *
    * @param {boolean} variantExists - Selected options match a valid variant
    * @param {number} price - Selected variant price
    * @param {number} compareAtPrice - Selected variant original price
    * @param {string} productPrice - DOM selector for current price of the product
    * @param {string} comparePrice - DOM selector for original price of the product
    * @param {string} priceWrapper - DOM selector for prices container div
    */
   updateProductPrices(variantExists, price, compareAtPrice) {
     const comparePrice = this.container.querySelector(selectors.comparePrice);
     const productPrice = this.container.querySelector(selectors.productPrice);
     const priceWrapper = this.container.querySelector(selectors.priceWrapper);

     // No matching variant
     if (!variantExists) {
       comparePrice.textContent = '';
       comparePrice.classList.add(cssClasses.hide);
       priceWrapper.classList.remove(cssClasses.onsale);
       return;
     }

     // Variant exists
     productPrice.textContent = formatMoney(price, theme.moneyFormat);

     if (price < compareAtPrice) {
       comparePrice.textContent = formatMoney(compareAtPrice, theme.moneyFormat);
       priceWrapper.classList.add(cssClasses.onsale);
       comparePrice.classList.remove(cssClasses.hide);
     } else {
       comparePrice.textContent = '';
       priceWrapper.classList.remove(cssClasses.onsale);
       comparePrice.classList.add(cssClasses.hide);
     }
   },

   /**
    * @method updateStockLevelsIndicator
    * @param {*} variantId
    * @returns
    */
   updateStockLevelsIndicator(variantId) {
     if (!variantId) return;

     const currentVariant = window.productJSON?.variants?.find((variant) => Number(variant.id) === Number(variantId));
     const stockLevels = window.productJSON?.inventories?.[variantId]?.inventory_quantity;
     const inventoryPolicy = currentVariant.inventory_policy;
     const {inStockLabel, lowStockLabel, outOfStockLabel} = window.theme?.strings?.product;
     const stockLevelsElement = this.container.querySelector('.delivery__indicators-wrapper .product__availability');
     const stockLevelsText = stockLevelsElement?.querySelector('span');

     if (stockLevels <= 0 && inventoryPolicy !== 'continue') {
       stockLevelsElement.setAttribute('class', 'product__availability product__availability--no-stock');
       stockLevelsText.innerHTML = outOfStockLabel;
     } else if (stockLevels < this.stockAvailabilityThreshold && inventoryPolicy !== 'continue') {
       stockLevelsElement.setAttribute('class', 'product__availability product__availability--low-stock');
       stockLevelsText.innerHTML = lowStockLabel;
     } else {
       stockLevelsElement.setAttribute('class', 'product__availability product__availability--in-stock');
       stockLevelsText.innerHTML = inStockLabel;
     }
   },

   /**
    * @method fetchOkendoSizeFitData
    *
    * @param {*} userId
    * @param {*} productId
    * @param {*} sizeFitElement
    */
   async fetchOkendoSizeFitData(userId, productId, sizeFitElement) {
     const indicatorPoint = sizeFitElement.querySelector('.size-fit-indicator__point');
     const labelMin = sizeFitElement.querySelector('.size-fit-indicator__label--min');
     const labelMid = sizeFitElement.querySelector('.size-fit-indicator__label--mid');
     const labelMax = sizeFitElement.querySelector('.size-fit-indicator__label--max');
     const url = `https://api.okendo.io/v1/stores/${userId}/products/shopify-${productId}/review_aggregate`;
     const response = await fetch(url);
     if (response.ok === false) {
       throw new Error(`Could not fetch Okendo data for ${productId}`);
     }
     const data = await response.json();
     const attributeRatings = data.reviewAggregate?.attributeRatings || [];
     const fitRating = attributeRatings.find((rating) => rating.title === 'Fit') || {};
     const {minLabel = 'Runs Small', midLabel = 'True to size', maxLabel = 'Runs Large', value = 0} = fitRating;

     const percentageValue = mapRanges(value, -1, 1, 0, 100);

     labelMin.innerHTML = minLabel;
     labelMid.innerHTML = midLabel;
     labelMax.innerHTML = maxLabel;
     indicatorPoint.style.left = `${percentageValue}%`;
   },
 });

 /*
    Add global theme.StoreAvailability method.
  */
 theme.StoreAvailability = (function () {
   const Selectors = {
     storeAvailabilityMore: '[store-availability-more]',
     storeAvailabilityMoreOpenTrigger: '[data-store-availability-more-open]',
     storeAvailabilityMoreProductTitle: '[data-store-availability-more-product-title]',
     storeAvailabilityMoreVariantTitle: '[data-store-availability-more-variant-title]',
   };

   const classes = {
     hidden: 'hide',
   };

   function StoreAvailability(container, handleLocationChange) {
     this.container = container;
     this.productTitle = this.container.dataset.productTitle;
     this.hasOnlyDefaultVariant = this.container.dataset.hasOnlyDefaultVariant === 'true';
     this.handleLocationChange = handleLocationChange;
   }
   StoreAvailability.prototype = {
     ...StoreAvailability.prototype,
     updateContent(variantId) {
       const variantSectionUrl = `${this.container.dataset.baseUrl}variants/${variantId}/?section_id=store-availability`;
       const self = this;

       let storeAvailabilityMoreOpenTrigger = document.querySelector(Selectors.storeAvailabilityMoreOpenTrigger);

       this.container.style.opacity = 0.5;
       if (storeAvailabilityMoreOpenTrigger) {
         storeAvailabilityMoreOpenTrigger.disabled = true;
         storeAvailabilityMoreOpenTrigger.setAttribute('aria-busy', true);
       }

       async function fetchStoreAvailabilities(url) {
         const storeAvailabilityHTMLResponse = await fetch(url);
         const storeAvailabilityHTML = await storeAvailabilityHTMLResponse.text();

         if (storeAvailabilityHTML.trim() === '') {
           return;
         }
         self.container.innerHTML = storeAvailabilityHTML;
         self.container.innerHTML = self.container.firstElementChild.innerHTML;
         self.container.style.opacity = 1;

         // Need to query this again because we updated the DOM
         storeAvailabilityMoreOpenTrigger = document.querySelector(Selectors.storeAvailabilityMoreOpenTrigger);
         storeAvailabilityMoreOpenTrigger?.addEventListener('click', () => self._onClickDisplayMorePickupOptions());

         const customSelectHybridsSelectors = self.container.querySelectorAll('.custom-select-hybrid-stores');
         customSelectHybrid(customSelectHybridsSelectors);

         const selectElement = self.container.querySelector(selectors.storeStateLocator);
         if (selectElement) {
           selectElement.addEventListener('change', self.handleLocationChange);
         }

         self._updateProductTitle();
         if (self.hasOnlyDefaultVariant) {
           self._hideVariantTitle();
         }
       }

       fetchStoreAvailabilities(variantSectionUrl);
     },

     clearContent() {
       this.container.innerHTML = '';
     },

     _onClickDisplayMorePickupOptions() {
       const storeAvailabilityMore = this.container.querySelector(Selectors.storeAvailabilityMore);
       if (storeAvailabilityMore && storeAvailabilityMore.classList.contains('store-availabilities-more--active')) {
         storeAvailabilityMore.classList.remove('store-availabilities-more--active');
       } else {
         storeAvailabilityMore.classList.add('store-availabilities-more--active');
       }
     },

     _updateProductTitle() {
       const storeAvailabilityMoreProductTitle = this.container.querySelector(
         Selectors.storeAvailabilityModalProductTitle
       );
       if (storeAvailabilityMoreProductTitle) storeAvailabilityMoreProductTitle.textContent = this.productTitle;
     },

     _hideVariantTitle() {
       const storeAvailabilityMoreVariantTitle = this.container.querySelector(
         Selectors.storeAvailabilityMoreVariantTitle
       );
       if (storeAvailabilityMoreVariantTitle) storeAvailabilityMoreVariantTitle.classList.add(classes.hidden);
     },
   };

   return StoreAvailability;
 })();
