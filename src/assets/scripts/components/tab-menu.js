function initTabMenu() {
  const tabMenu = document.querySelector('.tab-menu__scroll-wrapper')

  if (tabMenu) {
    const activeTab = tabMenu.querySelector('.tab-menu__link.is-active')
    const boundingBox = activeTab.getBoundingClientRect()

    tabMenu.scrollLeft = boundingBox.x - 16;
  }
}
export { initTabMenu }
