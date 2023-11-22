import {ScrollSnapArrows} from 'scroll-snap-arrows';

const handleThumbnailsArrows = (thumbsElement) => {
  if (!thumbsElement) return;

  const parentEl = thumbsElement.parentElement;
  const parentHeight = parentEl.offsetHeight;
  const arrowsElement = parentEl.querySelector('.product-thumbs__arrows');
  const arrowsMarkup = `
    <div class="product-thumbs__arrows">
      <button type="button" class="product-thumbs__arrow--up">
        <svg aria-label="Chevron up icon" class="icon icon-chevron-up" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m20 16-8-8-8 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="square" vector-effect="non-scaling-stroke"/></svg>
      </button>

      <button type="button" class="product-thumbs__arrow--down">
        <svg aria-label="Chevron down icon" class="icon icon-chevron-down" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m4 8 8 8 8-8" stroke="currentColor" stroke-width="1.2" stroke-linecap="square" vector-effect="non-scaling-stroke"/></svg>
      </button>
    </div>
  `;

  if (thumbsElement.scrollHeight > parentHeight && !arrowsElement) {
    parentEl.insertAdjacentHTML('beforeend', arrowsMarkup);

    // eslint-disable-next-line no-new
    new ScrollSnapArrows(thumbsElement);
  }
};

export default handleThumbnailsArrows;
