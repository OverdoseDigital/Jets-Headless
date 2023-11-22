import {register} from '@shopify/theme-sections';
import {formatMoney} from '@shopify/theme-currency';

import api from '../components/seafolly-api';

const SELECTORS = {
  form: '#giftCardBalanceForm',
  numberInput: '#giftCardNumber',
  pinInput: '#giftCardPin',
  formError: '.form__error',
  cardBalanceScreen: '.gcbc__card-balance-section',
  cardNumberDisplay: '.js--gcbc-card-number',
  expiryDisplay: '.js--gcbc-expiry',
  originalDisplay: '.js--gcbc-original',
  balanceDisplay: '.js--gcbc-balance',
  done: '.js--gcbc-done',
};

const FORM_KEYS = {
  voucherNumber: 'voucherNumber',
  voucherPin: 'voucherPin',
};

const BALANCE_RESPONSE_KEYS = {
  voucherNumber: 'giftVoucherNumber',
  expiry: 'giftVoucherExpiryDate',
  originalAmount: 'giftVoucherOriginalAmount',
  available: 'giftVoucherAvailableAmount',
};

export default register('template-gift-card-balance-check', {
  onLoad() {
    const form = this.container.querySelector(SELECTORS.form);
    const numberInput = form.querySelector(SELECTORS.numberInput);
    const pinInput = form.querySelector(SELECTORS.pinInput);
    const formError = form.querySelector(SELECTORS.formError);
    const inputs = [numberInput, pinInput];

    // add form submit listener
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      applyVisualValidations(inputs);

      if (!formIsValid(form)) return;

      setLoading(form);

      let response;
      try {
        response = await api.giftCardBalance(getFormValues(form));
      } catch (error) {
        return setFormError(inputs, formError);
      }

      showBalance(response, form, inputs, formError);
    });

    // add form input listener
    form.addEventListener('input', makeHandleFormInput(form, formError));

    // add done listener
    this.container.querySelector(SELECTORS.done).addEventListener('click', makeHandleDone(form, formError));
  },
});

/**
 * @function applyVisualValidations - sets the form visuals according to each fields validity
 *
 * @return {boolean} - whether the form is valid;
 */
function applyVisualValidations(requiredInputs) {
  requiredInputs.forEach((input) => {
    if (input.value) {
      removeInputError(input);
    } else {
      addInputError(input);
    }
  });
}

/**
 * @function formIsValid
 *
 * @param form
 *
 * @returns {boolean}
 */
function formIsValid(form) {
  const {voucherNumber, voucherPin} = getFormValues(form);
  return voucherNumber && voucherPin;
}

/**
 * @function getFormValues - returns the form values from the from element.
 *
 * @param form
 *
 * @returns {object}
 */
function getFormValues(form) {
  const {[FORM_KEYS.voucherNumber]: voucherNumber, [FORM_KEYS.voucherPin]: voucherPin} = Object.fromEntries(
    new FormData(form)
  );

  return {
    voucherNumber,
    voucherPin,
  };
}

/**
 * @function makeHandleFormInput
 *
 * @param {Element} form
 * @param {Element} formError - form error node
 *
 * @return void
 */
const makeHandleFormInput = (form, formError) => (event) => {
  removeInputError(event.target);
  removeFormErrorMessage(formError);
  if (formIsValid(form)) {
    setNotLoading(form);
  }
};

/**
 * @function setFormError
 *
 * @param {Element[]} inputs    - form inputs array
 * @param {Element}   formError - form error node
 */
function setFormError(inputs, formError) {
  inputs.forEach(addInputError);
  addFormErrorMessage(formError);
}

/**
 * @function setFormPristine
 *
 * @param {form}      form      - form inputs array
 * @param {Element}   formError - form error node
 */
function setFormPristine(form, formError) {
  form.querySelectorAll('input').forEach(removeInputError);
  removeFormErrorMessage(formError);
  form.reset();
}

/**
 * @function addFormErrorMessage
 *
 * @param {Element} formError - form error node
 */
function addFormErrorMessage(formError) {
  formError.classList.remove('hide');
}

/**
 * @function removeFormErrorMessage
 *
 * @param {Element} formError - form error node
 */
function removeFormErrorMessage(formError) {
  formError.classList.add('hide');
}

/**
 * @function addInputError
 *
 * @param {Element} input
 */
function addInputError(input) {
  input.classList.add('input-error');
}

/**
 * @function removeInputError
 *
 * @param {Element} input
 */
function removeInputError(input) {
  input.classList.remove('input-error');
}

/**
 * @function setLoading - sets a forms submit button to loading state
 *
 * @param {Element} form
 */
const setLoading = (form) => {
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) {
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.disabled = true;
  }
};

/**
 * @function setNotLoading - reverts the forms submit button from loading state
 *
 * @param {Element} form - form element
 */
const setNotLoading = (form) => {
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) {
    submitButton.setAttribute('aria-busy', 'false');
    submitButton.disabled = false;
  }
};

/**
 * @function showBalance - transition from the form to the resolved results
 *
 * @param {object} apiResponse
 */
function showBalance(
  {
    [BALANCE_RESPONSE_KEYS.voucherNumber]: voucherNumber,
    [BALANCE_RESPONSE_KEYS.expiry]: expiry,
    [BALANCE_RESPONSE_KEYS.originalAmount]: originalAmount,
    [BALANCE_RESPONSE_KEYS.available]: available,
  } = {},
  form,
  inputs,
  formError
) {
  if (!(voucherNumber && expiry && originalAmount && available)) {
    setFormError(inputs, formError);
  }

  const cardBalanceScreen = document.querySelector(SELECTORS.cardBalanceScreen);

  // Add a 'Z' to the end of the returned timestamp in case it is missing.
  // const expString = expiry.replace(/T.+$/, 'Z');

  const d = new Date(String(expiry));
  const formattedDate = Intl.DateTimeFormat(window.theme.locale.isoCode, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);

  cardBalanceScreen.querySelector(SELECTORS.cardNumberDisplay).textContent = voucherNumber;
  cardBalanceScreen.querySelector(SELECTORS.expiryDisplay).textContent = formattedDate;
  cardBalanceScreen.querySelector(SELECTORS.originalDisplay).textContent = formatMoney(
    originalAmount,
    window.theme.moneyFormatWithoutDecimalsOrCurrency
  );
  cardBalanceScreen.querySelector(SELECTORS.balanceDisplay).textContent = formatMoney(
    available,
    window.theme.moneyFormatWithoutDecimalsOrCurrency
  );

  form.classList.add('hide');
  cardBalanceScreen.classList.remove('hide');
}

/**
 * @function makeHandleDone - returns a handler that cleans up and transition back to the form
 *
 * @returns {function} handleDone
 */
const makeHandleDone = (form, formError) => () => {
  const cardBalanceScreen = document.querySelector(SELECTORS.cardBalanceScreen);

  cardBalanceScreen.querySelector(SELECTORS.cardNumberDisplay).textContent = '';
  cardBalanceScreen.querySelector(SELECTORS.expiryDisplay).textContent = '';
  cardBalanceScreen.querySelector(SELECTORS.originalDisplay).textContent = '';
  cardBalanceScreen.querySelector(SELECTORS.balanceDisplay).textContent = '';

  setFormPristine(form, formError);

  cardBalanceScreen.classList.add('hide');
  form.classList.remove('hide');
};
