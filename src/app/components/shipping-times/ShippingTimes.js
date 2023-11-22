import React, {useState} from 'react';
import Papa from 'papaparse';
import cx from 'classnames';

const POSTCODE_INPUT_FIELDNAME = 'shipping-postcode';
const POSTCODE_REGEX =
  window.theme.shippingTimes.shippingTimesRegion === 'AU'
    ? /^(?:(?:[2-8]\d|9[0-7]|0?[28]|0?9(?=09))(?:\d{2}))$/
    : /^\d{5}(?:-\d{4})?$/;
const CSV = window.theme.shippingTimes.shippingTimesCsv;
const DEFAULT_SHIPPING_DAYS = window.theme.strings.product.shippingTimesDefaultDays;
const MESSAGES = {
  successTemplate: window.theme.strings.product.shippingTimesMessageTemplate,
  error: window.theme.strings.product.shippingTimesErrorMessage,
  reset: window.theme.strings.product.shippingTimesReset,
};

const ShippingTimes = () => {
  const [successMessage, setSuccessMessage] = useState();
  const [formIsInvalid, setFormIsInvalid] = useState(false);

  if (!CSV) return null;

  const handleFormSubmit = makeHandleFormSubmit({setSuccessMessage, setFormIsInvalid});
  const resetForm = () => setSuccessMessage(null);

  return (
    <div className="shipping-times">
      <h5 className="h6 text-center">{window.theme.strings.product.shippingTimesTitle}</h5>
      {successMessage ? (
        <>
          <p>{successMessage}</p>
          <button type="button" className="btn__text" onClick={resetForm}>
            {MESSAGES.reset}
          </button>
        </>
      ) : (
        <form onSubmit={handleFormSubmit}>
          <div className="form__group">
            <label htmlFor={POSTCODE_INPUT_FIELDNAME} class="visually-hidden">
              {window.theme.strings.product.shippingTimesPlaceholder}
            </label>
            <input
              type="number"
              name={POSTCODE_INPUT_FIELDNAME}
              id={POSTCODE_INPUT_FIELDNAME}
              className={cx('subscribe-form__input', {'input-error': formIsInvalid})}
              placeholder={window.theme.strings.product.shippingTimesPlaceholder}
              aria-label={window.theme.strings.product.shippingTimesPlaceholder}
              autoComplete={false}
              onChange={() => setFormIsInvalid(false)}
            />

            <button type="submit" disabled={formIsInvalid} className="btn subscribe-form__button">
              <span>{window.theme.strings.product.shippingTimesButton}</span>
            </button>
            {formIsInvalid && <p className="form__field-error">{MESSAGES.error}</p>}
          </div>
        </form>
      )}
    </div>
  );
};

/**
 * @function makeHandleFormSubmit - handleFormSubmit factory for shipping times form.
 *
 * @param {function} setSuccessMessage - react state setter
 *
 * @returns {function} formHandler
 */
const makeHandleFormSubmit =
  ({setSuccessMessage, setFormIsInvalid}) =>
  (e) => {
    e.preventDefault();

    const {[POSTCODE_INPUT_FIELDNAME]: postcode} = Object.fromEntries(new FormData(e.target));

    if (postcode.match(POSTCODE_REGEX) === null) {
      setFormIsInvalid(true);
      return;
    }

    getShippingTime(postcode, setSuccessMessage);
  };

/**
 * @function getShippingTime - uses papaparse to get the file at the CSV url and parse it.
 *
 * @param {string}   postcode             - postcode for which to get shipping times
 * @param {function} setSuccessMessage  - react state setter
 *
 * @returns void
 */
const getShippingTime = (postcode, setSuccessMessage) => {
  Papa.parse(CSV, {
    download: true,
    header: true,
    complete: (results) => {
      const allPostcodes = results.data;
      const matchingPostcode = allPostcodes.find((code) => code.postcode === postcode);
      setSuccessMessage(makeSuccessMessage(matchingPostcode ? matchingPostcode.days : DEFAULT_SHIPPING_DAYS));
    },
  });
};

/**
 * @function makeSuccessMessage
 *
 * @param {string|number} days - string or number representing the number of
 * days shipping is expected to take. This value comes directy from the
 * spreadsheet so we cannot gaurantee it's type.
 *
 * @returns {string} - success message string
 */
const makeSuccessMessage = (days) => {
  const dayWord = days === 1 || days === '1' ? 'day' : 'days';
  return MESSAGES.successTemplate.replace('{daysNumber}', days).replace('{daysWord}', dayWord);
};

ShippingTimes.propTypes = {};

export default ShippingTimes;
