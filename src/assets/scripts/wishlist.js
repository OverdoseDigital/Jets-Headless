const WISHLIST_FETCHED_EVT_NAME = 'wishlistItemsFetched';

/**
 * @function triggerWishlistRequest - Adds a function to the SwymCallbacks queue to be exectued once swym is loaded on the page.
 */
const triggerWishlistRequest = (fn) => {
  if (!window.SwymCallbacks) {
    window.SwymCallbacks = [];
  }
  window.SwymCallbacks.push(fn);
};

/**
 * @function addToWishList - Adds a setting to the wishlist.
 *
 * @returns {Promise}
 */
const addToWishList = (product) =>
  new Promise((resolve, reject) => {
    triggerWishlistRequest(() =>
      window._swat.addToWishList(
        product,
        (response) => {
          resolve(response);
          if (window.wishlistItems) {
            window.wishlistItems.push(response);
            document.dispatchEvent(new Event(WISHLIST_FETCHED_EVT_NAME));
          }
        },
        (error) => {
          reject(error);
        }
      )
    );
  });

/**
 * @function removeFromWishList - Removes a setting from the wishlist.
 *
 * @returns {Promise}
 */
const removeFromWishList = (product) =>
  new Promise((resolve, reject) => {
    triggerWishlistRequest(() =>
      window._swat.removeFromWishList(
        product,
        (response) => {
          resolve(response);
          if (window.wishlistItems) {
            const updatedWishlistItems = window.wishlistItems.filter(
              (item) => Number(item.epi) !== Number(response.epi)
            );
            window.wishlistItems = updatedWishlistItems;
            document.dispatchEvent(new Event(WISHLIST_FETCHED_EVT_NAME));
          }
        },
        (error) => {
          reject(error);
        }
      )
    );
  });

/**
 * @function fetchWishlistItems - Fetches all setting wishlist items
 *
 * @returns {Promise<wishlistItem[]>}
 */
const fetchWishlistItems = () => new Promise((resolve) => triggerWishlistRequest(() => window._swat.fetch(resolve)));

/**
 * @function initWishlist - fetches wishlist items, assigns them to
 * window.wishlistItems, and dispatches an event to notify completion.
 */
const initWishlist = async () => {
  setSiteHeaderWishlistIconsStatus();
  const wishlistItems = await fetchWishlistItems();
  window.wishlistItems = wishlistItems;

  document.dispatchEvent(new Event(WISHLIST_FETCHED_EVT_NAME));
};

/**
 * @function setSiteHeaderWishlistIconsStatus - fills or hollows the page header
 * wishlist link icon depending on whether wishlist items were resolved (see
 * initWishlist above).
 */
const setSiteHeaderWishlistIconsStatus = () => {
  document.addEventListener(WISHLIST_FETCHED_EVT_NAME, () => {
    const wishlistLinks = document.querySelectorAll('[data-wishlist-link]');
    if (wishlistLinks && window.wishlistItems?.length > 0) {
      wishlistLinks.forEach((link) => link.classList.add('icon-animate'));
    } else {
      wishlistLinks.forEach((link) => link.classList.remove('icon-animate'));
    }
  });
};

export {addToWishList, removeFromWishList, fetchWishlistItems, initWishlist, WISHLIST_FETCHED_EVT_NAME};
