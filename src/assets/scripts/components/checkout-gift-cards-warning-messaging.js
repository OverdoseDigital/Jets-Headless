const selectors = {
  giftCardLineItem: '[data-product-type="Gift Cards"]',
  giftCardTotalLine: '[data-giftcard-success]',
  orderSummarySectionDiscount: '.order-summary__section--discount',
  continueButton: '#continue_button',
};

const {warningMessage} = window.theme.giftCard;

/**
 * If a customer has a gift card product in their cart and applies a previous gift card to the cart
 * we want to disable the continue button and show a warning telling them they can't proceed.
 */

function initGiftCardsWarningMessaging() {
  const cartContainsGiftCard = Boolean(document.querySelector(selectors.giftCardLineItem));
  const cartHasGiftCardApplied = Boolean(document.querySelector(selectors.giftCardTotalLine));

  if (!cartContainsGiftCard || !cartHasGiftCardApplied) return;

  const continueButton = document.querySelector(selectors.continueButton);
  if (continueButton) {
    continueButton.disabled = 'disabled';
    continueButton.classList.add('btn--disabled');
  }

  const orderSummarySectionDiscount = document.querySelector(selectors.orderSummarySectionDiscount);
  if (orderSummarySectionDiscount) {
    orderSummarySectionDiscount.insertAdjacentHTML(
      'beforeend',
      `
      <div class="gift-card-warning">
        ${warningMessage}
      </tr>
      `
    );
  }
}

document.addEventListener('page:load', initGiftCardsWarningMessaging);
document.addEventListener('page:change', initGiftCardsWarningMessaging);
