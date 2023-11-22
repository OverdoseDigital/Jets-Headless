/**
 * Header Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled code to the Header Section.
 *
 */

import {register} from '@shopify/theme-sections';

import ModalDialog from '../components/modal-dialog';

const selectors = {
  nav: '.nav',
  navDrawer: '.nav-drawer',
  navToggle: '.nav-toggle',
  navClose: '.nav-close',
  navDropdown: '.nav__dropdown',
  faderNav: '.fader--nav',
  navTopLevelItems: '.nav__item--level-1',
  navListItemsWithChildren: '.nav__item--has-child',
  navLinksWithChildren: '.nav__item--toggle',
  navLevel2WithChildren: '.mobile-subnav__item--toggle',
  backButton: '[data-action-back]',
  backButtonDescendant: '[data-action-back-descendant]',
  activeDropdownLinks: '.nav__item--has-child.is-expanded',
  openNavToggles: '.nav__item--has-child.is-expanded .nav__item--toggle',
  expandedSubNavItem: '.nav__item.subnav-is-expanded',
};

const cssClasses = {
  isExpanded: 'is-expanded',
  dropdownIsActive: 'dropdown-is-active',
  menuIsExpanded: 'menu-is-expanded',
  isCollapsed: 'is-collapsed',
  slidemenuIsLevel2: 'slidemenu-is-level-2',
  slidemenuIsLevel3: 'slidemenu-is-level-3',
  subnavIsExpanded: 'subnav-is-expanded',
  subnavIsCollapsed: 'subnav-is-collapsed',
};

export default register('header', {
  onLoad() {
    this.navDrawer = this.container.querySelector(selectors.navDrawer);

    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);

    const desktopQueryCallback = () => {
      this.handleResize();
    };

    // Check for `addEventListener` is required to support iOS and Safari <14.
    if (typeof desktopQuery?.addEventListener === 'function') {
      desktopQuery.addEventListener('change', desktopQueryCallback.bind(this));
    } else {
      desktopQuery.addListener(desktopQueryCallback.bind(this));
    }

    // Toggle mobile menu
    const btnMenuOpen = this.container.querySelector('.nav-toggle');
    btnMenuOpen.addEventListener('click', this.btnMenuClickToggleHandler.bind(this));

    // Close open dropdowns for users tabbing with keyboard
    const nav = this.container.querySelector(selectors.nav);
    nav.addEventListener('focusin', this.collapseOpenDrodownsHandler.bind(this));

    // Click the overlay to close the nav (mobile)
    const navOverlay = this.container.querySelector(selectors.faderNav);
    navOverlay?.addEventListener('click', this.btnMenuClickCloseHandler.bind(this));

    // Level 1 links click event
    const navLinks = this.container.querySelectorAll(selectors.navLinksWithChildren);
    navLinks.forEach((el) => {
      el.addEventListener('keydown', this.navLinkKeyOpenHandler.bind(this));
      el.addEventListener('click', this.navLinkClickHandler.bind(this));
    });

    // Level 2 links click event
    const subNavLinks = this.container.querySelectorAll(selectors.navLevel2WithChildren);
    subNavLinks.forEach((el) => {
      el.addEventListener('click', this.subNavLinkClickHandler.bind(this));
    });

    // Level 2 back link click event
    const backLinks = this.container.querySelectorAll(selectors.backButton);
    backLinks.forEach((el) => {
      el.addEventListener('click', this.backLinkLevel1Handler.bind(this));
    });

    // Level 3 back link click event
    const backLinksSub = this.container.querySelectorAll(selectors.backButtonDescendant);
    backLinksSub.forEach((el) => {
      el.addEventListener('click', this.backLinkLevel2Handler.bind(this));
    });

    // Level 1 hover events
    const navTopListItems = this.container.querySelectorAll(selectors.navListItemsWithChildren);
    navTopListItems.forEach((li) => {
      li.addEventListener('mouseover', this.navLinkHoverOpenHandler.bind(this));
      li.addEventListener('mouseout', this.navLinkHoverCloseHandler.bind(this));
    });

    this.setHeaderHeightVar();

    const currencyModalEl = document.querySelector(`#modal--currency`);
    const currencyModalTriggers = document.querySelectorAll('[data-currency-modal-trigger]');
    if (currencyModalEl && currencyModalTriggers && currencyModalTriggers.length > 0) {
      // eslint-disable-next-line no-unused-vars
      const currencyModal = new ModalDialog(currencyModalEl, {
        triggerEl: currencyModalTriggers,
        modalId: 'currency',
      });
    }
  },

  setHeaderHeightVar() {
    window.requestAnimationFrame(() => {
      const headerHeight = this.container.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    });
  },

  handleResize() {
    this.setHeaderHeightVar();
    this.btnMenuClickCloseHandler();
    this.collapseDropdown();
  },

  /**
   * Click handler for dropdowns
   */
  collapseDropdown() {
    const activeDropdownLinks = this.container.querySelectorAll(selectors.activeDropdownLinks);
    const openNavToggles = this.container.querySelectorAll(selectors.openNavToggles);

    document.body.classList.remove(cssClasses.dropdownIsActive);

    activeDropdownLinks.forEach((el) => {
      el.classList.remove(cssClasses.isExpanded);
    });

    openNavToggles.forEach((el) => {
      if (el) {
        el.setAttribute('aria-expanded', false);
      }
    });
  },

  btnMenuClickToggleHandler() {
    document.body.classList.toggle('menu-is-expanded');
    if (document.body.classList.contains('menu-is-expanded')) {
      this.btnMenuClickOpenHandler();
    } else {
      this.btnMenuClickCloseHandler();
    }
  },

  /**
   * .nav-toggle click handler
   */
  btnMenuClickOpenHandler() {
    document.body.classList.add(cssClasses.menuIsExpanded);

    const subMenuParents = document.querySelectorAll(selectors.navListItemsWithChildren);

    subMenuParents.forEach((el) => {
      if (!el.classList.contains(cssClasses.isExpanded)) return;
      el.classList.remove(cssClasses.isExpanded);
    });
  },

  /**
   *  Reset all open menu items
   */
  btnMenuClickCloseHandler() {
    document.body.classList.remove(cssClasses.menuIsExpanded);
    document.body.classList.remove(cssClasses.slidemenuIsLevel2);
    document.body.classList.remove(cssClasses.slidemenuIsLevel3);

    const subMenuParents = document.querySelectorAll(selectors.navListItemsWithChildren);
    const expandedSubNavItem = document.querySelectorAll(selectors.expandedSubNavItem);

    if (subMenuParents.length > 0) {
      subMenuParents.forEach((el) => {
        if (!el.classList.contains(cssClasses.isExpanded)) return;
        el.classList.remove(cssClasses.isExpanded);
      });
    }

    if (expandedSubNavItem.length > 0) {
      expandedSubNavItem.forEach((el) => {
        if (!el.classList.contains(cssClasses.subnavIsExpanded)) return;
        el.classList.remove(cssClasses.subnavIsExpanded);
      });
    }
  },

  collapseOpenDrodownsHandler(event) {
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
    const isDesktop = desktopQuery.matches;
    if (!isDesktop) return;

    const listItem = event.target.closest(selectors.navTopLevelItems);
    if (listItem.classList.contains(cssClasses.isExpanded)) return;
    const activeDropdownItems = this.container.querySelectorAll(selectors.activeDropdownLinks);
    activeDropdownItems.forEach((item) => {
      document.body.classList.remove(cssClasses.dropdownIsActive);
      item.classList.remove(cssClasses.isExpanded);
      const thisNavLink = item.querySelector(selectors.navLinksWithChildren);
      if (thisNavLink) {
        thisNavLink.setAttribute('aria-expanded', false);
      }
    });
  },

  /**
   * .nav__item.has-child > a click handler
   */
  navLinkClickHandler(event) {
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
    const isDesktop = desktopQuery.matches;
    if (!isDesktop) {
      event.preventDefault();
    }

    this.navDrawer.scrollTop = 0;

    // Menu item toggle
    const navLinks = document.querySelectorAll(selectors.navLinksWithChildren);
    const navItem = event.currentTarget.parentElement;
    const thisNavItem = event.currentTarget;
    document.body.classList.add(cssClasses.slidemenuIsLevel2);

    if (navItem.classList.contains(cssClasses.isExpanded)) {
      thisNavItem.setAttribute('aria-expanded', false);
      navItem.classList.remove(cssClasses.isExpanded);
      document.body.classList.remove(cssClasses.dropdownIsActive);
    } else {
      navLinks.forEach((el) => el.parentElement.classList.remove(cssClasses.isExpanded));
      navLinks.forEach((el) => el.setAttribute('aria-expanded', false));
      navItem.classList.add(cssClasses.isExpanded);
      document.body.classList.add(cssClasses.dropdownIsActive);
      thisNavItem.setAttribute('aria-expanded', true);
    }

    return true;
  },

  subNavLinkClickHandler(event) {
    // On large screens we don't want to trigger this toggle functionality
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
    const isDesktop = desktopQuery.matches;
    if (isDesktop) return;

    this.navDrawer.scrollTop = 0;

    event.preventDefault();

    // Menu item toggle
    const subNavLinks = document.querySelectorAll(selectors.navLevel2WithChildren);
    const subNavItem = event.currentTarget.parentElement;
    const thisSubNavItem = event.currentTarget;

    if (subNavItem.classList.contains(cssClasses.subnavIsExpanded)) {
      thisSubNavItem.setAttribute('aria-expanded', false);
      subNavItem.classList.remove(cssClasses.subnavIsExpanded);
      document.body.classList.remove('slidemenu-is-level-3');
    } else {
      subNavLinks.forEach((el) => el.parentElement.classList.remove(cssClasses.subnavIsExpanded));
      subNavLinks.forEach((el) => el.setAttribute('aria-expanded', false));
      subNavItem.classList.add(cssClasses.subnavIsExpanded);
      document.body.classList.add('slidemenu-is-level-3');
      thisSubNavItem.setAttribute('aria-expanded', true);
    }

    return true;
  },

  /**
   * .nav__item.has-child > a mouseover handler
   */
  navLinkHoverOpenHandler(event) {
    // On small screens we don't want to trigger this hover functionality
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
    const isDesktop = desktopQuery.matches;
    if (!isDesktop) return;

    const listItem = event.currentTarget.closest('li');
    const thisNavLink = listItem.querySelector(selectors.navLinksWithChildren);
    listItem.classList.add(cssClasses.isExpanded);
    document.body.classList.add(cssClasses.dropdownIsActive);
    if (thisNavLink) {
      thisNavLink.setAttribute('aria-expanded', true);
    }

    return true;
  },

  /**
   * .nav__item.has-child > a mouseover handler
   */
  navLinkKeyOpenHandler(event) {
    // On small screens we don't want to trigger this hover functionality

    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
    const isDesktop = desktopQuery.matches;
    if (!isDesktop) return;

    const listItem = event.currentTarget.closest('li');
    const thisNavLink = listItem.querySelector(selectors.navLinksWithChildren);

    // Enter key behaviour
    if (event.keyCode === 13) {
      event.stopPropagation();
      event.preventDefault();
      if (listItem.classList.contains(cssClasses.isExpanded)) {
        listItem.classList.remove(cssClasses.isExpanded);
        document.body.classList.remove(cssClasses.dropdownIsActive);
        thisNavLink.setAttribute('aria-expanded', false);
      } else {
        listItem.classList.add(cssClasses.isExpanded);
        document.body.classList.add(cssClasses.dropdownIsActive);
        thisNavLink.setAttribute('aria-expanded', true);
      }
    }

    return true;
  },

  /**
   * .nav__item.has-child > a mouseout handler
   */
  navLinkHoverCloseHandler(event) {
    // On small screens we don't want to trigger this hover functionality
    const desktopQuery = window.matchMedia(`(min-width: ${window.theme.breakpoints.large}px)`);
    const isDesktop = desktopQuery.matches;
    if (!isDesktop) {
      return;
    }

    document.body.classList.remove(cssClasses.dropdownIsActive);

    const listItem = event.currentTarget;
    const thisNavLink = event.currentTarget.querySelector(selectors.navLinksWithChildren);

    listItem.classList.remove(cssClasses.isExpanded);
    thisNavLink.setAttribute('aria-expanded', false);

    return true;
  },

  backLinkLevel1Handler() {
    const expandedNavItem = document.querySelectorAll(selectors.activeDropdownLinks);
    document.body.classList.remove(cssClasses.slidemenuIsLevel2);
    expandedNavItem.forEach((el) => {
      el.classList.remove(cssClasses.isExpanded);
    });
    this.navDrawer.scrollTop = 0;
  },

  backLinkLevel2Handler() {
    const expandedSubNavItem = document.querySelectorAll(selectors.expandedSubNavItem);
    document.body.classList.remove(cssClasses.slidemenuIsLevel3);
    expandedSubNavItem.forEach((el) => {
      el.classList.remove(cssClasses.subnavIsExpanded);
    });
    this.navDrawer.scrollTop = 0;
  },
});
