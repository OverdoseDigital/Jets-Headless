/**
 * Collection Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly couple code to the Collection template.
 *
 * @namespace collection
 */

import {register} from '@shopify/theme-sections';
// eslint-disable-next-line no-unused-vars
import rangeSlider from 'range-slider-wc';
import Flickity from 'flickity';
import 'flickity-imagesloaded';

import {debounce} from '../utils/debounce';
import {filterSearchParams} from '../utils/search-params';
import ProductCard from '../components/product-card';
import ModalDialog from '../components/modal-dialog';
import handleCollectionTabsArrows from '../utils/collection-tabs-arrows';

const selectors = {
  collectionNavbar: '[data-collection-navbar]',
  collectionGrid: '[data-collection-grid]',
  productsCount: '[data-products-count]',
  productCard: '.product-card',
  pagination: '[data-collection-pagination]',
  sortByEl: '.modal--sort-menu',
  sortToggles: '[data-collection-sort-toggle]',
  filterToggle: '[data-filters-modal-trigger]',
  filterDrawer: '[data-collection-filter-drawer]',
  filterListAccordionPanels: '.filter-accordion__panel-list',
  filterPriceAccordionPanels: '.filter-accordion__panel-price_range',
  filterClearLink: '[data-collection-filter-clear-link]',
  filterClearAll: '[data-collection-filter-clear-all]',
  filterPriceRangeSlider: '.price-range',
  filterPriceRangeMin: '[data-collection-filter-price-range-min]',
  filterPriceRangeMax: '[data-collection-filter-price-range-max]',
  filterAccordionPanels: '.accordion__panel',
  layoutSwitchButton: '[data-collection-layout-switch]',
  filterSubmitBtn: '[data-filter-submit]',
  collectionTabs: '.collection__tabs-row-scroll-wrapper',
  recommendationsSliders: '.product-cards-carousel__slider',
};

const cssClasses = {
  isHidden: 'is-hidden',
  isVisble: 'is-visible',
  isSelected: 'is-selected',
  filterIsVisble: 'filter-is-visible',
};

register('collection-template', {
  onLoad() {
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);

    function initLayoutSwictherSS(container) {
      const layoutSwitchButtons = container.querySelectorAll(selectors.layoutSwitchButton);
      const layoutSwitchEvent = new Event('collection:layoutChange');
      window.dispatchEvent(layoutSwitchEvent);

      layoutSwitchButtons.forEach((layoutSwitchButton) => {
        layoutSwitchButton.addEventListener('click', () => {
          window.dispatchEvent(layoutSwitchEvent);
        });
      });
    }

    function initProductCardsSS(container) {
      const productCards = container.querySelectorAll(selectors.productCard);
      productCards.forEach((product) => ProductCard(product));
    }

    const hydrateProductCardsSliders = (sliders, options) => {
      if (sliders.length === 0) {
        return;
      }
      const isDesktop = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`).matches;

      sliders.forEach((slider) => {
        const cardCount = slider.querySelectorAll(selectors.productCard)?.length;
        if (!cardCount) return;
        if (isDesktop && cardCount < 5) {
          slider.classList.add('product-cards-carousel__slider--sub-five');
        }

        hydrateMainSlider(slider, {...options, isDesktop});
      });
    };

    const hydrateMainSlider = (slider, {isDesktop}) =>
      new Flickity(slider, {
        // options
        prevNextButtons: true,
        pageDots: isDesktop,
        imagesLoaded: true,
        setGallerySize: true,
        cellAlign: isDesktop ? 'center' : 'left',
        groupCells: isDesktop ? 3 : false,
        watchCSS: true,
        wrapAround: isDesktop,
        contain: !isDesktop,
      });

    const desktopQueryCallback = () => {
      this.calculateTruncateMaxHeight();
      const tabSliders = this.container.querySelectorAll(selectors.recommendationsSliders);

      tabSliders.forEach((sliderContainer) => {
        hydrateProductCardsSliders([sliderContainer]);
      });
    };

    // Check for `addEventListener` is required to support iOS and Safari <14.
    if (typeof desktopQuery?.addEventListener === 'function') {
      desktopQuery.addEventListener('change', desktopQueryCallback.bind(this));
    } else {
      desktopQuery.addListener(desktopQueryCallback.bind(this));
    }

    this.defaultSortBy = this.container.dataset.defaultSortBy || 'manual';
    this.collectionGrid = this.container.querySelector(selectors.collectionGrid);
    this.collectionNavbar = this.container.querySelector(selectors.collectionNavbar);

    this.initTruncateDescButton();
    this.calculateTruncateMaxHeight();

    const container = this.container;
    const searchspringToolbar = this.container.querySelector('#searchspring-toolbar');
    const skeletonToolbar = this.container.querySelector('.ss-skeleton--toolbar');

    if (searchspringToolbar) {
      window.addEventListener('searchspring.domReady', () => {
        initLayoutSwictherSS(container);
      });
    }
    const searchspringWrapper = this.container.querySelector('#searchspring-content');
    if (searchspringWrapper) {
      // Listen for the Searchspring ready event
      window.addEventListener('searchspring.domReady', () => {
        initProductCardsSS(container);
        const tabSliders = this.container.querySelectorAll(selectors.recommendationsSliders);

        tabSliders.forEach((sliderContainer) => {
          hydrateProductCardsSliders([sliderContainer]);
        });
        skeletonToolbar.classList.add('hide');
      });
    } else {
      this.initProductCards();
    }
    this.initNavbar();
    this.filterAccordionsInit();

    // Toggle sort filter modal
    const sortByEl = this.container.querySelector(selectors.sortByEl);
    const sortToggles = this.container.querySelectorAll(selectors.sortToggles);

    if (sortByEl && sortToggles && sortToggles.length > 0) {
      // eslint-disable-next-line no-unused-vars
      const sortModal = new ModalDialog(sortByEl, {
        modalId: 'sort-menu',
        toggleEl: sortToggles,
      });
    }

    const iconsSlider = this.container.querySelector('.collection__icons-row');

    if (iconsSlider) {
      const isTabletUp = window.matchMedia(`(min-width: ${window.theme.breakpoints.medium}px)`).matches;
      const iconBlockCount = iconsSlider.querySelectorAll('.collection__icons-row-item')?.length;
      let isWrapAround = true;
      if (!iconBlockCount) return;
      if (iconBlockCount < 8) {
        iconsSlider.classList.add('collection__icons-row--sub-eight');
      }
      if (isTabletUp && iconBlockCount < 8) {
        isWrapAround = false;
      }
      const selectedCell = iconsSlider.querySelector('.is-current');
      const selectedIndex = selectedCell ? Number(selectedCell.dataset.cellIndex) : 0;

      // eslint-disable-next-line no-new
      new Flickity(iconsSlider, {
        // options
        draggable: '>1',
        prevNextButtons: true,
        pageDots: false,
        cellAlign: 'center',
        imagesLoaded: true,
        wrapAround: isWrapAround,
        freeScroll: false,
        watchCSS: true,
        contain: true,
        initialIndex: selectedIndex,
        arrowShape:
          'M70.6 94.39A4.91 4.91 0 0 1 67.11 93L24.16 50l43-42.95a4.93 4.93 0 0 1 7 7l-36 36 36 36a4.93 4.93 0 0 1-3.48 8.42Z',
      });
    }

    const collectionTabs = this.container.querySelector(selectors.collectionTabs);
    handleCollectionTabsArrows(collectionTabs);
  },

  calculateTruncateMaxHeight() {
    window.requestAnimationFrame(() => {
      const truncateDesc = this.container.querySelector('.collection__long-desc-trunc-wrap');

      if (truncateDesc) {
        if (truncateDesc.scrollHeight > truncateDesc.offsetHeight) {
          truncateDesc.parentNode.classList.add('truncate');
        } else {
          truncateDesc.parentNode.classList.remove('truncate');
        }
      }
    });
  },

  initTruncateDescButton() {
    const truncateDesc = this.container.querySelector('.collection__long-desc-trunc-wrap');
    const toggleButton = this.container.querySelector('[data-toggle-desc]');

    if (toggleButton && truncateDesc) {
      const descScrollHeight = truncateDesc.scrollHeight;
      toggleButton.addEventListener('click', () => {
        if (truncateDesc.classList.contains('is-expanded')) {
          truncateDesc.classList.remove('is-expanded');
          truncateDesc.removeAttribute('style');
          toggleButton.classList.remove('is-active');
          toggleButton.innerText = window.theme.strings.collection.readMore;
        } else {
          truncateDesc.classList.add('is-expanded');
          truncateDesc.style.maxHeight = `${descScrollHeight}px`;
          truncateDesc.style.height = `${descScrollHeight}px`;
          toggleButton.classList.add('is-active');
          toggleButton.innerText = window.theme.strings.collection.readLess;
        }
      });
    }
  },

  initProductCards() {
    const productCards = this.container.querySelectorAll(selectors.productCard);
    productCards.forEach((product) => ProductCard(product));
  },

  initNavbar() {
    if (!this.collectionNavbar || !this.collectionGrid) return;

    const filterDrawer = this.container.querySelector(selectors.filterDrawer);
    const pagination = this.container.querySelector(selectors.pagination);
    const productsCount = this.container.querySelector(selectors.productsCount);

    const renderPage = async (searchParams, clearAll = false) => {
      const url = `${window.location.pathname}?section_id=${this.id}&${searchParams}`;
      try {
        const response = await fetch(url);
        if (response.ok === false) {
          throw new Error('Fetch cart response was not OK');
        }
        const html = await response.text();
        const newDocument = new DOMParser().parseFromString(html, 'text/html');

        this.collectionGrid.innerHTML = newDocument.querySelector(selectors.collectionGrid).innerHTML;

        if (filterDrawer) {
          const filterListAccordionPanels = filterDrawer.querySelectorAll(selectors.filterListAccordionPanels);
          filterListAccordionPanels.forEach((panel) => {
            const panelId = panel.id;
            const newPanel = newDocument.querySelector(`#${panelId}`);
            if (!newPanel) return;
            panel.innerHTML = newPanel.innerHTML;
          });

          if (clearAll) {
            const filterPriceAccordionPanels = filterDrawer.querySelectorAll(selectors.filterPriceAccordionPanels);
            filterPriceAccordionPanels.forEach((panel) => {
              const panelId = panel.id;
              const newPanel = newDocument.querySelector(`#${panelId}`);
              if (!newPanel) return;
              panel.innerHTML = newPanel.innerHTML;
              this.initPriceRangeSlider();
            });
          }
        }

        if (productsCount) {
          productsCount.innerHTML = newDocument.querySelector(selectors.productsCount).innerHTML;
        }

        if (pagination) {
          pagination.innerHTML = newDocument.querySelector(selectors.pagination).innerHTML;
        }

        history.pushState({searchParams}, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
        this.initProductCards();
      } catch (err) {
        window.console.error(err);
      }
    };

    const handleNavbarFormSubmit = (event) => {
      event.preventDefault();
      const formData = new FormData(event.target.closest('form'));
      const searchParams = new URLSearchParams(formData);
      const keyValuePairsToRemove = [{key: 'sort_by', value: this.defaultSortBy}];
      const filterPriceRangeMin = this.container.querySelector(selectors.filterPriceRangeMin);
      if (filterPriceRangeMin) {
        keyValuePairsToRemove.push({key: filterPriceRangeMin.name, value: filterPriceRangeMin.min});
      }
      const filterPriceRangeMax = this.container.querySelector(selectors.filterPriceRangeMax);
      if (filterPriceRangeMax) {
        keyValuePairsToRemove.push({key: filterPriceRangeMax.name, value: filterPriceRangeMax.max});
      }
      const filteredSearchParams = filterSearchParams(searchParams, keyValuePairsToRemove);
      renderPage(filteredSearchParams);
    };

    const debouncedNavbarFormSubmit = debounce((event) => {
      handleNavbarFormSubmit(event);
    }, 500);

    this.collectionNavbar.addEventListener('change', debouncedNavbarFormSubmit);
    this.collectionNavbar.addEventListener('submit', handleNavbarFormSubmit);

    // Filters
    if (filterDrawer) {
      // Clear filters links
      const handleClearFiltersLinkClick = (event) => {
        const filterClearLink = event.target.closest(selectors.filterClearLink);
        if (!filterClearLink) return;
        const clearAll = filterClearLink.hasAttribute('data-collection-filter-clear-all');

        event.preventDefault();
        const searchParams =
          filterClearLink.href.indexOf('?') === -1
            ? ''
            : filterClearLink.href.slice(filterClearLink.href.indexOf('?') + 1);
        renderPage(searchParams, clearAll);
      };
      filterDrawer.addEventListener('click', handleClearFiltersLinkClick);

      const filtersModalEl = this.container.querySelector(`#modal--filters`);
      const filtersModalTriggers = this.container.querySelectorAll('[data-filters-modal-trigger]');
      if (filtersModalEl && filtersModalTriggers) {
        // eslint-disable-next-line no-unused-vars
        const filtersModal = new ModalDialog(filtersModalEl, {
          triggerEl: filtersModalTriggers,
          modalId: 'filters',
        });
      }

      // Price range filter
      this.initPriceRangeSlider();
    }

    // Layout switcher
    const layoutSwitchButtons = this.container.querySelectorAll(selectors.layoutSwitchButton);
    const storedCollectionLayout = window.localStorage.getItem('collectionLayout');
    layoutSwitchButtons.forEach((layoutSwitchButton) => {
      const isLayoutSelected = layoutSwitchButton.classList.contains('is-selected');
      layoutSwitchButton.addEventListener('click', (event) => {
        const layout = event.target.dataset.collectionLayoutSwitch;
        const layoutSwitchEvent = new Event('collection:layoutChange');
        const classesToRemove = Array.from(this.collectionGrid.classList).filter((value) =>
          value.includes('collection-grid--')
        );
        this.collectionGrid.classList.add(`collection-grid--${layout}`);
        this.collectionGrid.classList.remove(...classesToRemove);
        layoutSwitchButtons.forEach((button) => {
          button.setAttribute('aria-pressed', 'false');
          button.removeAttribute('disabled');
          button.classList.remove(cssClasses.isSelected);
        });
        event.target.setAttribute('disabled', 'disabled');
        event.target.setAttribute('aria-pressed', 'true');
        event.target.classList.add(cssClasses.isSelected);
        window.localStorage.setItem('collectionLayout', `${layout}`);
        window.dispatchEvent(layoutSwitchEvent);
      });

      if (
        storedCollectionLayout &&
        storedCollectionLayout === layoutSwitchButton.dataset.collectionLayoutSwitch &&
        !isLayoutSelected
      ) {
        layoutSwitchButton.click();
      }
    });
  },

  filterAccordionsInit() {
    const accordions = this.container.querySelectorAll('.collection-filter__accordion');

    accordions.forEach((accordion) => {
      const handleClick = (event) => {
        // find the current trigger
        const currentTrigger = event.target.closest('.filter-accordion__trigger');

        // if we haven't clicked on a trigger return
        if (!currentTrigger) {
          return;
        }

        // find the current panel
        const panelId = currentTrigger.getAttribute('aria-controls');
        const currentPanel = accordion.querySelector(`#${panelId}`);

        if (currentTrigger.getAttribute('aria-expanded') === 'true') {
          currentTrigger.setAttribute('aria-expanded', false);
          currentPanel.classList.remove('show-panel');
        } else {
          currentTrigger.setAttribute('aria-expanded', true);
          currentPanel.classList.add('show-panel');
        }
      };

      // attach event listener to the accordion itself
      accordion.addEventListener('click', handleClick);
    });

    const filterCloseBtn = this.container.querySelector('[data-filter-modal-close]');
    filterCloseBtn.addEventListener('click', () => window.dispatchEvent(new Event('filters-close-modal')));
  },

  initPriceRangeSlider() {
    this.collectionNavbar = this.container.querySelector(selectors.collectionNavbar);
    const filterPriceRangeSlider = this.container.querySelector(selectors.filterPriceRangeSlider);
    const filterPriceRangeMin = this.container.querySelector(selectors.filterPriceRangeMin);
    const filterPriceRangeMax = this.container.querySelector(selectors.filterPriceRangeMax);
    const filterSubmitBtn = this.container.querySelector(selectors.filterSubmitBtn);

    /*
      inputs => range selector
    */
    if (filterPriceRangeMin) {
      filterPriceRangeMin.addEventListener('input', (evt) => {
        filterPriceRangeSlider.valueMin = evt.target.value;
      });
    }

    if (filterPriceRangeMin) {
      filterPriceRangeMax.addEventListener('input', (evt) => {
        filterPriceRangeSlider.valueMax = evt.target.value;
      });
    }

    /*
      range selector => inputs (and submit)
    */
    if (filterPriceRangeSlider) {
      filterPriceRangeSlider.addEventListener('input', (evt) => {
        if (document.activeElement === this) return;
        const {valueMin, valueMax} = evt.detail;
        if (filterPriceRangeMin) {
          filterPriceRangeMin.value = valueMin;
        }
        if (filterPriceRangeMax) {
          filterPriceRangeMax.value = valueMax;
        }
      });

      filterPriceRangeSlider.addEventListener('change', (evt) => {
        if (document.activeElement === this) return;
        const {valueMin, valueMax} = evt.detail;
        filterPriceRangeMin.value = valueMin;
        filterPriceRangeMax.value = valueMax;

        if (typeof this.collectionNavbar.requestSubmit === 'function') {
          this.collectionNavbar.requestSubmit();
        } else if (filterSubmitBtn) {
          filterSubmitBtn.click();
        }
      });
    }
  },
});
