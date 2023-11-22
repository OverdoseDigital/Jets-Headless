
/**
 * @function placeRecommendationsIntoDOM - the recommendations api is called with the
 * specified section in relation to the specified product which returns a markup.
 * The selected node as per the provided selector within that response is then injected into the DOM
 * as children of the provided targetElement.
 *
 * @param {string}  productId               - the product for which recommendations are sought
 * @param {number}  limit                   - max number of recommendations to seek
 * @param {string}  sectionId               - the section that is being used to render the recommendations response
 * @param {string}  responseWrapperSelector - this selector should select the node within the section response to be inserted into the DOM.
 * @param {Element} targetElement           - the element whose children should become the recommendations response.
 *
 * @returns {boolean} true if succeeded, false otherwise.
 */
const placeRecommendationsIntoDOM = async ({
  productId,
  limit,
  sectionId,
  responseWrapperSelector,
  targetElement,
}) => {
  if (productId === '' || productId === null || productId === undefined || !targetElement) {
    return false;
  }
  const rootUrl = window.theme.locale && window.theme.locale.primary ? '' : window.theme.locale.rootUrl;
  const requestUrl = `${rootUrl}/recommendations/products?section_id=${sectionId}&limit=${limit}&product_id=${productId}`;

  try {
    const response = await fetch(requestUrl);
    if (!response.ok) {
      return false;
    }
    const data = await response.text();
    const fragment = document
      .createRange()
      .createContextualFragment(data)
      .querySelector(responseWrapperSelector);

    if (!fragment) {
      return false;
    }
    if ('replaceChildren' in HTMLElement.prototype) {
      targetElement.replaceChildren(fragment);
    } else {
      targetElement.childNodes.forEach((node) => node.remove());
      targetElement.appendChild(fragment);
    }
    return true;
  } catch (error) {
    window.console.error(error);
    return false;
  }
}

export { placeRecommendationsIntoDOM }
