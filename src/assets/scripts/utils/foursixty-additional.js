// Detects when a product is added to cart in the FourSixty popup and then updates the cart count and shows the side cart
const initFourSixtyAdditional = () => {
  window.onFoursixtyCartAdded = function(item) {
    item.quantity = 0;
    window.sideCart.handleAddToCartEvent(item, true);
  };
};

export default initFourSixtyAdditional;
