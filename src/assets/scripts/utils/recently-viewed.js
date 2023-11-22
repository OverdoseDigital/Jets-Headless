
/**
 * @function saveAndFetchRecentlyViewed - saves the optionally provided productHandle into
 * the recently viewed list and/or returns the markup for the recently viewed products
 * from localstorage.
 *
 * @param {number} limit         - max number of products to fetch for display
 * @param {string} productHandle - a product handle to add to the recently viewed
 *                                 list (i.e. we're on this handles PDP now)
 *
 * @returns {string|false} the markup or an empty string/false if no markup was retrievable.
 */
const saveAndFetchRecentlyViewed = async ({
  limit = 6,
  productHandle,
}) => {
  const recentProducts = JSON.parse(localStorage.getItem('recently_viewed_products')) || [];
  let productsForDisplay = recentProducts;

  if (productHandle) {
    // store double the intended display limit - some may fail to fetch for display.
    const storageLimit = limit * 2;
    const withoutCurrent = recentProducts.filter((item) => item !== productHandle);
    const nextRecentProducts = [productHandle, ...withoutCurrent].slice(0, storageLimit);
    localStorage.setItem('recently_viewed_products', JSON.stringify(nextRecentProducts));
    productsForDisplay = withoutCurrent;
  }

  if (productsForDisplay.length === 0) {
    return false;
  }

  const probablyMarkup = await fetchRecentlyViewedProducts(productsForDisplay, limit);

  return probablyMarkup;
}

/**
 * @function fetchRecentlyViewedProducts - let's say the limit is four, then all
 * going well this reads "fetch four products in parallel, then concat the
 * reponses".
 *
 * Let's say two fail however, then we try to fetch two more in parallel:
 * recursively until there are no more to try or the original number of
 * desired good responses (four in this example) is achieved.
 *
 * @param {string[]} productHandles - array of product handles that are recently viewed candidates to display
 * @param {number}   limit          - max to display
 *
 * @returns {string} - html markup for the max available or specified limit number of products
 */
async function fetchRecentlyViewedProducts(productHandles, limit) {
  let responses = await Promise.all(productHandles.slice(0, limit).map(fetchRecentlyViewedProduct));

  const failedCount = responses.filter(isFalsey).length;

  if (failedCount) {
    const remainingToTry = productHandles.slice(limit)
    if (remainingToTry.length > 0) {
      const replacements = await fetchRecentlyViewedProducts(remainingToTry, failedCount);
      responses = responses.concat(replacements);
    }
  }

  return responses.filter(Boolean).join('');
}

/**
 * @function fetchRecentlyViewedProduct - single product fetch
 *
 * @param {string} handle - product handle to fetch using recently viewed template
 *
 * @returns {string|false}
 */
async function fetchRecentlyViewedProduct(handle) {
  const rootUrl = window.theme?.locale?.primary ? '' : window.theme?.locale?.rootUrl;

  try {
    const url = `${rootUrl}/products/${handle}?view=recently-viewed`;
    const response = await fetch(url);
    if (!response.ok) return false;
    return await response.text();
  } catch (err) {
    window.console.error(`Recently viewed product does not exist: ${handle}`);
    return false;
  }
}

function isFalsey(value) {
  return !value;
}

export { saveAndFetchRecentlyViewed }
