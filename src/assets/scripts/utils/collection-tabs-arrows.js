const handleCollectionTabsArrows = (tabsElement) => {
  if (!tabsElement) return;

  const parentEl = tabsElement.parentElement;
  const parentWidth = parentEl.offsetWidth;
  const arrowsElement = parentEl.querySelector('.collection-tabs__arrows');
  const arrowsMarkup = `
    <div class="collection-tabs__arrows">
      <div class="collection-tabs__arrow--left">
        <svg aria-label="Chevron left icon" class="icon icon-chevron-left" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15,6,9,12l6,6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>
      </div>
      <div class="collection-tabs__arrow--right">
        <svg aria-label="Chevron right icon" class="icon icon-chevron-right" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9,18l6-6L9,6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>
      </div>
    </div>
  `;

  if (tabsElement.scrollWidth > parentWidth && !arrowsElement) {
    parentEl.insertAdjacentHTML('beforeend', arrowsMarkup);
    const leftArrow = parentEl.querySelector('.collection-tabs__arrow--left');
    const rightArrow = parentEl.querySelector('.collection-tabs__arrow--right');
    const initialScrollOffset = tabsElement.scrollLeft;
    const scrollRightEdge = tabsElement.scrollWidth - tabsElement.offsetWidth;

    if (initialScrollOffset < 5) {
      leftArrow.style.visibility = 'hidden';
    } else if (initialScrollOffset > scrollRightEdge - 5) {
      rightArrow.style.visibility = 'hidden';
    }

    leftArrow.addEventListener('click', () => tabsElement.scrollBy(-150, 0));
    rightArrow.addEventListener('click', () => tabsElement.scrollBy(150, 0));

    tabsElement.addEventListener('scroll', () => {
      if (tabsElement.scrollLeft < 5) {
        leftArrow.style.visibility = 'hidden';
        rightArrow.style.visibility = 'visible';
      } else if (tabsElement.scrollLeft > scrollRightEdge - 5) {
        leftArrow.style.visibility = 'visible';
        rightArrow.style.visibility = 'hidden';
      } else {
        leftArrow.style.visibility = 'visible';
        rightArrow.style.visibility = 'visible';
      }
    });
  }
};

export default handleCollectionTabsArrows;
