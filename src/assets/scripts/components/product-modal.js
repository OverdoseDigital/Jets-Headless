import {load} from '@shopify/theme-sections';

import ModalDialog from './modal-dialog';

export default function initProductModal() {
  const quickshopModalEl = document.querySelector('#modal--quickshop');
  const quickshopModalTrigger = document.querySelectorAll('[data-open-quick-shop]');

  if (quickshopModalEl && quickshopModalTrigger.length > 0) {
    const quickshopModal = new ModalDialog(quickshopModalEl, {
      triggerEl: quickshopModalTrigger,
      modalId: 'quickshop',
    });
    window.quickshopModal = quickshopModal;
  }
}

function initProductModalContent() {
  const productModal = window.quickshopModal;
  if (!productModal) {
    return;
  }

  load('product-modal');
}

export async function openProductModal(productHandle) {
  const productModal = window.quickshopModal;
  if (!productModal) {
    return;
  }

  const modalContent = document.querySelector('[data-quick-shop]');
  const modalHandle = modalContent.getAttribute('data-product-handle');
  if (modalHandle !== productHandle) {
    modalContent.setAttribute('data-product-handle', productHandle);
    modalContent.innerHTML = '';

    const url = `/products/${productHandle}?view=modal`;
    try {
      const response = await fetch(url);
      if (response.ok === false) {
        throw new Error('Product modal fetch response was not OK');
      }
      modalContent.innerHTML = await response.text();
      initProductModalContent();
    } catch (err) {
      window.console.error(err);
    }
  }

  productModal.showModal();
}
