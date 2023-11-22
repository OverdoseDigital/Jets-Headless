import {register} from '@shopify/theme-sections';

import ModalDialog from '../components/modal-dialog';

class ExitIntentPopup {
  constructor(modal, modalEl, container) {
    this.modal = modal;
    this.modalEl = modalEl;
    this.container = container;

    this.form = modalEl.querySelector('[data-save-cart-form]');
    this.cartCounter = document.querySelector('[data-items-count]');

    this.isMobile = window.matchMedia('(max-width: 600px)').matches;
    this.displayMobilePopup = null;
  }

  init() {
    this.initForm();

    if (this.isMobile) {
      this.mobileEvent();
    } else {
      document.addEventListener('mouseout', this.desktopEvent.bind(this));
    };
  }

  initForm() {
    if (!this.form) return;

    this.form.addEventListener('submit', (event) => {
      event.preventDefault();

      const email = this.form.querySelector('[name="email"]').value;
      const cartData = window.theme.cart;

      // Convert prices to decimals
      cartData.items.forEach(cartItem => {
        const allItemKeys = Object.keys(cartItem);
        allItemKeys.forEach(key => {
          if (!(key.endsWith('_price') || key === 'price')) return;
          const price = cartItem[key];
          if (price !== Math.floor(price)) return;
          cartItem[key] = (price / 100).toFixed(2);
        })
      });

      this.pushCartDetails(email, cartData);
      this.showSuccessMessage();
    });
  }

  // MOBILE TRIGGER
  mobileEvent() {

    // Display the pop-up if the user is idle for X amount of time
    const mobileIdleTimer = () => {
      const nextPopup = localStorage.getItem(`timerPopup-${this.modal.options.modalId}`);
      const now = new Date();
      if (!(!nextPopup || nextPopup <= now) || window.theme?.customer) return;

      const actions = ['load', 'touchstart', 'click', 'touchmove']; 
      const modal = this.modal;
      const idleTime = Number(this.container.dataset.mobileIdle);
      const cartCountEl = this.cartCounter;
      let time;

      actions.forEach((action) => document.addEventListener(action, resetTimer));

      function resetTimer() {
        clearTimeout(time);

        time = setTimeout(() => {
          const cartCount = parseInt(cartCountEl.dataset.itemsCount, 10) ?? 0;
          if (!cartCount) return;

          modal.showModal({disableFocusTrap: true});
          removeIdleEvents();
        }, idleTime)
      };

      function removeIdleEvents() {
        actions.forEach((action) => document.removeEventListener(action, resetTimer));
      };
    };

    mobileIdleTimer();

    // Display the pop-up if the user switches tabs or apps
    document.addEventListener('visibilitychange', () => {
      const cartCount = parseInt(this.cartCounter.dataset.itemsCount, 10) ?? 0;
      if (!cartCount || window.theme?.customer) return;

      const nextPopup = localStorage.getItem(`timerPopup-${this.modal.options.modalId}`);
      const now = new Date();
      if (!(!nextPopup || nextPopup <= now)) return;

      if (document.hidden) {
        this.displayMobilePopup = setTimeout(() => {
          this.modal.showModal({disableFocusTrap: true});
          this.modal.setLocalStorage();
        }, 5000);

      } else {
        clearTimeout(this.displayMobilePopup);
      }
    });
  }

  // DESKTOP TRIGGER
  // Display exit intent popup if the user moves their cursor outside fo the active window.
  desktopEvent(event) {
    const cartCount = parseInt(this.cartCounter.dataset.itemsCount, 10) ?? 0;
    if (!cartCount || window.theme?.customer) return;
    
    const nextPopup = localStorage.getItem(`timerPopup-${this.modal.options.modalId}`);
    const now = new Date();
    if (!(!nextPopup || nextPopup <= now)) return;

    if ((event.toElement == null && event.relatedTarget == null) && !this.modalIsOpen) {
      window.setTimeout(() => {
        this.modal.showModal();

        this.modal.setLocalStorage();
      }, this.modal.options.timerReveal);
    }
  }

  pushCartDetails(email, cartData) {
    const _learnq = window._learnq || [];
    
    _learnq.push(["identify", {"$email": email}]);
    setTimeout(() => {
      _learnq.push(["track", "Share Cart", {email, cartData}]);
    }, 1500);
  }

  showSuccessMessage() {
    const successMessage = this.modalEl.querySelector('[data-save-cart-success]');

    this.form.setAttribute('aria-hidden', 'true');
    successMessage.setAttribute('aria-hidden', 'false');
  }
}

export default register('exit-intent-popup', {
  onLoad() {
    this.modalId = `${this.id}`;
    const modalEl = this.container.querySelector(`#modal--${this.modalId}`);
    if (modalEl) {

      const modal = new ModalDialog(modalEl, {
        modalId: this.modalId,
        focusEl: modalEl.querySelector('[data-modal-close]'),
        timerReveal: Number(this.container.dataset.timerDelay),
        trigger: 'exit-intent',
        frequencyDelay: Number(this.container.dataset.frequencyDelay)
      });

      const exitIntentModal = new ExitIntentPopup(modal, modalEl, this.container);
      exitIntentModal.init();
    }
  },
});
