import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {formatMoney} from '@shopify/theme-currency';
import Flickity from 'react-flickity-component';
import {getSizedImageUrl} from '@shopify/theme-images';

import handleProductOptionsArrows from '../../../../assets/scripts/utils/product-options-arrows';
import iconClose from '../../../../assets/svg/icon-cross.svg';
import iconPlus from '../../../../assets/svg/icon-plus-sm.svg';
import iconMinus from '../../../../assets/svg/icon-minus-sm.svg';

/* eslint-disable babel/camelcase */
const CartUpsells = ({total, products, addToCart, items}) => {
  const upsellsHeading = window.theme.cartUpsells ? window.theme.cartUpsells.heading : '';
  const upsellsAddToCart = window.theme.cartUpsells.addToBag ? window.theme.cartUpsells.addToBag : 'Add';
  const [upsellsExpanded, setUpsellsExpanded] = useState(true);
  const upsellsCollapseWrapper = useRef(null);

  const [selectedUpsell, setSelectedUpsell] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const productOptionsWrapper = document.querySelector('.cart-item__product-options');
    if (productOptionsWrapper) {
      handleProductOptionsArrows(productOptionsWrapper);
    }
  }, [selectedUpsell]);

  useEffect(() => {
    let hasUpsellOffers = false
    let itemsWithUpsells = items.filter(i => i?.properties?._upsell_data)
    if(itemsWithUpsells.length) {
      itemsWithUpsells.map(iwu => {
        let upsellData = JSON.parse(iwu.properties?._upsell_data)
        let inCart = items.find(i => i.handle == upsellData.handle)
        if(!inCart) hasUpsellOffers = true
      })
    }
    if(hasUpsellOffers) {
      upsellsCollapseWrapper.current.style.height = 0
      setUpsellsExpanded(false)
    } else {
      upsellsCollapseWrapper.current.style.height = `${upsellsCollapseWrapper.current.scrollHeight}px`;
      setUpsellsExpanded(true)
    }
  }, [items]);

  const addUpsellProductToCart = async (variantId) => {
    if (!variantId) {
      return;
    }

    const item = {
      id: variantId,
      quantity: 1,
      properties: {
        _cart_upsell: true,
      },
    };
    await addToCart(item, false);
    setSelectedUpsell(null);
    setSelectedVariant(null);
  };

  const handleUpsellToggle = (event) => {
    if (event) {
      event.preventDefault();
    }
    if (upsellsCollapseWrapper.current) {
      if (upsellsExpanded) {
        upsellsCollapseWrapper.current.style.height = 0;
      } else {
        upsellsCollapseWrapper.current.style.height = `${upsellsCollapseWrapper.current.scrollHeight}px`;
      }
    }
    setUpsellsExpanded(!upsellsExpanded);
  };

  const transformSSImageURL = (imageURL) => {
    const match = imageURL.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match) {
      const prefix = imageURL.split(match[0]);
      const suffix = match[0];
      const prefixSplit = prefix[0].split('_');
      const lastSplit = prefixSplit[prefixSplit.length - 1];
      const prefixWithoutSize = lastSplit.includes('x') ? prefix[0].replace(`_${lastSplit}`, '') : prefix[0];

      return `${prefixWithoutSize}${suffix}`;
    } else {
      return imageURL;
    }
  }

  const flickityOptions = {
    freeScroll: false,
    imagesLoaded: true,
    setGallerySize: true,
    watchCSS: true,
    prevNextButtons: false,
    pageDots: true,
    contain: true,
    groupCells: true,
    cellAlign: 'left',
  };

  return (
    <>
      {total > 0 && (
        <>
          <div className={`cart__upsells ${upsellsExpanded ? 'is-expanded' : ''}`}>
            <button type="button" className="cart__upsell-toggle" onClick={handleUpsellToggle}>
              {upsellsHeading}
              {upsellsExpanded ? (
                <span dangerouslySetInnerHTML={{__html: iconMinus}} />
              ) : (
                <span dangerouslySetInnerHTML={{__html: iconPlus}} />
              )}
            </button>
            <div className="cart__upsell-items-wrapper" ref={upsellsCollapseWrapper}>
              <Flickity
                className="cart__upsell-items"
                elementType="div"
                options={flickityOptions}
                disableImagesLoaded={false}
                reloadOnUpdate
                static
              >
                {products.map((product) => {
                  const variants = JSON.parse(product.attributes.variants);
                  const title = product.mappings.core.name;
                  const featured_image = transformSSImageURL(product.attributes.ss_images[0]);
                  const price = product.mappings.core.price * 100;
                  const compare_at_price = product.attributes.variant_compare_at_price;
                  const id = product.id;
                  const handle = product.attributes.handle;

                  product.variants = variants;

                  const firstAvailableVariant = variants.find((variant) => variant.inventory_quantity > 0);
                  return (
                    <div key={id} className="cart__upsell-item">
                      {featured_image && (
                        <a href={`/products/${handle}`} className="cart__upsell-image--wrapper">
                          <div className="cart__upsell-image">
                            <img
                              src={getSizedImageUrl(featured_image, '212x294_crop_center')}
                              width={106}
                              height={147}
                              alt={title}
                            />
                          </div>
                        </a>
                      )}
                      <div className="cart__upsell-info">
                        <div className="cart__upsell-info--title">
                          <p className="cart__upsell-title">{title}</p>
                          {compare_at_price > price ? (
                            <p className="cart__upsell-price">
                              <s>
                                {formatMoney(compare_at_price, window.theme.moneyFormat)}
                              </s>
                              <span className="cart__upsell-price--sale">
                                {formatMoney(price, window.theme.moneyFormat)}
                              </span>
                            </p>
                          ) : (
                            <p className="cart__upsell-price">
                              {formatMoney(price, window.theme.moneyFormat)}
                            </p>
                          )}
                        </div>

                        {variants && variants.length > 1 ? (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => setSelectedUpsell(product)}
                          >
                            <span dangerouslySetInnerHTML={{__html: upsellsAddToCart}} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--secondary btn--small"
                            onClick={() => addUpsellProductToCart(firstAvailableVariant?.id)}
                          >
                            <span dangerouslySetInnerHTML={{__html: upsellsAddToCart}} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Flickity>
            </div>
          </div>

          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
          <div
            className="fader fader--cart-item-variants"
            aria-hidden={!selectedUpsell}
            onClick={() => {
              setSelectedUpsell(null);
              setSelectedVariant(null);
            }}
          />

          <div className="cart-item__variants-form" aria-hidden={!selectedUpsell}>
            {selectedUpsell && selectedUpsell.variants.length > 0 && (
              <>
                <div className="cart-item__variants-form-header modal__header">
                  <h5>{window.theme.strings.selectSize}</h5>
                  <button
                    type="button"
                    className="btn__icon modal__close-button"
                    onClick={() => {
                      setSelectedUpsell(null);
                      setSelectedVariant(null);
                    }}
                  >
                    <span dangerouslySetInnerHTML={{__html: iconClose}} />
                  </button>
                </div>
                <div className="cart-item__variants-form-content">
                  <div className="cart-item__product-options-wrapper">
                    <div className="cart-item__product-options">
                      {selectedUpsell.variants.map((variant) => (
                        <div className="cart-item__product-option" key={variant.id}>
                          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                          <input
                            type="radio"
                            name={selectedUpsell.title}
                            id={variant.id}
                            onChange={() => setSelectedVariant(variant)}
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
        </>
      )}
    </>
  );
};
/* eslint-enable babel/camelcase */

/* eslint-disable react/forbid-prop-types */
CartUpsells.propTypes = {
  total: PropTypes.number,
  products: PropTypes.array,
  addToCart: PropTypes.func,
};
/* eslint-enable react/forbid-prop-types */

export default CartUpsells;