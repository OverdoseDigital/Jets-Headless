/**
 * Product Modal Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled to the Product template.
 *
 * @namespace product
 */
import {formatMoney} from '@shopify/theme-currency';
import {getUrlWithVariant, ProductForm} from '@shopify/theme-product-form';
import {register} from '@shopify/theme-sections';
import {ScrollSnapArrows} from 'scroll-snap-arrows';

import qtySelector from '../components/qty-selector';
import modelViewerLoader from '../components/model-viewer-loader';
import handleProductOptionsArrows from '../utils/product-options-arrows';

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
  pagerDotsWrapper: '.product__media-pager-dots',
  productPrice: '[data-product-price]',
  storeAvailabilityContainer: '[data-store-availability-container]',
  decrementQtyBtn: '[data-decrement-qty]',
  incrementQtyBtn: '[data-increment-qty]',
  qtyInput: '[data-qty-input]',
  productOptions: '[data-product-options]',
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
export default register('product-modal', {
  /**
   * @method onLoad()
   */
  onLoad() {
    // Register the product form using @shopify/theme-product-form
    const formElement = this.container.querySelector(selectors.formElement);
    const productHandle = formElement.dataset.productHandle;
    const addToCartBtn = this.container.querySelector(selectors.addToCart);
    const productJSON = window.productJSON;
    const options = {
      onOptionChange: this.onOptionChange.bind(this),
      onFormSubmit: this.onFormSubmit.bind(this),
      // theme-product-form requires callbacks to be passed
      // for all four form events.
      onQuantityChange: () => true,
      onPropertyChange: () => true,
    };

    if (productJSON) {
      this.productForm = new ProductForm(formElement, productJSON, options);
      const availableVariants = this.productForm.product.variants?.some((variant) => variant.available);
      if (availableVariants) {
        addToCartBtn.disabled = false;
      }
    } else {
      fetch(`/products/${productHandle}.js`)
        .then((response) => response.json())
        .then((json) => {
          this.productForm = new ProductForm(formElement, json, options);

          const availableVariants = this.productForm.product.variants?.some((variant) => variant.available);
          if (availableVariants) {
            addToCartBtn.disabled = false;
          }
        })
        .catch((err) => console.log(err)); // eslint-disable-line no-console
    }

    const productInventoriesJson = this.container.querySelector('[data-product-inventories-json]');
    if (productInventoriesJson) {
      this.inventories = JSON.parse(productInventoriesJson.innerHTML);
    }

    const mediaItems = this.container.querySelectorAll(selectors.sliderMediaItems);

    // Parse the settings string passed through from liquid
    const stockAvailabilityThreshold = this.container.dataset.stockAvailabilityThreshold;
    this.stockAvailabilityThreshold = JSON.parse(stockAvailabilityThreshold);

    // Look for a product image slideshow.
    this.slideShow = this.container.querySelector(selectors.slider);
    if (this.slideShow) {
      const container = this.container;
      const slideshow = this.slideShow;
      const indicatorsWrapper = container.querySelector(selectors.pagerDotsWrapper);

      // Init pager dots for slider
      this.mobileMediaGallery(slideshow, indicatorsWrapper, mediaItems);

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

    const productOptions = this.container.querySelector(selectors.productOptions);
    handleProductOptionsArrows(productOptions);

    qtySelector(
      this.container.querySelector(selectors.decrementQtyBtn),
      this.container.querySelector(selectors.incrementQtyBtn),
      this.container.querySelector(selectors.qtyInput)
    );

    window.theme.setCurrentVariant = this.setCurrentVariant.bind(this);
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
   * @method handleStoreLocationChange - Event callback for option/variant switch event
   */
  onOptionChange(event) {
    const variant = event.dataset.variant;
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
      this.updateOptions(variant);
      const url = getUrlWithVariant(window.location.href, variant.id);
      window.history.replaceState({path: url}, '', url);
      this.container.dataset.selectedVariant = null;
    } else {
      // The combination of selected options has a matching variant and it is
      // available
      this.updateAddToCartState(true);
      this.updateProductPrices(true, variant.price, variant.compare_at_price);
      this.updateOptions(variant);
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
  async onFormSubmit(event) {
    event.preventDefault();
    const variant = event.dataset.variant;
    const quantity = event.dataset.quantity;
    let properties = {};
    if (event.dataset.properties !== null) {
      properties = event.dataset.properties;
    }
    const comparePrice = Number(event.dataset.variant.compare_at_price);
    Object.assign(properties, {_compare_price: comparePrice});
    if (variant && variant.id && quantity) {
      const item = {
        id: variant.id,
        quantity,
        properties,
      };
      try {
        await window.sideCart.handleAddToCartEvent(item, true);
        event.target.reset();
      } catch (err) {
        window.console.error(err);
      }
    }
    window.dispatchEvent(new Event('quickshop-close-modal'));
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
    const currentVariant = this.productForm.product.variants?.find(
      (variant) => Number(variant.id) === Number(variantId)
    );
    const stockLevels = this.inventories?.[variantId]?.inventory_quantity;
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
});
