import {formatMoney} from '@shopify/theme-currency';

/**
 * Initialises an element to make it open the brauz reserve in
 * store popup on click. For use on the PDP.
 *
 * @param {string}        selector                  - a selector that uniquely finds the reserveInStore button to initialise.
 *                                                    the target button must also have the [data-brauz-id] attribute which is
 *                                                    the brauz app id.
 * @param {number|string} currentlySelectedVariant  - currently selected variant on the PDP page.
 */
function initialiseReserveInStoreButton(selector, currentlySelectedVariant) {
  const [reserveInStoreButton, appId] = readinessCheck(selector);
  if (!reserveInStoreButton) {
    return;
  }

  window.Brauz.initializeBrauzReserveInStore(appId);
  reserveInStoreButton.addEventListener('click', () => {
    const currentSelectedVariantId = Number(currentlySelectedVariant);
    if (currentSelectedVariantId) {
      const variantObject = window.productJSON.variants.find((variant) => variant.id === currentSelectedVariantId);
      const {price, sku, name, title} = variantObject;
      const formattedPrice = formatMoney(price, '{{amount}}');

      window.Brauz_config = {
        reserve_in_store: {
          product: {
            product_sku: sku,
            product_name: name,
            brand_name: window.productJSON?.vendor || '',
            image_url: window.productJSON?.featured_image,
            selected_attributes: [
              {
                type: 'Size',
                value: title,
              },
            ],
            product_price: formattedPrice,
            qty: 1,
            product_url: window.location.href,
          },
        },
      };

      if (window.theme.customer) {
        window.Brauz_reserve_in_store_customer_data = {
          first_name: window.theme.customer.name,
          last_name: window.theme.customer.surname,
          email: window.theme.customer.email,
          phone: window.theme.customer.phone,
        };
      }

      window.Brauz_open_reserve_in_store_dialog();
    }
  });
}

/**
 * Initialises an element to make it open the brauz appointment
 * booking popup on click. Can be used anywhere on the site.
 *
 * @param {string}        selector                  - a selector that uniquely finds the reserveInStore button to initialise.
 *                                                    the target button must also have the [data-brauz-id] attribute which is
 *                                                    the brauz app id.
 */
function initialiseBookAppointmentButton(selector) {
  const [bookAppointmentBtn, appId] = readinessCheck(selector);
  if (!bookAppointmentBtn) {
    return;
  }

  window.Brauz.initializeBrauzBookAStylist(appId);
  bookAppointmentBtn.addEventListener('click', () => {
    if (window.theme.customer) {
      window.Brauz_reserve_in_store_customer_data = {
        first_name: window.theme.customer.name,
        last_name: window.theme.customer.surname,
        email: window.theme.customer.email,
        phone: window.theme.customer.phone,
      };
    }

    window.Brauz_open_book_a_stylist_dialog();
  });
}

/**
 * Determines whether the provided selector successfully selects an element and
 * whether brauz is configured.
 *
 * @param {string} selector
 *
 * @returns {[element, string]|[false]} - [false] if not ready, the element and the brauzId if ready.
 */
function readinessCheck(selector) {
  const targetElement = document.querySelector(selector);

  if (!targetElement) {
    return [false];
  }

  if (!targetElement.dataset.brauzId) {
    window.console.error("Could not find BRAUZ ID. Make sure it's specified in theme settings.");
    return [false];
  }

  return [targetElement, targetElement.dataset.brauzId];
}

export {initialiseReserveInStoreButton, initialiseBookAppointmentButton};
