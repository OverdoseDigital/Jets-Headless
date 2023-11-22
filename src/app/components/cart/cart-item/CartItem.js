import React from 'react';
import PropTypes from 'prop-types';
import {formatMoney} from '@shopify/theme-currency';

import changeLineItem from '../../../utils/changeLineItem';
import {imageUrl} from '../../../../assets/scripts/utils/shopify-images';
import iconClose from '../../../../assets/svg/icon-cross.svg';
import iconMinus from '../../../../assets/svg/icon-minus-sm.svg';
import iconPlus from '../../../../assets/svg/icon-plus-sm.svg';
import iconEdit from '../../../../assets/svg/icon-edit.svg';

const CartItem = ({item, updateLineItems, setEditItem, setEditProduct, rootUrl}) => {
  const isGiftProduct = Boolean(item.properties?._gwp);
  const comparePrice = Number(item.properties?._compare_price);
  return (
    <li className="cart-item">
      {item?.featured_image?.url && (
        <div className="cart-item__image">
          <a href={item.url}>
            <img
              src={imageUrl(item.featured_image.url, 212, 294, 'center')}
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
