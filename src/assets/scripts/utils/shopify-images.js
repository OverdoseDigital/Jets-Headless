/**
 * Replicates Shopify's `image_url` filter in js.
 * - At least one of `width` or `height` must be provided.
 * - If no `crop` is provided, it will default to `center`.
 * - `format` and `pad_color` are unsupported.
 *
 * @param {string} url - Shopify image url.
 * @param {number} [width] - Image width integer (max 5760).
 * @param {number} [height] - Image height integer (max 5760).
 * @param {('top'|'bottom'|'center'|'left'|'right')} [crop="center"] - Image crop, defaults to `center`.
 * @returns {string}
 */
export const imageUrl = (url, width, height, crop) => {
  if (!url || !(width || height)) return null;
  if (width && typeof width !== 'number') return null;
  if (height && typeof height !== 'number') return null;
  if (crop && typeof crop !== 'string') return null;

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    const currentWidth = params.get('width');
    const currentHeight = params.get('height');
    const currentCrop = params.get('crop');
    if (!height && currentHeight) params.delete('height');
    if (!width && currentWidth) params.delete('width');
    if (!crop && currentCrop) params.delete('crop');

    if (width) params.set('width', width);
    if (height) params.set('height', height);
    if (crop) params.set('crop', crop);

    return urlObj.href;
  } catch (error) {
    return null;
  }
};
