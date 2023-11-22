import {formatMoney} from '@shopify/theme-currency';

const SELECTORS = {
  rewardsContent: '.footer__customer-rewards',
  balance: '.js-rewards-balance-footer',
};

export default function initFooterRewards() {
  injectLoyaltyInformation();

  /**
   * @function injectLoyaltyInformation - fetches loyalty information and places
   * it into the rewards status banner.
   *
   */
  function injectLoyaltyInformation() {
    if (!window.theme.rewards.enabled || !document.querySelector(SELECTORS.balance)) {
      return;
    }

    document.addEventListener('rewardsInfoFetched', () => {
      if(!window.rewardsApi.data.balance) {
        return;
      }
      document.querySelector(SELECTORS.balance).textContent = formatMoney(
        window.rewardsApi.data.balance,
        window.theme.moneyFormatWithoutCurrency
      );
      document.querySelector(SELECTORS.rewardsContent).classList.remove('hide');
    });
  }
}
