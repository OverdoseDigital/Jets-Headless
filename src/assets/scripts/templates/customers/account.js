import {formatMoney} from '@shopify/theme-currency';

const SELECTORS = {
  expiry: '.js-rewards-expiry',
  balance: '.js-rewards-balance',
};

document.addEventListener('DOMContentLoaded', () => {
  injectLoyaltyInformation();
});

/**
 * @function injectLoyaltyInformation - fetches loyalty information and places
 * it into the rewards status banner.
 *
 */
function injectLoyaltyInformation() {
  if (!window.theme.rewards.enabled) {
    return;
  }

  document.addEventListener('rewardsInfoFetched', () => {
    const {balance, nextExpiringValue, expiryDateString} = window.rewardsApi.data;

    if(balance) {
      document.querySelector(SELECTORS.balance).textContent = formatMoney(
        balance,
        window.theme.moneyFormatWithoutCurrency
      );
    }

    if (nextExpiringValue && expiryDateString) {
      document.querySelector(SELECTORS.expiry).textContent = `${formatMoney(
        nextExpiringValue,
        window.theme.moneyFormatWithoutCurrency
      )} expires on ${expiryDateString.split('-').reverse().join('/')}`;
    }
  });

  document.addEventListener('rewardsInfoFetchError', () => {
    const expiryEl = document.querySelector(SELECTORS.expiry);

    if (expiryEl) {
      expiryEl.parentNode.parentNode.innerHTML = `<p class="small">${window.theme.rewards.error}</p>`;
    }
  });
}
