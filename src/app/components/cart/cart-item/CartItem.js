import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {formatMoney} from '@shopify/theme-currency';

import changeLineItem from '../../../utils/changeLineItem';
import {imageUrl} from '../../../../assets/scripts/utils/shopify-images';
import iconClose from '../../../../assets/svg/icon-cross.svg';
import iconMinus from '../../../../assets/svg/icon-minus-sm.svg';
import iconPlus from '../../../../assets/svg/icon-plus-sm.svg';
import iconEdit from '../../../../assets/svg/icon-edit.svg';
import { getSizedImageUrl } from '@shopify/theme-images';

const CartItem = ({item, updateLineItems, setEditItem, setEditProduct, rootUrl, addToCart, items}) => {
  const isGiftProduct = Boolean(item.properties?._gwp);
  const comparePrice = Number(item.properties?._compare_price);
  const upsellData = JSON.parse(item.properties?._upsell_data ? item.properties?._upsell_data : null)
  const upsellsAddToCart = window.theme.cartUpsells.addToBag ? window.theme.cartUpsells.addToBag : 'Add';

  const [crossSellOpen, setCrossSellOpen] = useState(true);

  const [selectedCrossSell, setSelectedCrossSell] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  useEffect(() => {
    if(!upsellData) return
    const inCart = items.find(i => i.handle == upsellData.handle)
    if(inCart && crossSellOpen) setCrossSellOpen(false)
  }, [items]);

  const addUpsellProductToCart = async (variantId) => {
    if(upsellData?.variants.length && !selectedCrossSell) {
      setSelectedCrossSell(upsellData)
      document.body.classList.add('variant-picker-open')
      return
    }
    if (!variantId) {
      return;
    }
    document.body.classList.remove('variant-picker-open')
    const item = {
      id: variantId,
      quantity: 1,
      properties: {
        _cart_upsell: true,
      },
    };
    await addToCart(item, false);
    // setSelectedCrossSell(null);
    // setSelectedVariant(null);

  };

  return (
    <li className={`cart-item ${upsellData && crossSellOpen ? 'cart-item--with-upsell' : ''}`}>
      {item?.featured_image?.url && (
        <div className="cart-item__image" data-src={item.featured_image.url}>
          <a href={item.url}>
            <img
              src={imageUrl(item.featured_image.url, 212, 294, 'center')}
              // src={'https://' + item.featured_image.url}
              width={106}
              height={147}
              alt={item.title}
              loading="lazy"
            />
          </a>
        </div>
      )}
      <div className="cart-item__content">
        <div className="cart-item__content-group">
          <p className="cart-item__title">{item.product_title}</p>
          {comparePrice && comparePrice > item.price ? (
            <p className="cart-item__price">
              <s>{formatMoney(comparePrice * item.quantity, window.theme.moneyFormat)}</s>
              <span className="cart-item__discounted-price">
                {formatMoney(item.line_price, window.theme.moneyFormat)}
              </span>
            </p>
          ) : (
            <p className="cart-item__price">{formatMoney(item.line_price, window.theme.moneyFormat)}</p>
          )}
          {item.discounts && (
            <div className="cart-item__discounts">
              {item.discounts.map((discount) => (
                <p key={discount.title}>{discount.title}</p>
              ))}
            </div>
          )}
          {item.variant_title && (
            <p className="cart-item__variant">
              {item.variant_title}
              {!isGiftProduct && (
                <button
                  type="button"
                  className="btn__text"
                  onClick={() => changeLineItem(item, rootUrl, setEditItem, setEditProduct)}
                >
                  <span dangerouslySetInnerHTML={{__html: iconEdit}} />
                  {window.theme.strings.edit}
                </button>
              )}
            </p>
          )}
          {item.properties && (
            <div className="cart-item__properties">
              {Object.entries(item.properties)
                .filter(([key]) => !key.startsWith('_'))
                .map(([key, value]) => (
                  <p key={key}>
                    <span className="cart-item__property-key">{key}</span>: <span>{value}</span>
                  </p>
                ))}
            </div>
          )}
        </div>
        {item.line_price > 0 && (
          <div className="cart-item__quantity-selector quantity-selector">
            <button
              onClick={() => updateLineItems({[item.key]: item.quantity - 1})}
              className="btn__icon quantity-selector__btn is-minus"
              type="button"
            >
              <span dangerouslySetInnerHTML={{__html: iconMinus}} />
            </button>
            <input
              id={`cart-qty_${item.key}`}
              className="quantity-selector__input"
              type="number"
              name="quantity"
              min="1"
              aria-label={window.theme.strings.itemQuantity}
              value={item.quantity}
              autoComplete="off"
              onBlur={(event) =>
                item.quantity === Number(event.target.value) ? null : updateLineItems({[item.key]: event.target.value})
              }
            />
            <button
              onClick={() => updateLineItems({[item.key]: item.quantity + 1})}
              className="btn__icon quantity-selector__btn is-plus"
              type="button"
            >
              <span dangerouslySetInnerHTML={{__html: iconPlus}} />
            </button>
          </div>
        )}
        <div className="cart-item__remove">
          <button
            className="btn__icon-minor"
            onClick={() => {
              if (isGiftProduct) {
                const manuallyRemovedGifts = JSON.parse(sessionStorage.getItem('manuallyRemovedGifts')) || [];
                manuallyRemovedGifts.push(item.product_id);
                sessionStorage.setItem(
                  'manuallyRemovedGifts',
                  JSON.stringify(Array.from(new Set(manuallyRemovedGifts)))
                );
              }
              updateLineItems({[item.key]: 0});
            }}
            type="button"
          >
            <span dangerouslySetInnerHTML={{__html: iconClose}} />
          </button>
        </div>
      </div>
      { upsellData && crossSellOpen && <div class="cart-item__cross-sell">
        <div className="cart-item__upsell-top-row">
          <p className="cart-item__upsell-title">{item.properties?._upsell_block_title}</p>
          <button
                type="button"
                className="btn btn--tertiary btn--small"
                onClick={() => setCrossSellOpen(false)}
              >
                No thanks
          </button>
        </div>
        <div className="cart__upsell-item">
          {upsellData.image && (
            <a href={`/products/${upsellData.handle}`} className="cart__upsell-image--wrapper">
              <div className="cart__upsell-image">
                <img
                  src={getSizedImageUrl(upsellData.image, '212x294_crop_center')}
                  width={106}
                  height={147}
                  alt={upsellData.title}
                />
              </div>
            </a>
          )}
          <div className="cart__upsell-info">
            <div className="cart__upsell-info--title">
              <p className="cart__upsell-title">{upsellData.title}</p>
              {upsellData.compare_at_price > upsellData.price ? (
                <p className="cart__upsell-price">
                  <s>
                    {formatMoney(upsellData.compare_at_price, window.theme.moneyFormat)}
                  </s>
                  <span className="cart__upsell-price--sale">
                    {formatMoney(upsellData.price, window.theme.moneyFormat)}
                  </span>
                </p>
              ) : (
                <p className="cart__upsell-price">
                  {formatMoney(upsellData.price, window.theme.moneyFormat)}
                </p>
              )}
            </div>

            {false ? (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => setSelectedCrossSell(product)}
              >
                <span dangerouslySetInnerHTML={{__html: upsellsAddToCart}} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={() => addUpsellProductToCart(upsellData.variant_id)}
              >
                <span dangerouslySetInnerHTML={{__html: upsellsAddToCart}} />
              </button>
            )}
          </div>
        </div>
        { selectedCrossSell && <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
          <div
            className="fader fader--cart-item-variants"
            aria-hidden={false}
            onClick={() => {
              setSelectedCrossSell(null);
              document.body.classList.remove('variant-picker-open')
              setSelectedVariant(null);
            }}
          />

          <div className="cart-item__variants-form" aria-hidden={false}>
            {selectedCrossSell && selectedCrossSell.variants.length > 0 && (
              <>
                <div className="cart-item__variants-form-header modal__header">
                  <h5>{window.theme.strings.selectSize}</h5>
                  <button
                    type="button"
                    className="btn__icon modal__close-button"
                    onClick={() => {
                      setSelectedCrossSell(null);
                      document.body.classList.remove('variant-picker-open')
                      setSelectedVariant(null);
                    }}
                  >
                    <span dangerouslySetInnerHTML={{__html: iconClose}} />
                  </button>
                </div>
                <div className="cart-item__variants-form-content">
                  <div className="cart-item__product-options-wrapper">
                    <div className="cart-item__product-options">
                      {selectedCrossSell.variants.map((variant) => (
                        <div className="cart-item__product-option" key={variant.id}>
                          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                          <input
                            type="radio"
                            name={selectedCrossSell.title}
                            id={variant.id}
                            onChange={() => {setSelectedVariant(variant); document.body.classList.add('variant-picker-open'); }}
                            disabled={variant.inventory_quantity <= 0}
                            className={variant.inventory_quantity <= 0 && 'disabled'}
                          />
                          <label htmlFor={variant.id}>{variant.title}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn--block"
                    onClick={() => addUpsellProductToCart(selectedVariant?.id)}
                    disabled={!selectedVariant}
                  >
                    {selectedVariant ? window.theme.strings.addToCart : window.theme.strings.selectSize}
                  </button>
                </div>
              </>
            )}
          </div>
        </> }
      </div>
      }
    </li>

  );
};

CartItem.propTypes = {
  item: PropTypes.object,
  updateLineItems: PropTypes.func,
  rootUrl: PropTypes.string,
  setEditItem: PropTypes.func,
  setEditProduct: PropTypes.func,
};

export default CartItem;
