import {fetchWishlistItems, removeFromWishList} from '../wishlist';
import hydrateProductCard, {PRODUCT_CARD_SELECTOR} from '../components/product-card';

const gridWrapper = document.querySelector('.wishlist-container');

const SELECTORS = {
  wishlistItems: '.wishlist__items',
  addAllToCartBtn: '[data-wishlist-add-all]',
};

document.addEventListener('DOMContentLoaded', async () => {
  const wishlistItems = await fetchWishlistItems();
  const addAllToCart = document.querySelector(SELECTORS.addAllToCartBtn);
  const itemsWrapper = gridWrapper.querySelector(SELECTORS.wishlistItems);
  const rootUrl = window.theme.locale?.primary ? '' : window.theme.locale.rootUrl;

  const productCardPromises = wishlistItems.map(async (item) => {
    const handle = item.du.split('products/')[1];
    const url = `${rootUrl}/products/${handle}?view=wishlist&variant=${item.epi}`;
    const response = await fetch(url);

    if (response.ok === false) {
      return;
    }
    const data = await response.text();
    if (data.includes('data-wishlist-selected-variant-exists="false"')) return false;
    if (itemsWrapper) {
      itemsWrapper.insertAdjacentHTML('beforeend', data);
    }

    const productCard = itemsWrapper.querySelector(`[data-selected-variant-id="${item.epi}"]`);
    if (productCard) {
      productCard.parentNode.classList.add(
        productCard.dataset.wishlistVariantAvailable === 'true' ? 'is-available' : 'is-unavailable'
      );
      hydrateProductCard(productCard);
    }

    return productCard;
  });

  Promise.all(productCardPromises)
    .then(setAvailableCounts)
    .catch(() => window.console.error('Some wishlist items could not be resolved'));

  if (addAllToCart) {
    const addLabel = window.theme?.strings?.addAllToCart || 'Add all to bag';
    const addingLabel = window.theme?.strings?.addingAllToCart || 'Adding all to bag...';

    addAllToCart.addEventListener('click', async () => {
      const cardElements = Array.from(
        document.querySelectorAll(`.wishlist__item.is-available ${PRODUCT_CARD_SELECTOR}`)
      );

      const {addToCartItems, removeFromWishlistItems} = wishlistItems.reduce(
        (acc, item) => {
          // wishlistItems is initiated when the page loaded - it could be stale
          // if the user has already added some wishlist items individually, and
          // some wishlist items also may not have stock, so we filter by what's
          // available according to the DOM.
          if (cardElements.some(({dataset}) => dataset.selectedVariantId === String(item.epi))) {
            acc.addToCartItems.push({id: item.epi, quantity: 1});
            acc.removeFromWishlistItems.push(item);
          }
          return acc;
        },
        {addToCartItems: [], removeFromWishlistItems: []}
      );

      addAllToCart.innerHTML = addingLabel;

      await window.sideCart.handleAddToCartEvent(addToCartItems, true, () => {
        const removals = removeFromWishlistItems.map(async (item) => {
          await removeFromWishList(item);
        });

        addAllToCart.innerHTML = addLabel;

        Promise.all(removals)
          .then(() => {
            document.querySelectorAll('.wishlist__item.is-available').forEach((el) => el.remove());
            setAvailableCounts();
          })
          .catch((err) => window.console.error('Failed to remove all wishlist items', err));
      });
    });
  }
});

function setAvailableCounts(promiseResults = []) {
  const unResolvedCount = promiseResults.filter((result) => !result);
  gridWrapper.dataset.itemCount = window.wishlistItems.length - Number(unResolvedCount.length);
  gridWrapper.dataset.availableCount = document.querySelectorAll('.wishlist__item.is-available')?.length || 0;
}
