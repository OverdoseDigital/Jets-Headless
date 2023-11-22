const detailsA11y = () => {
  const detailsElements = document.querySelectorAll('details');

  detailsElements.forEach((details) => {
    details.addEventListener('toggle', () => {
      details.setAttribute('aria-expanded', details.open)
    });
  });
};

export default detailsA11y;
