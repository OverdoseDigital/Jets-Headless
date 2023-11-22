import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {formatMoney} from '@shopify/theme-currency';

import iconClose from '../../../assets/svg/icon-cross.svg';
import iconArrowLeft from '../../../assets/svg/icon-arrow-left.svg';
import iconAfterPay from '../../../assets/svg/icon-afterpay.svg';

import {checkGifts} from './gift-with-purchase';
import CartItem from './cart-item';
import FreeShippingBar from './free-shipping-bar';
import RewardsBalance from './rewards-balance/RewardsBalance';
import TrustIndicators from './trust-indicators';
import CartUpsells from './cart-upsells';
import CartEditItemPopup from './cart-edit-item-popup';

const emptyCart = {
  item_count: 0,
  items: [],
  total_price: 0,
};

const Cart = ({rootUrl, freeShippingBarSettings, giftWithPurchaseDetails, isCartPage}) => {
  const defaultCart = window.theme.cart ? window.theme.cart : emptyCart;

  const [cart, setCart] = useState(defaultCart);
  const [errorMessage, setErrorMessage] = useState(null);

  const [editItem, setEditItem] = useState(null);
  const [editProduct, setEditProduct] = useState(null);

  const itemsCount = cart.item_count;
  const cartItems = cart.items;
  const total = cart.total_price;

  const [giftProducts, setGiftProducts] = useState(null);

  const [upsellProducts, setUpsellProducts] = useState([]);
  const upsellsEnabled = window.theme.cartUpsells ? window.theme.cartUpsells.enabled : false;

  const [showShippingBar, setShowShippingBar] = useState(false);

  const getUpsellProducts = async (items) => {
    const _items = items ? items : cartItems;
    if (_items.length <= 0) {
      return;
    }

    const cartItemsIdArray = _items.map(item => item.product_id)
    const maxProducts = 4;
    const mostExpensiveProduct = _items.reduce((prev, current) =>
      prev.final_price > current.final_price ? prev : current
    );
    const productId = mostExpensiveProduct.id;

    const searchspringStoreID = window.theme.searchspring.storeId;
    const profileTag = window.theme.searchspring.cartRecsProfileTag;

    if (!profileTag) return;

    const recentProducts = JSON.parse(localStorage.getItem('ss_recently_viewed_products')) || [];

    const shopperParameter = window.theme.customerId === '' ? '' : `&shopper=${window.theme.customerId}`;
    const cartParameter = cartItemsIdArray.length ? `&cart=${cartItemsIdArray}` : '';
    const lastViewedParameter = recentProducts.length ? `&lastViewed=${recentProducts.slice(0, 10)}` : ''

    const SSurl = `https://${searchspringStoreID}.a.searchspring.io/boost/${searchspringStoreID}/recommend?product=${productId}&tags=${profileTag}${shopperParameter}${cartParameter}${lastViewedParameter}`;

    const options = {
      headers: {'Content-Type': 'application/json'},
    };
    try {
      const response = await fetch(SSurl, options);
      const json = await response.json();
      const upsellsRecommendations = json[0].results.slice(0, maxProducts);
      setUpsellProducts(upsellsRecommendations);
    } catch (err) {
      window.console.error(err);
    }
  };

  const getGiftcardProducts = (items) => {
    const _items = items ? items : cartItems;
    if (_items.length <= 0) {
      return;
    }
    const hasGiftCardProductItem = _items.some((item) => item.product_type === 'Gift Cards');
    if (hasGiftCardProductItem && freeShippingBarSettings.enabled && cartItems.length > 1) {
      setShowShippingBar(true);
    } else if (!hasGiftCardProductItem && freeShippingBarSettings.enabled && cartItems.length > 0) {
      setShowShippingBar(true);
    } else {
      setShowShippingBar(false);
    }
  };

  const updateCart = (newCart) => {
    window.theme.cart = newCart;
    if (isCartPage) {
      window.dispatchEvent(new Event('cartPageUpdated'));
    } else {
      window.dispatchEvent(new Event('cartDrawerUpdated'));
    }
    // Remove loading class
    document.body.classList.remove('cart-loading');

    setCart(newCart);
    const counters = document.querySelectorAll('[data-items-count]');
    counters.forEach((counter) => {
      counter.innerHTML = newCart.item_count;
      counter.setAttribute('data-items-count', newCart.item_count);
    });

    if (upsellsEnabled) {
      getUpsellProducts(newCart.items);
    }
    const cartToggle = document.querySelector('.header__btn--cart');
    if (cartToggle) {
      if (newCart.item_count > 0) {
        cartToggle.classList.add('icon-animate');
      } else {
        cartToggle.classList.remove('icon-animate');
      }
    }
    getGiftcardProducts(newCart.items);
  };

  const fetchCart = async () => {
    const url = `${rootUrl}/cart.js`;
    const options = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const response = await fetch(url, options);
      if (response.ok === false) {
        throw new Error('Fetch cart response was not OK');
      }
      const json = await response.json();
      return json;
    } catch (err) {
      window.console.error(err);
    }
  };

  /**
   *
   * @typedef {Object} Item
   * @property {number} id - The Shopify variant ID.
   * @property {number} quantity - The quantity to add of this variant.
   * @property {Object.<string, string>} [properties] - Optional line item properties.
   * @property {Object} [variant] - Optional variant.
   */

  /**
   *
   * @param {...Item} items - Array of {@link Item} objects to add to cart.
   */
  const addLineItems = async (items) => {
    // Add loading class
    document.body.classList.add('cart-loading');
    const data = {
      items: [items].flat(),
    };
    const url = `${rootUrl}/cart/add.js`;
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
        const errorResponse = await response.json();
        setErrorMessage(errorResponse.description);
      }
      const cartContents = await fetchCart();
      updateCart(cartContents);
    } catch (err) {
      window.console.error(err);
    }
  };

  const updateLineItems = async (updates) => {
    // Add loading class
    document.body.classList.add('cart-loading');
    const data = {
      updates,
    };
    const url = `${rootUrl}/cart/update.js`;
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
      const cartContents = await response.json();
      updateCart(cartContents);
    } catch (err) {
      window.console.error(err);
    }
  };

  const handleCartToggle = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (isCartPage) return;
    if (document.body.classList.contains('cart-is-visible')) {
      document.body.classList.remove('cart-is-visible');
      const cartOpenButton = document.querySelector('.header__btn--cart');
      if (cartOpenButton) {
        cartOpenButton.focus();
      }
    } else {
      document.body.classList.add('cart-is-visible');
      const cartCloseButton = document.querySelector('.cart__close');
      if (cartCloseButton) {
        cartCloseButton.focus();
      }
    }
  };

  const addToCartTracking = (items) => {
    [items].forEach(item => {
      const _learnq = window._learnq || [];
      const cartData = window.theme.cart;

      cartData.items.forEach(cartItem => {
        const allItemKeys = Object.keys(cartItem);
        allItemKeys.forEach(key => {
          if (!(key.endsWith('_price') || key === 'price')) return;
          const price = cartItem[key];
          if (price !== Math.floor(price)) return;
          cartItem[key] = (price / 100).toFixed(2);
        })
      });

      const klaviyoData = { item, cartData };

      _learnq.push(['track', 'Add to Cart', klaviyoData]);
    })
  };

  /**
   *
   * @param {...Item} items - Array of {@link Item} objects to add to cart.
   * @param {boolean} openCart - Triggers the cart to open when item added if true
   */

  const handleAddToCartEvent = async (items, openCart = false, callback = null) => {
    // Items could contain extra data like properties or variant info.
    // This reassignment strips out all but id, qty and properties to pass
    // to the addLineItems function for the cart.
    if (openCart) {
      handleCartToggle();
    }
    if (window.location.pathname === window.theme?.routes?.cartUrl) {
      window.scroll({top: 0});
    }

    const lineItems = [items].flat().map((item) => {
      // ID and Qty will always be part of the array
      const newLineItem = {
        id: item.id,
        quantity: item.quantity,
      };
      // Only add properties if they exist
      if ('properties' in item) {
        newLineItem.properties = item.properties;
      }
      return newLineItem;
    });
    try {
      await addLineItems(lineItems);

      // Send Klaviyo tracking event
      addToCartTracking(items);

      if (callback && typeof callback === 'function') {
        callback();
      }
    } catch (err) {
      window.console.error(err);
      throw err;
    }
  };

  useEffect(async () => {
    if (giftProducts === null) {
      setGiftProducts(giftWithPurchaseDetails);
    } else {
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
        setGiftProducts(json);
      } catch (err) {
        window.console.error(err);
      }
    }
    getGiftcardProducts(cartItems);
  }, [cart]);

  useEffect(() => {
    if (giftProducts === null) {
      return;
    }

    checkGifts(giftProducts, addLineItems, updateLineItems);
  }, [giftProducts]);

  useEffect(() => {
    if (isCartPage) {
      window.addEventListener('cartDrawerUpdated', () => setCart(window.theme.cart));
    } else {
      window.sideCart = {
        handleAddToCartEvent,
      };
      const cartToggles = document.querySelectorAll('[data-toggle-cart]');
      cartToggles.forEach((cartToggle) => cartToggle.addEventListener('click', handleCartToggle));
      if (upsellsEnabled) {
        getUpsellProducts();
      }
      window.addEventListener('cartPageUpdated', () => setCart(window.theme.cart));
    }
    getGiftcardProducts(cartItems);
  }, []);

  return (
    <>
      {isCartPage ? (
        <div className="page-header">
          <h1 className="h3">{window.theme.strings.cartTitle}</h1>
        </div>
      ) : (
        <>
          <div className="cart__header">
            {cartItems.length > 0 && (
              <h2 className="cart__title">
                {window.theme.strings.sideCartTitle}: {itemsCount}
              </h2>
            )}
            <button
              type="button"
              className="cart__close btn__icon"
              aria-label={window.theme.strings.closeCart}
              data-toggle-cart
            >
              <span dangerouslySetInnerHTML={{__html: iconClose}} />
            </button>
          </div>
          {showShippingBar && <FreeShippingBar total={total} freeShippingBarSettings={freeShippingBarSettings} />}
          <RewardsBalance />
        </>
      )}

      {errorMessage && (
        <div className="cart__error-message">
          {errorMessage}
          <button
            type="button"
            className="cart__dismiss-message"
            aria-label={window.theme.strings.dismissErrorMessage}
            onClick={() => setErrorMessage(null)}
          >
            <span dangerouslySetInnerHTML={{__html: iconClose}} />
          </button>
        </div>
      )}
      <div className="cart__loading-animation">
        <div className="loader" />
      </div>
      {cartItems.length > 0 ? (
        <div className="cart__content-container">
          <div className="cart__content">
            <ul className="cart__cart-items-container list-none">
              {cartItems.map((item) => (
                <CartItem
                  item={item}
                  updateLineItems={updateLineItems}
                  setEditItem={setEditItem}
                  setEditProduct={setEditProduct}
                  rootUrl={rootUrl}
                  key={item.key}
                />
              ))}
            </ul>
            {isCartPage && <TrustIndicators layout="grid" isCartPage={isCartPage} />}
          </div>
          <CartEditItemPopup
            editItem={editItem}
            setEditItem={setEditItem}
            editProduct={editProduct}
            setEditProduct={setEditProduct}
            addLineItems={addLineItems}
          />
          {upsellsEnabled && !isCartPage && upsellProducts.length ?
            <CartUpsells
              className={total === 0 ? 'hide' : ''}
              total={total}
              products={upsellProducts}
              addToCart={handleAddToCartEvent}
            />
            : null
          }
          <div className="cart__footer">
            {window.theme.rewards.enabled &&
              cartItems.length > 0 &&
              isCartPage &&
              window.theme.cartRewards.rewardsBlurbHeader &&
              window.theme.cartRewards.rewardsBlurb && (
                <div className="cart__rewards-desc">
                  <h4 className="cart__subheading">{window.theme.cartRewards.rewardsBlurbHeader}</h4>
                  <div dangerouslySetInnerHTML={{__html: window.theme.cartRewards.rewardsBlurb}} />
                </div>
              )}

            {cartItems.length > 0 && window.theme.showShippingInCart && (
              <>
                {isCartPage && <h4 className="cart__subheading">Order Summary</h4>}
                <div className="cart__subtotals">
                  <div className="cart__subtotal">
                    <span>{window.theme.strings.subtotal}</span>
                    <span>{formatMoney(total, window.theme.moneyFormat)}</span>
                  </div>
                  {cart.total_discount && cart.total_discount !== 0 ? (
                    <div className="cart__subtotal">
                      <span dangerouslySetInnerHTML={{__html: window.theme.strings.cartDiscounts}} />
                      <span>{formatMoney(cart.total_discount, window.theme.moneyFormat)}</span>
                    </div>
                  ) : null}
                  {showShippingBar && (
                    <div className="cart__subtotal">
                      <span>{window.theme.strings.shipping}</span>
                      <span className="cart__subtotal-value">
                        {total < freeShippingBarSettings.thresholdOne
                          ? formatMoney(window.theme.shippingPrice * 100, window.theme.moneyFormat)
                          : formatMoney(0, window.theme.moneyFormat)}
                      </span>
                    </div>
                  )}
                  <div className="cart__total">
                    <span>{window.theme.strings.total}</span>
                    <span className="cart__total-value">
                      {total < freeShippingBarSettings.thresholdOne && showShippingBar
                        ? formatMoney(total + window.theme.shippingPrice * 100, window.theme.moneyFormat)
                        : formatMoney(total, window.theme.moneyFormat)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          {isCartPage && (
            <div className="cart__options">
              {window.theme.cartIncludeAfterpay && (
                <p>
                  Or 4 payments of {formatMoney(total / 4, window.theme.moneyFormat)} with{' '}
                  <span dangerouslySetInnerHTML={{__html: iconAfterPay}} />
                </p>
              )}
            </div>
          )}
          <div className="cart__checkout">
            <a href={`${rootUrl}/checkout`} className="btn btn--block">
              {isCartPage ? (
                window.theme.strings.checkout
              ) : (
                <>
                  {total < freeShippingBarSettings.thresholdOne && showShippingBar
                    ? formatMoney(total + window.theme.shippingPrice * 100, window.theme.moneyFormat)
                    : formatMoney(total, window.theme.moneyFormat)}{' '}
                  – {window.theme.strings.checkout}
                </>
              )}
            </a>
            {!isCartPage && (
              <a href="/cart" className="btn__text">
                {window.theme.strings.viewCart}
              </a>
            )}
          </div>
          {isCartPage && (
            <div class="cart__end">
              {window.theme.cartContinueShoppingLink && (
                <a href={window.theme.cartContinueShoppingLink} className="btn__text btn__text--icon-left">
                  <span dangerouslySetInnerHTML={{__html: iconArrowLeft}} />
                  {window.theme.strings.cartContinueShopping}
                </a>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="cart__empty text-center">
          <h4 dangerouslySetInnerHTML={{__html: window.theme.strings.cartEmpty}} />
          {window.theme.cartEmptyLinks.length && (
            <ul className="cart__empty-links">
              {window.theme.cartEmptyLinks.map((item) => (
                <li key={item.url}>
                  <a className="btn btn--secondary btn--block" href={item.url}>
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <TrustIndicators layout="slider" isCartPage={isCartPage} />
        </div>
      )}
    </>
  );
};

Cart.propTypes = {
  rootUrl: PropTypes.string,
  freeShippingBarSettings: PropTypes.object,
  giftWithPurchaseDetails: PropTypes.object,
  isCartPage: PropTypes.bool,
};

export default Cart;
