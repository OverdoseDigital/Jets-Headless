/**
 * Customer Addresses Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled to the Customer Addresses template.
 *
 * @namespace customerAddresses
 */

import {AddressForm} from '@shopify/theme-addresses';

const selectors = {
  addressContainer: '[data-address-container]',
  addressToggle: '[data-address-toggle]',
  addNewAddressButton: '[data-address-toggle="add"]',
  addressForm: '[data-address-form]',
  addressFormFields: '[data-address-fields]',
  addressHiddenFieldGroup: '[data-aria-hidden="true"]',
  addressRequiredField: '[data-required]',
  addressCountry: '[name="address[country]"]',
  addressDeleteForm: '[data-address-delete-form]',
};
const hideClass = 'hide';

document.addEventListener('DOMContentLoaded', () => {
  const addresses = document.querySelectorAll(selectors.addressContainer);

  if (addresses.length > 0) {
    addresses.forEach((addressContainer) => initAddressForm(addressContainer));
  }
});

const handleAddressDelete = (event) => {
  const confirmMessage = event.currentTarget.getAttribute('data-confirm-message');
  // eslint-disable-next-line no-alert
  if (!window.confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
    event.preventDefault();
  }
};

const initToggleButtons = (button, addressForm) => {
  button.addEventListener('click', () => {
    addressForm.classList.toggle(hideClass);

    if (button.dataset.addressToggle === 'add') {
      button.classList.add(hideClass);
    }

    if (button.dataset.addressToggle === 'cancelAdd') {
      const addButton = document.querySelector(selectors.addNewAddressButton);
      addButton.classList.remove(hideClass);
      const {y} = addButton.getBoundingClientRect();
      window.scrollTo({top: y + window.pageYOffset - 300});
    }

    if (button.dataset.addressToggle === 'cancelEdit') {
      const {y} = button.closest(selectors.addressContainer).getBoundingClientRect();
      window.scrollTo({top: y + window.pageYOffset - 100});
    }
  });
};

/**
 *
 * Extends functionality of `AddressForm()` by automatically setting/unsetting the `required` attribute and clearing `value` of fields that are shown/hidden by `AddressForm()` in response to country selection.
 *
 * `requestAnimationFrame()` is used to delay execution of this function until after `AddressForm()`'s own `change` listener.
 */
const handleFieldVisibility = (addressFields) => {
  requestAnimationFrame(() => {
    const requiredFields = Array.from(addressFields.querySelectorAll(selectors.addressRequiredField));

    requiredFields.forEach((field) => {
      const parent = field.parentElement;
      if (parent.dataset.ariaHidden === 'true') {
        field.removeAttribute('required');
        return;
      }
      field.setAttribute('required', '');
    });
  });
};

const initAddressForm = async (container) => {
  const deleteForm = container.querySelector(selectors.addressDeleteForm);
  const toggleButtons = container.querySelectorAll(selectors.addressToggle);
  const addressForm = container.querySelector(selectors.addressForm);
  const addressFields = addressForm.querySelector(selectors.addressFormFields);
  const countrySelector = addressFields.querySelector(selectors.addressCountry);

  if (toggleButtons) {
    toggleButtons.forEach((button) => initToggleButtons(button, addressForm));
  }

  if (deleteForm) {
    deleteForm.addEventListener('submit', handleAddressDelete);
  }

  await AddressForm(addressFields, window.theme.locale.isoCode, {
    shippingCountriesOnly: addressFields.dataset.addressLimitCountries === 'true',
  });

  handleFieldVisibility(addressFields);
  countrySelector.addEventListener('change', () => handleFieldVisibility(addressFields));
};
