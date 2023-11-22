import {load} from '@shopify/theme-sections';

import ModalDialog from './modal-dialog';

export default function initProductModal() {
  const sizesModalElement = document.querySelector('#modal--product-sizes');
  const sizesModalTrigger = document.querySelectorAll('[data-open-product-sizes]');

  if (sizesModalElement && sizesModalTrigger.length > 0) {
    const sizesModal = new ModalDialog(sizesModalElement, {
      triggerEl: sizesModalTrigger,
      modalId: 'product-sizes',
    });
    window.sizesModal = sizesModal;
  }
}

function initProductModalContent() {
  const productModal = window.sizesModal;
  if (!productModal) {
    return;
  }
  load('product-sizes-modal');
}

export function openProductModal(productHandle, sizesElement) {
  const productModal = window.sizesModal;
  if (!productModal || !sizesElement) {
    return;
  }

  const sizesContent = sizesElement.cloneNode(true);
  const modalContent = document.querySelector('[data-product-sizes]');
  const modalHandle = modalContent.getAttribute('data-product-handle');

  if (modalHandle !== productHandle) {
    modalContent.setAttribute('data-product-handle', productHandle);
    modalContent.innerHTML = '';
    modalContent.insertAdjacentElement('beforeend', sizesContent);
    handleVariantSelect(sizesContent, productModal);
    initProductModalContent();
  }

  productModal.showModal();
}

function handleVariantSelect(parentElement, modalElement) {
  let selectedVariantId = null;
  // const variantSelector = parentElement.querySelector('[data-product-select]');
  const variantButtons = parentElement.querySelectorAll('.product-card__variant');
  const isVariantSelected = [...variantButtons].some((el) => el.classList.contains('is-selected'));
  const addToCartButton = parentElement.querySelector('.product-card__add');
  const addLabel = window?.theme?.strings?.addToCart || 'Add to cart';
  const addedLabel = window?.theme?.strings?.addedMessage || 'Added';
  const selectSizeLabel = window?.theme?.strings?.selectSize || 'Pick a size';

  const buttonWrapper = parentElement.querySelector('.product-card__actions');
  selectedVariantId = buttonWrapper.dataset.selectedVariantId;
  let comparePrice = Number(buttonWrapper.dataset.comparePrice);

  if (!isVariantSelected) {
    addToCartButton.innerHTML = selectSizeLabel;
    addToCartButton.disabled = true;
  }

  parentElement.addEventListener('click', (evt) => {
    evt.preventDefault();
    const target = evt.target;
    const properties = {};
    if (target.matches('.product-card__variant')) {
      evt.preventDefault();
      selectedVariantId = Number(evt.target.dataset.variantId);
      comparePrice = Number(evt.target.dataset.variantComparePrice);
      addToCartButton.removeAttribute('disabled');
      addToCartButton.innerHTML = addLabel;
      buttonWrapper.dataset.selectedVariantId = selectedVariantId;
      buttonWrapper.dataset.comparePrice = comparePrice;
      variantButtons.forEach((button) => {
        button.classList.remove('is-selected');
      });
      target.classList.add('is-selected');
    }

    if (target.matches('.product-card__add')) {
      evt.preventDefault();
      Object.assign(properties, {_compare_price: comparePrice});
      const item = {
        id: selectedVariantId,
        quantity: 1,
        properties,
      };

      window.sideCart
        .handleAddToCartEvent(item, true)
        .then(() => modalElement.closeModal())
        .catch((err) => window.console.error(err));

      target.innerHTML = addedLabel;
      setTimeout(() => {
        target.innerHTML = addLabel;
      }, 2000);
    }
  });
}

export function createSizeModalUI(modalId) {
  const modal = document.querySelector(modalId);
  if (!modal) {
    document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="modal modal--product-sizes" id="modal--product-sizes" role="dialog" hidden>
        <div class="modal__dialog">
          <div class="modal__header">
            <h5>Select Size</h5>
            <button type="button" class="btn--icon modal__close-button" data-modal-close="modal--product-sizes"><svg aria-label="Cross icon" class="icon icon-cross" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path stroke="currentColor" stroke-linecap="round" stroke-width="1.5" vector-effect="non-scaling-stroke" d="M17 7L7 17M7 7l10 10"/></svg></button>
          </div>
          <div data-product-sizes></div>
        </div>
      </div>`
    );
    initProductModal(modal);
  }
}
