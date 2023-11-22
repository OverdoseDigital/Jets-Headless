import {formatMoney} from '@shopify/theme-currency';

import api from './seafolly-api';
import {getRewardsInfo} from './rewards';

const SHOPIFY_CHECKOUT = {
  fieldErrorClass: 'field--error',
  btnDisabledClass: 'btn--disabled',
  btnLoadingClass: 'btn--loading',
  discountFieldName: 'checkout[reduction_code]',
  discountInputSelector: '[name="checkout[reduction_code]"',
  reductionCodeErrorMessageSelector: '#error-for-reduction_code',
};

const REPLACEMENT_SET_ATTR_METHOD_NAME = '_setAttribute';

const GIFT_VOUCHER_FORM = {
  voucherNumberFieldName: 'voucherNumber',
  voucherPinFieldName: 'voucherPin',
  errorMessageId: 'gift_card_error',
};

const REDEEM_FORM = {
  balanceClass: 'redeem-balance',
  balanceSelector: '.redeem-balance',
  amountFieldName: 'redeemAmount',
  hiddenBalanceFieldName: 'balance',
  errorMessageId: 'redeem_form_error',
};

function init() {
  document.addEventListener('page:load', initGiftCardAndRedeemForms);
  document.addEventListener('page:change', initGiftCardAndRedeemForms);
}

/**
 * @function initGiftCardAndRedeemForms - adds giftcard & redeem forms just after each discount form & attaches handlers.
 *
 * FROM
 * +--------------------++-----------+
 * | Discount Code      ||  Apply    |
 * +--------------------++-----------+
 *
 *
 * TO
 * +--------------------++-----------+
 * | Discount Code      ||  Apply    |
 * +--------------------++-----------+
 *
 * Gift Card / Voucher (if enabled)
 * +---------------------------------+
 * | Gift Card number                | - non shopify gift card number entry
 * +---------------------------------+   will be used to resolve a shopify gift card.
 * +--------------------+ +----------+
 * |  Pin               | |  Apply   | => calls handleGiftCardSubmit
 * +--------------------+ +----------+
 *
 * Redeem Rewards (if enabled)
 * +--------------------+ +----------+
 * | Amount to redeem   | | Redeem   | => calls handleRewardsSubmit
 * +--------------------+ +----------+
 *
 * There can be multiple discount forms created by Shopify due to browser window resizing.
 *
 * Additionally adds form handlers for removing a gift card.
 *
 */
function initGiftCardAndRedeemForms() {
  const redeemForms = [];
  const existingGiftCardForm = document.querySelector('#giftCardForm');
  const existingRedeemForm = document.querySelector('#redeemForm');

  /*
    Create gift card / redeem forms as shown above, and attach required handlers.
  */
  document.querySelectorAll(SHOPIFY_CHECKOUT.discountInputSelector).forEach((discountInput) => {
    const shopifyDiscountForm = discountInput.closest('form');
    let giftCardForm;

    if (!shopifyDiscountForm) return;

    if (window?.theme?.giftCard?.enabled && Shopify.Checkout.step !== 'payment_method' && !existingGiftCardForm) {
      giftCardForm = injectGiftCardFormIntoDOM(shopifyDiscountForm);
      giftCardForm.addEventListener('submit', makeHandleGiftCardSubmit(shopifyDiscountForm));
      giftCardForm.addEventListener('input', handleGiftCardFormInput);
      moveShopifyGiftCardErrors(shopifyDiscountForm, giftCardForm);
    }

    if (
      window.theme?.rewards?.enabled &&
      window.theme?.customerId &&
      Shopify.Checkout.step !== 'payment_method' &&
      !existingRedeemForm
    ) {
      const redeemForm = injectRewardsFormIntoDOM(giftCardForm || shopifyDiscountForm);
      redeemForm.addEventListener('submit', makeHandleRedeemSubmit(shopifyDiscountForm));
      redeemForm.addEventListener('input', handleRedeemFormInput);
      redeemForms.push(redeemForm);
    } else if (window.theme?.rewards?.enabled && Shopify.Checkout.step !== 'payment_method' && !existingRedeemForm) {
      injectRewardsSigninPrompt(giftCardForm || shopifyDiscountForm);
    }
  });

  if (window?.theme?.giftCard?.enabled && Shopify.Checkout.step === 'payment_method') {
    const discountForms = document.querySelectorAll('.order-summary__section--discount');
    const tagsLists = document.querySelectorAll('.tags-list');
    tagsLists.forEach((list) => {
      list.remove();
    });
    discountForms.forEach((form) => {
      form.remove();
    });
    const productSummaryList = document.querySelector('.order-summary__section--product-list');
    const hiddenFormsMesssageEl = document.querySelector('.order-summary__hidden-forms-message');

    const hiddenStuffMessage = `<div class="order-summary__section order-summary__hidden-forms-message"><p>To add or remove discounts, gift cards, and rewards please return to the <a href="${window.location.origin}${window.location.pathname}?step=shipping_method">Shipping</a> step.</p></div>`;
    if (!hiddenFormsMesssageEl) {
      productSummaryList.insertAdjacentHTML('afterend', hiddenStuffMessage);
    }
  }

  if (window.theme?.rewards?.enabled && window.theme?.customerId) {
    addRewardsBalancesToRedeemForms(redeemForms);
  }

  /*
    Add handlers to the remove gift card tags like [...1234 X]
  */
  Array.from(document.querySelectorAll('[name*="checkout[applied_gift_cards]"]'))
    .filter(({name}) => name.endsWith('[id]'))
    .forEach((removeGiftCardInput, index) => {
      const removeGiftCardForm = removeGiftCardInput.closest('form');
      if (removeGiftCardForm) {
        removeGiftCardForm.addEventListener(
          'submit',
          makeHandleRemoveGiftCard({
            position: index,
            removeGiftCardInput,
            removeGiftCardForm,
          })
        );
      }
    });

  // initialise getShopifyCheckoutInformations internal cache
  getShopifyCheckoutInformation();
}

/**
 * @function injectGiftCardFormIntoDOM - adds the depicted form into the DOM
 *
 * Gift Card / Voucher
 * +---------------------------------+
 * | Gift Card number                |
 * +---------------------------------+
 * +--------------------+ +----------+
 * |  Pin               | |  Apply   |
 * +--------------------+ +----------+
 *
 * @param {Element} discountForm - the discount form after which to inject the form
 *
 * @returns {Element} the gift cards form element just injected
 */
function injectGiftCardFormIntoDOM(discountForm) {
  return injectFormIntoDOM(
    discountForm,
    `
<form id="giftCardForm">
  <div class="fieldset fieldset--giftcard-code">
    <h5>${window.theme.giftCard.title}</h5>
    <div class="field">
      <div class="field__input-wrapper">
        <label class="field__label field__label--visible" for="${GIFT_VOUCHER_FORM.voucherNumberFieldName}">
          ${window.theme.giftCard.cardNumberLabel}
        </label>
        <input
          placeholder="${window.theme.giftCard.cardNumberLabel}"
          class="field__input"
          autocomplete="off"
          aria-required="true"
          size="4"
          type="text"
          name="${GIFT_VOUCHER_FORM.voucherNumberFieldName}"
          id="${GIFT_VOUCHER_FORM.voucherNumberFieldName}"
        >
      </div>
    </div>
    <div class="field">
      <div class="field__input-btn-wrapper">
        <div class="field__input-wrapper">
          <label class="field__label field__label--visible" for="${GIFT_VOUCHER_FORM.voucherPinFieldName}">
            ${window.theme.giftCard.pinLabel}
          </label>
          <input
            placeholder="${window.theme.giftCard.pinLabel}"
            class="field__input"
            autocomplete="off"
            aria-required="true"
            size="4"
            type="text"
            name="${GIFT_VOUCHER_FORM.voucherPinFieldName}"
            id="${GIFT_VOUCHER_FORM.voucherPinFieldName}"
          >
        </div>
        <button
          type="submit"
          id="submit_giftcard"
          class="field__input-btn btn ${SHOPIFY_CHECKOUT.btnDisabledClass}"
          disabled="disabled"
        >
          <span class="btn__content visually-hidden-on-mobile" aria-hidden="true">${window.theme.giftCard.applyBtn}</span>
          <svg class="icon-svg icon-svg--size-16 btn__icon shown-on-mobile" aria-hidden="true" focusable="false">
            <use xlink:href="#arrow"></use>
          </svg>
          <svg class="icon-svg icon-svg--size-18 btn__spinner icon-svg--spinner-button" aria-hidden="true" focusable="false">
            <use xlink:href="#spinner-button"></use>
          </svg>
        </button>
      </div>
      <p class="field__message field__message--error field__message--gift-card-error" id="${GIFT_VOUCHER_FORM.errorMessageId}"></p>
    </div>
  </div>
</form>
`
  );
}

/**
 * @function injectRewardsFormIntoDOM - adds the depicted form into the DOM
 *
 * Redeem Rewards
 * +--------------------+ +----------+
 * | Amount to redeem   | | Redeem   |
 * +--------------------+ +----------+
 *
 * @param {Element} preceedingForm - gift card form, or if gift cards is disabled, the discount form
 *
 * @returns {Element} the rewardsForm element just injected
 */
function injectRewardsFormIntoDOM(preceedingForm) {
  return injectFormIntoDOM(
    preceedingForm,
    `<form id="redeemForm" class="hide">
  <div class="fieldset fieldset--redeem-code">
    <h5>${window.theme.rewards.title}</h5>
    <p class="small ${REDEEM_FORM.balanceClass}"></p>
    <div class="field">
      <div class="field__input-btn-wrapper">
        <div class="field__input-wrapper">
          <label class="field__label field__label--visible" for="checkout_security_code">${window.theme.rewards.inputLabel}</label>
          <input
            placeholder="${window.theme.rewards.inputLabel}"
            class="field__input"
            autocomplete="off"
            aria-required="true"
            size="4"
            step="0.01"
            type="number"
            name="${REDEEM_FORM.amountFieldName}"
            id="${REDEEM_FORM.amountFieldName}"
          >
        </div>
        <button
          type="submit"
          id="submit_redeem"
          class="field__input-btn btn btn--disabled"
          aria-busy="false"
          disabled="disabled"
        >
          <span class="btn__content visually-hidden-on-mobile" aria-hidden="true">${window.theme.rewards.redeemBtn}</span>
          <svg class="icon-svg icon-svg--size-16 btn__icon shown-on-mobile" aria-hidden="true" focusable="false"> <use xlink:href="#arrow"></use> </svg>
          <svg class="icon-svg icon-svg--size-18 btn__spinner icon-svg--spinner-button" aria-hidden="true" focusable="false"> <use xlink:href="#spinner-button"></use> </svg>
        </button>
      </div>
      <p
        class="field__message field__message--error field__message--gift-card-error"
        id="${REDEEM_FORM.errorMessageId}"
      ></p>
    </div>
  </div>
<form>`
  );
}

/**
 * @function injectFormIntoDOM - generic helper that inserts the provided form
 * html into the DOM and returns the element. Also blocks Shopify's scripts from
 * messing with the submit buttons of these forms.
 *
 * @param {Element} preceedingForm - the preceeding form next to which to add the form html
 * @param {string}  formHtml       - form html
 *
 * @returns {Element} the inserted `form` element.
 */
function injectFormIntoDOM(preceedingForm, formHtml) {
  preceedingForm.insertAdjacentHTML('afterend', formHtml);

  const insertedForm = preceedingForm.nextElementSibling;

  // Block Shopifys script disabling these forms' buttons when the discount form input content is removed.
  const submitButton = insertedForm.querySelector('[type="submit"]');
  submitButton[REPLACEMENT_SET_ATTR_METHOD_NAME] = submitButton.setAttribute;
  submitButton.setAttribute = () => {};

  return insertedForm;
}

/**
 * @function makeHandleGiftCardSubmit - returns a form handler with reference to the nearby discountForm
 *
 * @param {Element} discountForm
 *
 * @returns {function} handleGiftCardSubmit - form handler
 */
const makeHandleGiftCardSubmit = (discountForm) => async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const giftCardForm = e.target;
  const giftCardFormData = Object.fromEntries(new FormData(giftCardForm));
  const {voucherNumber, voucherPin} = giftCardFormData;

  if (voucherNumber?.length <= 1 || voucherPin?.length <= 1) {
    return false;
  }

  setLoading(giftCardForm);

  let reservation;
  try {
    reservation = await api.reserveGiftCard(giftCardFormData);
  } catch (error) {
    return handleGiftCardError(giftCardForm, error.message);
  }

  if (reservation.giftCardCode) {
    applyShopifyGiftCard(reservation.giftCardCode, discountForm);
  }
};

/**
 * @function makeHandleRedeemSubmit - returns a form handler with reference to the nearby discountForm
 *
 * @param {Element} discountForm
 *
 * @returns {function} handleRedeemSubmit - form handler
 */
const makeHandleRedeemSubmit = (discountForm) => async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const redeemForm = e.target;
  const redeemFormData = Object.fromEntries(new FormData(redeemForm));
  const {[REDEEM_FORM.amountFieldName]: amount, [REDEEM_FORM.hiddenBalanceFieldName]: available} = redeemFormData;

  if (!amount) {
    return false;
  }

  if (Number(amount) > Number(available)) {
    return handleRedeemError(redeemForm, window.theme.rewards.insufficientBalance);
  }

  setLoading(redeemForm);

  let reservation;
  try {
    reservation = await api.reserveRewards({amount});
  } catch (error) {
    return handleRedeemError(redeemForm, error.message);
  }

  if (reservation.giftCardCode) {
    applyShopifyGiftCard(reservation.giftCardCode, discountForm);
  }
};

/**
 * @function addRewardsBalancesToRedeemForms
 *
 * @param {Element[]} redeemForms - all redeemForms on the page.
 */
async function addRewardsBalancesToRedeemForms(redeemForms) {
  try {
    const {balance} = await getRewardsInfo();

    redeemForms.forEach((form) => {
      form.classList.remove('hide');
      form.querySelector(`#${REDEEM_FORM.amountFieldName}`).setAttribute('max', balance);
      form.insertAdjacentHTML(
        'beforeend',
        `<input type="hidden" name=${REDEEM_FORM.hiddenBalanceFieldName} value=${balance} />`
      );
      form.querySelector(REDEEM_FORM.balanceSelector).textContent = `${window.theme.rewards.balanceTitle} ${formatMoney(
        balance,
        window.theme.moneyFormatWithoutCurrency
      )}`;
    });
  } catch (error) {
    window.console.error(error, error?.message);
  }
}

/**
 * @function injectRewardsSigninPrompt
 *
 * @param {Element} preceedingForm - form after which to inject the prompt
 */
function injectRewardsSigninPrompt(preceedingForm) {
  preceedingForm.insertAdjacentHTML(
    'afterend',
    `<div class="rewards-sign-in-prompt">
      ${window.theme.rewards.signInPromptHTML.replace(
        '"/account/login"',
        // find existing link which includes checkout_url and confirmation key params and copy it's href
        document.querySelector('[href*="account/login?checkout_url="]').getAttribute('href')
      )}
    </div>`
  );
}

/**
 * @function handleGiftCardFormInput - updates submit button status according to the form input state
 *
 * @param {InputEvent} - event
 */
const handleGiftCardFormInput = (e) => {
  const form = e.target.closest('form');
  const formSubmitBtn = form.querySelector('button[type="submit"]');
  const {
    [GIFT_VOUCHER_FORM.voucherNumberFieldName]: voucherNumber,
    [GIFT_VOUCHER_FORM.voucherPinFieldName]: voucherPin,
  } = Object.fromEntries(new FormData(form));

  if (voucherNumber?.length > 0 && voucherPin?.length > 0) {
    formSubmitBtn.removeAttribute('disabled');
    formSubmitBtn.classList.remove(SHOPIFY_CHECKOUT.btnDisabledClass);
  } else {
    formSubmitBtn[REPLACEMENT_SET_ATTR_METHOD_NAME]('disabled', 'disabled');
    formSubmitBtn.classList.add(SHOPIFY_CHECKOUT.btnDisabledClass);
  }
};

/**
 * @function handleRedeemFormInput - updates submit button status according to the form input state
 *
 * @param {InputEvent} - event
 */
const handleRedeemFormInput = (e) => {
  const form = e.target.closest('form');
  const formSubmitBtn = form.querySelector('button[type="submit"]');
  const {[REDEEM_FORM.amountFieldName]: amount} = Object.fromEntries(new FormData(form));

  if (amount) {
    formSubmitBtn.removeAttribute('disabled');
    formSubmitBtn.classList.remove(SHOPIFY_CHECKOUT.btnDisabledClass);
  } else {
    formSubmitBtn[REPLACEMENT_SET_ATTR_METHOD_NAME]('disabled', 'disabled');
    formSubmitBtn.classList.add(SHOPIFY_CHECKOUT.btnDisabledClass);
  }
};

/**
 * @function setLoading - sets a forms submit button to loading state
 *
 * @param {Element} form
 */
const setLoading = (form) => {
  const submitButton = form.querySelector('[type="submit"]');
  if (submitButton) {
    submitButton.classList.add(SHOPIFY_CHECKOUT.btnLoadingClass);
    submitButton.classList.add(SHOPIFY_CHECKOUT.btnDisabledClass);
    submitButton[REPLACEMENT_SET_ATTR_METHOD_NAME]('aria-busy', 'true');
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
    submitButton.classList.remove(SHOPIFY_CHECKOUT.btnLoadingClass);
    submitButton[REPLACEMENT_SET_ATTR_METHOD_NAME]('aria-busy', 'false');
  }
};

/**
 * @function handleGiftCardError - adds error markers to each form field, stops loading & displays form message.
 *
 * @param {Element} form          - giftCard Form
 * @param {string}  errorMessage  - error message returned via the gift card reservation api
 */
function handleGiftCardError(form, errorMessage) {
  setErrorOnInputField(form.querySelector(`#${GIFT_VOUCHER_FORM.voucherNumberFieldName}`));
  setErrorOnInputField(form.querySelector(`#${GIFT_VOUCHER_FORM.voucherPinFieldName}`));
  setNotLoading(form);
  form.querySelector(`#${GIFT_VOUCHER_FORM.errorMessageId}`).innerHTML = errorMessage;
}

/**
 * @function handleRedeemError - adds error markers to each form field, stops loading & displays form message.
 *
 * @param {Element} form          - giftCard Form
 * @param {string}  errorMessage  - error message returned via the gift card reservation api
 */
function handleRedeemError(form, errorMessage) {
  setErrorOnInputField(form.querySelector(`#${REDEEM_FORM.amountFieldName}`, REDEEM_FORM.errorMessageId));
  setNotLoading(form);
  form.querySelector(`#${REDEEM_FORM.errorMessageId}`).innerHTML = errorMessage;
}

/**
 * @function setErrorOnInputField - helper to set an inputs field to the error state on a shopify checkout form
 *
 * @param {Element} input
 */
const setErrorOnInputField = (input, describedBy = GIFT_VOUCHER_FORM.errorMessageId) => {
  if (!input) return;
  const field = input.closest('.field');
  input.setAttribute('aria-describedby', describedBy);
  input.setAttribute('aria-invalid', 'true');
  field.classList.add(SHOPIFY_CHECKOUT.fieldErrorClass);
};

/**
 * @function applyShopifyGiftCard - having resolved a shopify gift card code
 * from the custom gift card api, we can now submit Shopify's discount code form.
 *
 * @param {string}  cardCode      - the shopify gift voucher code
 * @param {Element} discountForm  - the shopify discount/gift voucher form
 */
function applyShopifyGiftCard(cardCode, discountForm) {
  discountForm.querySelector(SHOPIFY_CHECKOUT.discountInputSelector).name = '';

  const hiddenField = document.createElement('input');
  hiddenField.setAttribute('type', 'hidden');
  hiddenField.setAttribute('name', SHOPIFY_CHECKOUT.discountFieldName);
  hiddenField.setAttribute('value', cardCode);

  discountForm.appendChild(hiddenField);
  discountForm.submit();
}

/**
 * @function makeHandleRemoveGiftCard - returns a click handler for removing the
 * gift card tags like [...1234 X].
 *
 * @param {string}  position             - the zero based index position of this tag visually
 * @param {string}  removeGiftCardInput  - The hidden ending in [id] inside this tags form
 * @param {Element} removeGiftCardForm   - the shopify form that surrounds the
 *                                         applied gift card tags for removing them on submit.
 *
 * @return {function}
 */
const makeHandleRemoveGiftCard =
  ({position, removeGiftCardInput, removeGiftCardForm}) =>
  (e) => {
    // sync
    e.preventDefault();
    e.stopPropagation();

    // async
    releaseGiftCard({position, removeGiftCardForm, removeGiftCardInput});
  };

async function releaseGiftCard({position, removeGiftCardForm, removeGiftCardInput}) {
  try {
    const {gift_cards: giftCards} = await getShopifyCheckoutInformation();
    if (!giftCards) {
      throw new Error();
    }

    const {presentment_amount_used: amount, last_characters: lastFourDigits} = findRelatedGiftCard({
      giftCards,
      position,
      removeGiftCardInput,
    });

    await api.releaseGiftCard({amount, lastFourDigits});
  } catch (error) {
    /*
     Do nothing - requirement is:
      "Just delete regardless of what the API returns. Comestri can error
      handle and trigger a manual check on the business side. It would be a
      poor experience to see an error here as a customer".
   */
  } finally {
    removeGiftCardForm.submit();
  }
}

/**
 * @functon findRelatedGiftCard - finds the giftCard information returned from
 * /wallets/checkouts based on the text and position of a tag [... A3B2 X].
 *
 * Note: We can assume the DOM order of the displayed gift cards will match
 * those returned by wallets/checkouts json, or we could assume that the DOM
 * structure for finding a gift cards last four digits won't change, but we
 * simply assume both. This is more brittle, but it also increases confidence we
 * have the right one when it works.
 *
 * @param {object[]} giftCards - as returned from the /wallets/checkouts response
 * @param {number}   position  - zero based position of the tag in the dom
 * @param {Element}  removeGiftCardInput - input element of the tags form that ends in [id].
 *
 * @returns
 */
function findRelatedGiftCard({giftCards, position, removeGiftCardInput}) {
  const expectedLastFourDigits = removeGiftCardInput
    .closest('.tag__wrapper')
    .querySelector('.reduction-code svg ~ *')
    .textContent.slice(-4)
    .toLowerCase();

  // This approach means that the position in the DOM and the resolved last 4 digits from the DOM element match.
  if (giftCards[position].last_characters === expectedLastFourDigits) {
    return giftCards[position];
  }

  // If we get here Shopify has probably changed something (e.g. DOM structure
  // or wallets/checkouts json structure). By passing empty data here it will
  // result in bad requests, which will prompt Seafolly backend to investigate.
  return {};
}

/**
 * @function getShopifyCheckoutInformation - the first time this is called, it will
 * fetch the checkout data from the (undocumented?) /wallets/checkouts json endpoint.
 * Subsequent calls wills simply auto resolve with the cached response.
 *
 * @return {Promise<object>}
 */
const getShopifyCheckoutInformation = (() => {
  let checkoutInformation;

  return async () => {
    if (checkoutInformation) {
      return checkoutInformation;
    }

    try {
      const response = await fetch(`/wallets/checkouts/${window.Shopify.Checkout.token}.json`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'x-shopify-checkout-authorization-token': document.head.querySelector(
            '[name=shopify-checkout-authorization-token][content]'
          ).content,
        },
      });
      // eslint-disable-next-line require-atomic-updates
      checkoutInformation = (await response.json()).checkout;
    } catch (error) {
      window.console.error(error);
    }
  };
})();

/**
 * @function moveShopifyGiftCardErrors - an unlikely scenario but if they hit:
 * +--------------------++-----------+
 * | Discount Code      ||  Apply    |
 * +--------------------++-----------+
 * This gift card has already been applied to your order
 *
 * Then we wish to move it to below gift voucher form.
 */
function moveShopifyGiftCardErrors(discountForm, giftCardForm) {
  const errorMessage = discountForm.querySelector(SHOPIFY_CHECKOUT.reductionCodeErrorMessageSelector);
  const field = errorMessage?.closest('.field');

  if (
    field?.classList.contains(SHOPIFY_CHECKOUT.fieldErrorClass) &&
    errorMessage.textContent.match(/[Gg]ift [Cc]ard/) &&
    !errorMessage.textContent.match(/[Dd]iscount/)
  ) {
    field.classList.remove(SHOPIFY_CHECKOUT.fieldErrorClass);
    handleGiftCardError(giftCardForm, errorMessage.textContent);
  }
}

init();
