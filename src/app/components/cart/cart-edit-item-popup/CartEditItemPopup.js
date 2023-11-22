import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

import updateVariant from '../../../utils/updateVariant';
import handleProductOptionsArrows from '../../../../assets/scripts/utils/product-options-arrows';
import iconClose from '../../../../assets/svg/icon-cross.svg';

const CartEditItemPopup = ({editItem, setEditItem, editProduct, setEditProduct, addLineItems}) => {
  const [variants, setVariants] = useState(editProduct?.variants);
  const [selectedVariant, setSelectedVariant] = useState(
    editProduct?.variants.find((variant) => variant.id === editItem?.variant_id)
  );

  useEffect(() => {
    setVariants(editProduct?.variants);
    setSelectedVariant(editProduct?.variants.find((variant) => variant.id === editItem?.variant_id));
  }, [editProduct, editItem]);

  useEffect(() => {
    const productOptionsWrapper = document.querySelector('.cart-item__product-options');
    if (productOptionsWrapper) {
      handleProductOptionsArrows(productOptionsWrapper);
    }
  }, [variants]);

  if (!editItem || !editProduct || !variants || !selectedVariant) return null;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        className="fader fader--cart-item-variants"
        aria-hidden={variants.length === 0}
        onClick={() => {
          setEditItem(null);
          setEditProduct(null);
        }}
      />
      <div className="cart-item__variants-form" aria-hidden={variants.length === 0}>
        {variants.length > 0 && (
          <>
            <div className="cart-item__variants-form-header modal__header">
              <h5>{window.theme.strings.editSize}</h5>
              <button
                type="button"
                className="btn__icon modal__close-button"
                onClick={() => {
                  setEditItem(null);
                  setEditProduct(null);
                }}
              >
                <span dangerouslySetInnerHTML={{__html: iconClose}} />
              </button>
            </div>
            <div className="cart-item__variants-form-content">
              <div className="cart-item__product-options-wrapper">
                <div className="cart-item__product-options">
                  {variants.map((variant) => (
                    <div className="cart-item__product-option" key={variant.id}>
                      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                      <input
                        type="radio"
                        id={variant.id}
                        name="size-option"
                        onChange={() => setSelectedVariant(variant)}
                        checked={variant.id === selectedVariant.id}
                        disabled={!variant.available}
                        className={!variant.available && 'disabled'}
                      />
                      <label htmlFor={variant.id}>{variant.title}</label>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn btn--secondary btn--block"
                onClick={() => updateVariant(editItem, selectedVariant, setVariants, setSelectedVariant, addLineItems)}
                disabled={editItem.variant_id === selectedVariant.id}
              >
                {editItem.variant_id === selectedVariant.id
                  ? window.theme.strings.selectSize
                  : window.theme.strings.update}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

CartEditItemPopup.propTypes = {
  editItem: PropTypes.object,
  editProduct: PropTypes.object,
  setEditItem: PropTypes.func,
  setEditProduct: PropTypes.func,
  addLineItems: PropTypes.func,
};

export default CartEditItemPopup;
