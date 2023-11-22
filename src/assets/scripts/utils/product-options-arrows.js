const handleProductOptionsArrows = (optionsElement) => {
  if (!optionsElement) return;

  const parentEl = optionsElement.parentElement;
  const parentWidth = parentEl.offsetWidth;
  const arrowsElement = parentEl.querySelector('.product-options__arrows');
  const arrowsMarkup = `
    <div class="product-options__arrows">
      <div class="product-options__arrow--left">
        <svg aria-label="Chevron left icon" class="icon icon-chevron-left" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15,6,9,12l6,6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>
      </div>
      <div class="product-options__arrow--right">
        <svg aria-label="Chevron right icon" class="icon icon-chevron-right" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9,18l6-6L9,6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>
      </div>
    </div>
  `;

  if (optionsElement.scrollWidth > parentWidth && !arrowsElement) {
    parentEl.insertAdjacentHTML('beforeend', arrowsMarkup);
    const leftArrow = parentEl.querySelector('.product-options__arrow--left');
    const rightArrow = parentEl.querySelector('.product-options__arrow--right');
    const initialScrollOffset = optionsElement.scrollLeft;
    const scrollRightEdge = optionsElement.scrollWidth - optionsElement.offsetWidth;

    if (initialScrollOffset < 5) {
      leftArrow.style.visibility = 'hidden';
    } else if (initialScrollOffset > scrollRightEdge - 5) {
      rightArrow.style.visibility = 'hidden';
    }

    leftArrow.addEventListener('click', () => optionsElement.scrollBy(-55, 0));
    rightArrow.addEventListener('click', () => optionsElement.scrollBy(55, 0));

    optionsElement.addEventListener('scroll', () => {
      if (optionsElement.scrollLeft < 5) {
        leftArrow.style.visibility = 'hidden';
        rightArrow.style.visibility = 'visible';
      } else if (optionsElement.scrollLeft > scrollRightEdge - 5) {
        leftArrow.style.visibility = 'visible';
        rightArrow.style.visibility = 'hidden';
      } else {
        leftArrow.style.visibility = 'visible';
        rightArrow.style.visibility = 'visible';
      }
    });
  }
};

export default handleProductOptionsArrows;
