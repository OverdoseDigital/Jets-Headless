const removeLineItem = async (key) => {
  // Add loading class
  document.body.classList.add('cart-loading');
  const data = {
    updates: {
      [key]: 0,
    },
  };
  const url = `${
    window.theme.locale && !window.theme.locale.primary ? window.theme.locale.rootUrl : ''
  }/cart/update.js`;
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
  try {
    const response = await fetch(url, options);
    if (response.ok === false) {
      throw new Error('cart/update response was not OK');
    }
  } catch (err) {
    window.console.error(err);
  }
};

const updateVariant = async (item, selectedVariant, setVariants, setSelectedVariant, addLineItems) => {
  const newLineItem = {
    id: selectedVariant.id,
    quantity: item.quantity,
  };
  // Only add properties if they exist
  if ('properties' in item) {
    newLineItem.properties = item.properties;
  }

  await removeLineItem(item.key);

  await addLineItems(newLineItem);

  setVariants([]);
  setSelectedVariant(null);
};

export default updateVariant;
