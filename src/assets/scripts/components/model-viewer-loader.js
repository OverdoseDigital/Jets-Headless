const featureLoader = (name, version) =>
  new Promise((resolve, reject) => {
    window.Shopify.loadFeatures(
      [
        {
          name,
          version,
          onLoad: resolve(),
        },
      ],
      (error) => {
        if (error) reject(error);
      }
    );
  });

const modelViewerLoader = async (modelViewerVersion, modelsData) => {
  try {
    await new Promise((resolve, reject) => {
      Promise.all([featureLoader('model-viewer', modelViewerVersion), featureLoader('shopify-xr', '1.0')])
        .then(resolve())
        .catch(reject());
    });
    const initModels = () => {
      window.ShopifyXR.addModels(modelsData);
      window.ShopifyXR.setupXRElements();
    };
    const waitForShopifyXR = () => {
      if (window.ShopifyXR?.addModels) return initModels();
      requestAnimationFrame(waitForShopifyXR);
    };
    if (window.ShopifyXR?.addModels) {
      initModels();
    } else {
      document.addEventListener('shopify_xr_initialized', waitForShopifyXR);
    }
  } catch (error) {
    return window.console.error('Error loading model viewer scripts', error);
  }
};

export default modelViewerLoader;
