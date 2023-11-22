import {load} from '@shopify/theme-sections';

import {addToWishList, removeFromWishList} from '../wishlist';


import ModalDialog from './modal-dialog';
import customSelectHybrid from './custom-select-hybrid';

export default function initWishlistModal() {
  const wishlistModalElement = document.querySelector('#modal--wishlist');
  const wishlistModalTriggers = document.querySelectorAll('[data-trigger-wishlist-modal]');

  if (wishlistModalElement && wishlistModalTriggers.length > 0) {
    const wishlistModal = new ModalDialog(wishlistModalElement, {
      triggerEl: wishlistModalTriggers,
      modalId: 'wishlist',
    });
    window.wishlistModal = wishlistModal;
  }
}

function initWishlistModalContent() {
  const wishlistModal = window.wishlistModal;
  if (!wishlistModal) {
    return;
  }
  load('wishlist-sizes-modal');
}

function updateWishlistButtonState(wishlistButton, wishlistedItems, selectedItem) {
  if (wishlistedItems.some(({epi}) => Number(epi) === Number(selectedItem))) {
    wishlistButton.classList.add('is-wishlisted');
    wishlistButton.innerHTML = window.theme?.strings?.removeFromWishlist || 'Remove from wishlist';
  } else {
    wishlistButton.classList.remove('is-wishlisted');
    wishlistButton.innerHTML = window.theme?.strings?.addToWishlist || 'Add to wishlist';
  }
}

/**
 * Handles opening wishlist modal w. Size Variant selectors for user to pick which variant they intend to wishlist
 * @param {String} productHandle Handle of parent product
 * @param {NodeList} sizesElement Element with variant sizes select box
 * @param {String} productTitle Title of product
 * @param {String} productColour Product Colour name
 * @param {Object} wishlistProduct Wishlist formatted object containing at least `epi, empi, du and pr` props (https://api-docs.swym.it/v3/index.html#add-to-wishlist-addtowishlist)
 */
export function openWishlistModal(
  productHandle,
  sizesElement,
  sizesElementCustom,
  productTitle,
  productColour,
  wishlistProduct
) {
  const productModal = window.wishlistModal;
  const wishlistedProductsObj = JSON.parse(localStorage.getItem('swym-products'));
  const wishlistedItems = wishlistedProductsObj.all;

  if (!productModal || !sizesElement) {
    return;
  }

  const sizesContent = sizesElement.cloneNode(true);
  const sizesContentCustom = sizesElementCustom.cloneNode(true);
  const modalContent = document.querySelector('[data-wishlist-sizes]');

  const modalHandle = modalContent.getAttribute('data-product-handle');
  if (modalHandle !== productHandle) {
    modalContent.setAttribute('data-product-handle', productHandle);
    modalContent.innerHTML = '';

    modalContent.insertAdjacentElement('beforeend', sizesContent);
    modalContent.insertAdjacentElement('beforeend', sizesContentCustom);
    sizesContent.classList.add('selectNative');
    sizesContent.classList.add('js-selectNative');

    handleVariantSelect(sizesContent, productModal, productTitle, productColour, wishlistProduct, wishlistedItems);
    initWishlistModalContent();
    const customSelectHybridsSelectors = document.querySelectorAll('.custom-select-hybrid-wishlist');
    customSelectHybrid(customSelectHybridsSelectors);
  }

  productModal.showModal();
}

function handleVariantSelect(parentEl, modalElement, productTitle, productColour, wishlistProduct, wishlistedItems) {
  let selectedVariantId = parentEl[parentEl.selectedIndex]?.value || null;
  const modalDialogEl = parentEl.closest('.modal__content');
  const colourElem = modalDialogEl.querySelector('.modal__product-colour');
  const titleElem = modalDialogEl.querySelector('.modal__product-title');

  const existingAddToWishListBtn = modalDialogEl.querySelector('[data-add-item-to-wishlist]');
  const newAddToWishlistBtn = existingAddToWishListBtn.cloneNode(true);

  modalDialogEl.replaceChild(newAddToWishlistBtn, existingAddToWishListBtn);
  const addToWishListBtn = modalDialogEl.querySelector('[data-add-item-to-wishlist]');

  parentEl.classList.remove('no-js');

  if (!selectedVariantId) {
    addToWishListBtn.disabled = true;
  }

  wishlistProduct.epi = selectedVariantId;

  updateWishlistButtonState(addToWishListBtn, wishlistedItems, wishlistProduct.epi);

  if (productTitle) {
    titleElem.innerHTML = productTitle;
  }

  if (productColour) {
    colourElem.innerHTML = `Colour: ${productColour}`;
  } else {
    colourElem.innerHTML = '';
  }

  parentEl.addEventListener('change', () => {
    selectedVariantId = parentEl[parentEl.selectedIndex]?.value;
    wishlistProduct.epi = selectedVariantId;
    updateWishlistButtonState(addToWishListBtn, wishlistedItems, wishlistProduct.epi);
  });

  addToWishListBtn.addEventListener('click', async () => {
    if (addToWishListBtn.classList.contains('is-wishlisted')) {
      const response = await removeFromWishList(wishlistProduct);
      if (response.ok === false) {
        throw new Error('Could not remove item from wishlist');
      }
      addToWishListBtn.classList.remove('is-wishlisted');
      addToWishListBtn.innerHTML = window.theme?.strings?.removedFromWishlist || 'Removed from wishlist';
      setTimeout(() => {
        modalElement.closeModal();
        addToWishListBtn.innerHTML = window.theme?.strings?.addToWishlistaddToWishlist || 'Add to wishlist';
      }, 1500);

    } else {
      const response = await addToWishList(wishlistProduct);
      if (response.ok === false) {
        throw new Error('Could not add item to wishlist');
      }
      addToWishListBtn.classList.add('is-wishlisted');
      addToWishListBtn.innerHTML = window.theme?.strings?.addedToWishlist || 'Added to wishlist';
      setTimeout(() => {
        modalElement.closeModal();
        addToWishListBtn.innerHTML = window.theme?.strings?.removeFromWishlist || 'Remove from wishlist';
      }, 1500);
    }
  });
}

export function createWishlistModalUI(modalId) {
  const modal = document.querySelector(modalId);
  if (!modal) {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="modal modal--wishlist" id="modal--wishlist" role="dialog" hidden>
        <div class="modal__dialog">
          <div class="modal__header">
            <h5>${window.theme?.strings?.addToWishlist || 'Add to wishlist'}</h5>
            <button type="button" class="btn--icon modal__close-button" data-modal-close="modal--wishlist"><svg aria-label="Cross icon" class="icon icon-cross" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" vector-effect="non-scaling-stroke" d="M17 7L7 17M7 7l10 10"/></svg></button>
          </div>
          <div class="modal__content">
            <p class="modal__meta">
              <span class="modal__product-title"></span><br>
              <span class="modal__product-colour"></span>
            </p>
            <div class="custom-select-hybrid-wishlist form__group">
              <div class="selectWrapper" data-wishlist-sizes></div>
            </div>
            <button data-add-item-to-wishlist class="btn btn--block">${
              window.theme?.strings?.addToWishlist || 'Add to wishlist'
            }</button>
          </div>
        </div>
      </div>`
    );
    initWishlistModal(modal);
  }
}
