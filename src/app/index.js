import React from 'react';
import ReactDOM from 'react-dom';

import {Cart, ShippingTimes} from './components';

const App = () => {
  if (!window.theme.ecommerce) return;
  const rootUrl = window.theme.locale && !window.theme.locale.primary ? window.theme.locale.rootUrl : '';
  const freeShippingBarSettings = {
    enabled: window.theme.freeShippingBar && window.theme.freeShippingBar.enabled,
    remainingTemplate: window.theme.strings.freeShippingBar.remaining,
    reachedTemplate: window.theme.strings.freeShippingBar.reached,
    serviceOne: window.theme.freeShippingBar.serviceOne,
    thresholdOne: Number(window.theme.freeShippingBar.thresholdOne) * 100,
  };
  const giftWithPurchaseDetails = JSON.parse(
    document.querySelector('[data-gift-with-purchase]')?.innerText || '{"gifts": [],"giftsInCart": []}'
  );

  ReactDOM.render(
    <Cart
      rootUrl={rootUrl}
      freeShippingBarSettings={freeShippingBarSettings}
      giftWithPurchaseDetails={giftWithPurchaseDetails}
      isCartPage={false}
    />,
    document.querySelector('#react-cart')
  );

  const cartPageWrapper = document.querySelector('.cart-page-app');
  if (
    (cartPageWrapper && window.location.pathname === '/cart') ||
    (cartPageWrapper && window.location.pathname === '/cart/')
  ) {
    ReactDOM.render(
      <Cart
        rootUrl={rootUrl}
        freeShippingBarSettings={freeShippingBarSettings}
        giftWithPurchaseDetails={giftWithPurchaseDetails}
        isCartPage
      />,
      document.querySelector('#react-cart-page')
    );
  }

  const shippingTimesWrapper = document.querySelector('.shipping-times__wrapper');
  if (shippingTimesWrapper) {
    ReactDOM.render(<ShippingTimes />, document.querySelector('#react-shipping-times'));
  }
};

export default App;
