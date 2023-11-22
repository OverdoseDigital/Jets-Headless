const changeLineItem = async (item, rootUrl, setEditItem, setEditProduct) => {
  const url = `${rootUrl}/products/${item.handle}.js`;

  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    const response = await fetch(url, options);
    if (response.ok === false) {
      throw new Error('product response was not OK');
    }
    const product = await response.json();
    setEditProduct(product);
    setEditItem(item);
  } catch (err) {
    window.console.error(err);
  }
};

export default changeLineItem;
