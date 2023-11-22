const ENDPOINTS = {
  rewardsDetails: window.theme.rewards.detailsEndpoint,
  rewardsDetailsCached: window.theme.rewards.detailsEndpointCached,
  rewardsReserve: window.theme.rewards.reserveEndpoint,
  giftCardBalance: window.theme.giftCard.balanceEndpoint,
  giftCardReserve: window.theme.giftCard.reserveEndpoint,
  giftCardRelease: window.theme.giftCard.releaseEndpoint,
};

/**
 * @object api - contains methods to call each available api endpoint.
 *
 * @method getRewardsDetails
 * @method reserveRewards
 * @method reserveGiftCard
 * @method releaseGiftCard
 */
const api = {
  getRewardsDetails(customerId = window.theme.customerId, storeCountryCode = window.theme.rewards.storeCountryCode) {
    const cached = !(document.location.pathname.includes('/pages/rewards') || document.location.pathname.includes('checkout'));

    if (!customerId) {
      throw new Error(
        'Cannot get rewards balance: customer is not logged in. Developer should handle this expected error case.'
      );
    }

    return callApi({
      url: cached ? ENDPOINTS.rewardsDetailsCached : ENDPOINTS.rewardsDetails,
      body: {
        customerId,
        country: storeCountryCode,
        currency: Shopify.Checkout ? Shopify.Checkout.currency : Shopify.currency.active,
      },
    });
  },
  reserveRewards({
    amount,
    checkoutId = window.theme.checkoutId,
    customerId = window.theme.customerId,
    storeCountryCode = window.theme.rewards.storeCountryCode,
    currency = Shopify.Checkout ? Shopify.Checkout.currency : Shopify.currency.active,
    exchangeRate = window.localStorage.getItem('conversionRate')
      ? window.localStorage.getItem('conversionRate')
      : '1.0',
    cartTotal = `${Number(document.querySelector('.payment-due__price').dataset.checkoutPaymentDueTarget) / 100}`,
  }) {
    return callApi({
      url: ENDPOINTS.rewardsReserve,
      body: {
        rewardAmount: amount,
        checkoutId,
        customerId,
        country: storeCountryCode,
        currency,
        exchangeRate,
        cartTotal,
      },
    });
  },
  giftCardBalance({
    voucherNumber,
    voucherPin,
    currency = Shopify.Checkout ? Shopify.Checkout.currency : Shopify.currency.active,
  }) {
    return callApi({
      url: ENDPOINTS.giftCardBalance,
      body: {
        giftVoucherNumber: voucherNumber,
        giftVoucherPin: voucherPin,
        country: window.theme.giftCard.storeCountryCode,
        currency,
      },
    });
  },
  reserveGiftCard({
    voucherNumber,
    voucherPin,
    checkoutId = window.theme.checkoutId,
    currency = Shopify.Checkout ? Shopify.Checkout.currency : Shopify.currency.active,
    exchangeRate = window.localStorage.getItem('conversionRate')
      ? window.localStorage.getItem('conversionRate')
      : '1.0',
  }) {
    return callApi({
      url: ENDPOINTS.giftCardReserve,
      body: {
        giftVoucherNumber: voucherNumber,
        giftVoucherPin: voucherPin,
        checkoutId,
        country: window.theme.giftCard.storeCountryCode,
        currency,
        exchangeRate,
      },
    });
  },
  releaseGiftCard({
    amount,
    lastFourDigits,
    checkoutId = window.theme.checkoutId,
    currency = Shopify.Checkout ? Shopify.Checkout.currency : Shopify.currency.active,
  }) {
    return callApi({
      url: ENDPOINTS.giftCardRelease,
      body: {
        checkoutId,
        lastFourDigits,
        amount,
        country: window.theme.giftCard.storeCountryCode,
        currency,
      },
    });
  },
};

/**
 * @function callApi - Generic Seafolly API caller
 *
 * @param {string} url
 * @param {string} method
 * @param {*}      body
 *
 * @returns {Promise<object>} - response data as an object.
 */
const callApi = async ({url, method = 'POST', body}) => {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response) {
    throw new Error('An error occured');
  }

  const {status, data} = await response.json();

  if (status !== 'success') {
    if (url === ENDPOINTS.rewardsDetails || url === ENDPOINTS.rewardsDetailsCached) {
      document.dispatchEvent(new Event('rewardsInfoFetchError', {error: status}));
    }
    throw new Error(data);
  }

  if (url === ENDPOINTS.rewardsDetails || url === ENDPOINTS.rewardsDetailsCached) {
    getRewardsStuff(data);
  }

  return data;
};

const getRewardsStuff = (data) => {
  const {
    rewardAccountDetails: {rewardBalance, rewards, ...properties},
  } = data;

  const {remainingValue, expiryDate} = findNextExpiringReward(rewards) || {};
  const cleanData = {
    ...properties,
    balance: rewardBalance,
    nextExpiringValue: remainingValue,
    expiryDateString: expiryDate,
    rewards: rewards || [],
  };
  window.rewardsApi = window.rewardsApi || {};
  window.rewardsApi.data = cleanData;

  document.dispatchEvent(new Event('rewardsInfoFetched'));
};

function findNextExpiringReward(rewards) {
  if(!rewards) {
    return;
  }
  return rewards.sort((a, b) => a.expiryDate - b.expiryDate).find(({remainingValue}) => remainingValue !== '00.00');
}

export default api;
