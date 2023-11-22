const rteTablesInit = () => {
  // Add wrapping div to tables in RTE
  const rteTables = document.querySelectorAll('.rte table');
  if (rteTables.length === 0) return;

  rteTables.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('rte__table-wrapper');
    item.parentNode.insertBefore(wrapper, item);
    wrapper.appendChild(item);

    // Additional inner wrapper
    const innerContainer = document.createElement('div');
    innerContainer.classList.add('rte__table-inner-container');
    item.parentNode.insertBefore(innerContainer, item);
    innerContainer.appendChild(item);

    const tableWrapperWidth = innerContainer.offsetWidth;

    if (item.scrollWidth > tableWrapperWidth) {
      innerContainer.classList.add('dragscroll');
    }
  });
};

export default rteTablesInit;
