import {AddressForm} from '@shopify/theme-addresses';

const SELECTORS = {
  container: '[data-register-container]',
  countryWrapper: '[data-countries-wrapper]',
  firstnameInput: '#FirstName',
  lastnameInput: '#LastName',
  emailInput: '#Email',
  passwordInput: '#CreatePassword',
  passwordLengthError: '[data-password-error]',
  birthDayInput: '#birth_day',
  birthMonthInput: '#birth_month',
  form: 'form',
  submitButton: '[type="submit"]',
  noLabelsFix: '[data-nolabel-fix]',
  birthdayHiddenInput: '[data-birthday]',
};

const FORM_KEYS = {
  email: 'customer[email]',
  firstName: 'customer[first_name]',
  lastName: 'customer[last_name]',
  password: 'customer[password]',
  countryCode: 'country_code',
  birthDay: 'birth_day',
  birthMonth: 'birth_month',
};

const INVALID_DATES = ['30-02', '31-02', '31-04', '31-06', '31-09', '31-11'];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector(SELECTORS.container);

  populateCountries(container);
  addFormSubmission(container);
  prefillEmail(container);
  populateHiddenBirthday(container);
});

/**
 * @function addFormSubmission - validate and send to Klaviyo before proceeding to
 * shopify form submission.
 *
 * @param {Element} container - base element all further selector queries
 */
function addFormSubmission(container) {
  const form = container.querySelector(SELECTORS.form);

  form.addEventListener('submit', async (event) => {
    const [passwordInput, passwordLengthError, dayInput, monthInput, ...requiredInputs] = [
      SELECTORS.passwordInput,
      SELECTORS.passwordLengthError,
      SELECTORS.birthDayInput,
      SELECTORS.birthMonthInput,
      SELECTORS.firstnameInput,
      SELECTORS.lastnameInput,
      SELECTORS.emailInput,
    ].map((selector) => container.querySelector(selector));

    event.preventDefault();

    showOrHideValidations(requiredInputs, passwordInput, passwordLengthError, dayInput, monthInput);

    if (formIsValid(requiredInputs, passwordInput, dayInput, monthInput)) {
      const submitButton = container.querySelector(SELECTORS.submitButton);
      submitButton.setAttribute('disabled', true);
      submitButton.value = 'Creating your account...';

      await sendToKlaviyo(container.dataset.klaviyoCustomerListId, form);
      form.submit();
    }
  });
}

/**
 * @function sendToKlaviyo - Before submitting the registration to Shopify we
 * attempt to add the customer to the Klaviyo with custom attributes not stored
 * by shopify.
 *
 * @param {string}  listId     - which subscriber list are we sending this too?
 * @param {Element} form       - form element
 * @param {number}  retryCount - defaults to 0. We'll try up to three times to send this to Klaviyo.
 *
 * @reurns {void}
 */
async function sendToKlaviyo(listId, form, retryCount = 1) {
  const formData = Object.fromEntries(new FormData(form));
  let response;

  if (!listId) {
    reportKlaviyoSubmissionFailure(form, formData);
    return;
  }

  try {
    response = await fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'cache-control': 'no-cache',
      },
      body: new URLSearchParams(
        Object.entries({
          g: listId,
          email: formData[FORM_KEYS.email],
          // pass in additional fields
          $fields: '$source, $first_name, $last_name, $birthday, $countryCode',
          $source: 'Account Creation',
          $first_name: formData[FORM_KEYS.firstName],
          $last_name: formData[FORM_KEYS.lastName],
          $birthday: formatBirthday(formData),
          $countryCode: formData[FORM_KEYS.countryCode],
        })
      ).toString(),
    });
  } catch (error) {
    window.console.error(error);
  }

  if (!response || !response.ok) {
    if (retryCount < 3) {
      await sendToKlaviyo(listId, form, retryCount + 1);
    } else {
      reportKlaviyoSubmissionFailure(form, formData);
    }
  }
}

/**
 * @function reportKlaviyoSubmissionFailure - adds a note to the customer
 * regarding the failure to create a Klaviyo record
 *
 * @param {Element} form
 * @param {FormData} formData
 */
function reportKlaviyoSubmissionFailure(form, formData) {
  const note = document.createElement('input');
  note.setAttribute('name', 'customer[note][signup_error]');
  note.style.display = 'none';
  note.setAttribute(
    'value',
    `This customer was unsuccessfully submitted to Klaviyo with the following additional information: \n - $birthday: ${formatBirthday(
      formData
    )} \n - $countryCode: ${formData[FORM_KEYS.countryCode]}`
  );
  form.appendChild(note);
}

/**
 * @function showOrHideValidations - shows/hides validations to the user
 *
 * @param {Element[]} requiredInputs - array of all inputs that must have a value
 * @param {Element}   passwordInput
 * @param {Element}   passwordLengthError
 * @param {Element}   dayInput
 * @param {Element}   monthInput
 */
function showOrHideValidations(requiredInputs, passwordInput, passwordLengthError, dayInput, monthInput) {
  // Make sure password exists and is long enough
  if (!passwordInput.value) {
    passwordInput.classList.add('input-error');
    passwordInput.nextElementSibling.classList.remove('hide');
    passwordLengthError.classList.add('hide');
  } else if (passwordInput.value.length < 5) {
    passwordInput.classList.add('input-error');
    passwordInput.nextElementSibling.classList.add('hide');
    passwordLengthError.classList.remove('hide');
  } else {
    passwordInput.classList.remove('input-error');
    passwordInput.nextElementSibling.classList.add('hide');
    passwordLengthError.classList.add('hide');
  }

  // tedium
  if (dayInput.value && !monthInput.value) {
    dayInput.classList.remove('input-error');
    monthInput.classList.add('input-error');
    dayInput.parentElement.nextElementSibling.classList.remove('hide');
  } else if ((!dayInput.value && monthInput.value) || INVALID_DATES.includes(`${dayInput.value}-${monthInput.value}`)) {
    dayInput.classList.add('input-error');
    monthInput.classList.remove('input-error');
    dayInput.parentElement.nextElementSibling.classList.remove('hide');
  } else {
    dayInput.classList.remove('input-error');
    monthInput.classList.remove('input-error');
    dayInput.parentElement.nextElementSibling.classList.add('hide');
  }

  requiredInputs.forEach((input) => {
    if (input.value) {
      input.classList.remove('input-error');
      input.nextElementSibling.classList.add('hide');
    } else {
      input.classList.add('input-error');
      input.nextElementSibling.classList.remove('hide');
    }
  });
}

/**
 * @function formIsValid - whether the form as a whole is ready for submission.
 *
 * @param {Element[]} requiredInputs - array of all inputs that must have a value
 * @param {Element}   passwordInput
 * @param {Element}   dayInput
 * @param {Element}   monthInput
 *
 * @returns {boolean}
 */
const formIsValid = (requiredInputs, passwordInput, dayInput, monthInput) =>
  requiredInputs.every(({value}) => Boolean(value)) &&
  passwordInput.value &&
  passwordInput.value.length >= 5 &&
  ((dayInput.value && monthInput.value) || (!dayInput.value && !monthInput.value)) &&
  !INVALID_DATES.includes(`${dayInput.value}-${monthInput.value}`);

/**
 * @function populateCountries - uses shopify scripts to insert the stores
 * country list into the form DOM.
 *
 * @param {Element} container - base element all further selector queries
 */
async function populateCountries(container) {
  const addressFields = container.querySelector(SELECTORS.countryWrapper);
  const countryField = addressFields.querySelector('#AddressCountry');

  try {
    await AddressForm(addressFields, window.theme.locale.isoCode, {
      shippingCountriesOnly: addressFields.dataset.limitCountries === 'true',
      inputSelectors: {
        country: '#AddressCountry',
        // shopify scripts blow up if an element with labels property isn't found ):.
        lastName: SELECTORS.noLabelsFix,
        firstName: SELECTORS.noLabelsFix,
        company: SELECTORS.noLabelsFix,
        address1: SELECTORS.noLabelsFix,
        address2: SELECTORS.noLabelsFix,
        zone: SELECTORS.noLabelsFix,
        postalCode: SELECTORS.noLabelsFix,
        city: SELECTORS.noLabelsFix,
        phone: SELECTORS.noLabelsFix,
      },
    });

    // If user's country couldn't be selected in dropdown (blank dropdown)
    if (!countryField.value) {
      populateCountriesFallback(countryField);
    }

  // If country couldn't be selected in dropdown (undefined country error)
  } catch (error) {
    populateCountriesFallback(countryField);
  }
}

function populateCountriesFallback(countryField) {
  if (!countryField) return;

  // Set the country based on the currency (i.e. US for USD)
  const fallback = countryField.dataset.fallback;

  // If fallback country exists in dropdown, select it
  if ([...countryField.options].map(o => o.value).includes(fallback)) {
    countryField.value = fallback;

  // Otherwise select the first country in the dropdown
  } else {
    countryField.selectedIndex = 0;
  }
}

function formatBirthday(formData) {
  return `${new Date().getFullYear()}-${formData[FORM_KEYS.birthMonth]}-${formData[FORM_KEYS.birthDay]}`;
}

function populateHiddenBirthday(container) {
  const form = container.querySelector(SELECTORS.form);
  const birthDayInput = form.querySelector(SELECTORS.birthDayInput);
  const birthMonthInput = form.querySelector(SELECTORS.birthMonthInput);
  const birthdayHiddenInput = form.querySelector(SELECTORS.birthdayHiddenInput);
  let birthDayNumber;
  let birthMonthNumber;

  form.addEventListener('change', (evt) => {
    if (evt.target === birthDayInput) {
      birthDayNumber = evt.target.options[evt.target.selectedIndex].value;
    }

    if (evt.target === birthMonthInput) {
      birthMonthNumber = evt.target.options[evt.target.selectedIndex].value;
    }

    if (!birthDayNumber || !birthMonthNumber) return;

    birthdayHiddenInput.value = `${new Date().getFullYear()}-${birthMonthNumber}-${birthDayNumber},`;
  });
}

function prefillEmail(container) {
  const emailInput = container.querySelector(SELECTORS.emailInput);
  emailInput.value = getEmailFromSubForm();
}

function getEmailFromSubForm() {
  const queryString = window.location.search;
  const parameters = new URLSearchParams(queryString);
  // Snaffles the email added via the footer subscribe form
  const value = parameters.get('email');
  return value;
}
