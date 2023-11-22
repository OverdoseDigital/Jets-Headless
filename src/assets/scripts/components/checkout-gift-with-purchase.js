// eslint-disable-next-line @shopify/strict-component-boundaries
import {checkGifts} from '../../../app/components/cart/gift-with-purchase';

async function updateLineItems(updates) {
  /**
   * Disable to continue button so the customer can't quickly checkout with incorrect
   * quantities of gifts in their cart.
   */
  const continueButton = document.querySelector('#continue_button');
  if (continueButton) {
    continueButton.disabled = 'disabled';
    continueButton.classList.add('btn--disabled');
  }

  const data = {
    updates,
  };
  const url = '/cart/update.js';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  try {
    const response = await fetch(url, options);
    if (response.ok === false) {
      throw new Error('cart/update response was not OK');
    }
    window.location.reload();
  } catch (err) {
    window.console.error(err);
  }
}

async function addLineItems(items) {
  const data = {
    items,
  };
  const url = '/cart/add.js';
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  try {
    const response = await fetch(url, options);
    if (response.ok === false) {
      throw new Error('cart/add response was not OK');
    }
    window.location.reload();
  } catch (err) {
    window.console.error(err);
  }
}

async function initGiftWithPurchase() {
  const url = '/cart?view=gift-with-purchase';
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    const response = await fetch(url, options);
    if (response.ok === false) {
      throw new Error('gift with purchase response was not OK');
    }
    const json = await response.json();
    checkGifts(json, addLineItems, updateLineItems);
  } catch (err) {
    window.console.error(err);
  }
}

document.addEventListener('page:load', initGiftWithPurchase);
document.addEventListener('page:change', initGiftWithPurchase);
