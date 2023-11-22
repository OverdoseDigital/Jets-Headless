export const checkGifts = (giftDetails, addLineItems, updateLineItems) => {
  if (!giftDetails) return;

  const {gifts, giftsInCart} = giftDetails;
  const qualifyingGifts = gifts.filter((gift) => gift.qualifies);
  const manuallyRemovedGifts = JSON.parse(sessionStorage.getItem('manuallyRemovedGifts')) || [];

  /**
   * Remove any gifts that are invalid
   */
  const invalidGiftsInCart = giftsInCart.filter((giftInCart) => {
    const doesNotQualify = qualifyingGifts.every(
      (qualifyingGift) => qualifyingGift.product.id !== giftInCart.product_id
    );
    const hasMultipleQuantity = giftInCart.quantity > 1;
    return doesNotQualify || hasMultipleQuantity;
  });
  if (invalidGiftsInCart.length) {
    const updates = invalidGiftsInCart.reduce((_updates, _item) => {
      _updates[_item.key] = 0;
      return _updates;
    }, {});
    return updateLineItems(updates);
  }

  /**
   * Add any gifts that qualify, aren't currently in the cart and haven't been
   * manually removed this session
   */
  const giftsToAdd = qualifyingGifts.filter((qualifyingGift) => {
    const isNotInCart = giftsInCart.every((giftInCart) => qualifyingGift.product.id !== giftInCart.product_id);
    const hasNotBeenManuallyRemoved = !manuallyRemovedGifts.includes(qualifyingGift.product.id);
    return isNotInCart && hasNotBeenManuallyRemoved;
  });
  if (giftsToAdd.length) {
    const items = giftsToAdd.map(({product}) => {
      return {
        id: product.variants[0].id,
        quantity: 1,
        properties: {
          _gwp: true,
        },
      };
    });
    return addLineItems(items);
  }
};
