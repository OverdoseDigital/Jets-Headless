const lazyImageLoader = () => {
  const supportsLoadingLazy = 'loading' in HTMLImageElement.prototype;

  const updateImage = (image) => {
    if (supportsLoadingLazy === false) {
      image.classList.add('lazyload');
    } else {
      if (image.dataset.srcset) {
        image.srcset = image.dataset.srcset;
        image.removeAttribute('data-srcset');
      }
      if (image.dataset.src) {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
      }

      if (!(image?.parentElement?.tagName === 'PICTURE')) return;
      const picture = image.parentElement;
      const sources = picture.querySelectorAll('source[data-srcset]');
      sources.forEach((source) => {
        source.srcset = source.dataset.srcset;
        source.removeAttribute('data-srcset');
      });
    }
  };

  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach((image) => updateImage(image));

  const handleMutation = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === 'IMG' && node.loading === 'lazy') {
          updateImage(node);
          return;
        }
        if (node.hasChildNodes() === false) return;
        const nestedImages = node.querySelectorAll('img[loading="lazy"]');
        nestedImages.forEach((imageNode) => updateImage(imageNode));
      });
    });
  };

  const mutationObserver = new MutationObserver(handleMutation);
  mutationObserver.observe(document, {
    childList: true,
    subtree: true,
  });

  if (!supportsLoadingLazy) {
    const url = window?.theme?.urlPatterns?.assetUrl?.replace('_name_.js', 'lazysizes-custom.js');
    if (url) {
      const script = document.createElement('script');
      script.src = url;
      document.head.appendChild(script);
    }
  }
};

export default lazyImageLoader;
