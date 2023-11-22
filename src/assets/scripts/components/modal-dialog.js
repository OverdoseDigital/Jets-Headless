import {createFocusTrap} from 'focus-trap';
/**
 * Options object can accept:
 * @param dialogEl - Modal dialog node
 * @param modalId - required to be able to close
 * @param [options] - triggerEl, toggleEl, focusEl, timerReveal
 */
export default class ModalDialog {
  constructor(dialogEl, options) {
    if (!dialogEl) return;

    this.options = typeof options === 'object' ? options : null;
    const {modalId, triggerEl, toggleEl, focusEl, timerReveal} = this.options;
    const nextPopup = localStorage.getItem(`timerPopup-${modalId}`);

    if (!modalId) throw new Error('Missing modalId');

    const modalCloseBtns = dialogEl.querySelectorAll(`[data-modal-close="modal--${modalId}"]`);

    this.modalIsOpen = false;

    const focusTrap = createFocusTrap(dialogEl, {
      initialFocus: focusEl,
      allowOutsideClick: true,
    });

    this.showModal = (settings = {}) => {
      dialogEl.hidden = false;
      dialogEl.setAttribute('aria-modal', true);
      dialogEl.classList.add('modal--visible');
      document.documentElement.classList.add('modal-js--open');
      document.documentElement.classList.add(`${modalId}-modal-js--open`);

      if (!(settings.disableFocusTrap)) {
        setTimeout(() => {
          focusTrap.activate();
        }, 500);
      }

      this.modalIsOpen = true;

      toggleEl?.forEach((button) => button.classList.add('is-active'));

      triggerEl?.forEach((button) => button.classList.add('is-active'));
    };

    this.closeModal = () => {
      dialogEl.hidden = true;
      dialogEl.removeAttribute('aria-modal');
      dialogEl.classList.remove('modal--visible');
      focusTrap.deactivate();
      this.modalIsOpen = false;

      toggleEl?.forEach((button) => button.classList.remove('is-active'));

      triggerEl?.forEach((button) => button.classList.remove('is-active'));

      document.documentElement.classList.remove(`${modalId}-modal-js--open`);
      if (!document.querySelector('.modal--visible')) {
        document.documentElement.classList.remove('modal-js--open');
      }

      window.dispatchEvent(new Event(`${modalId}-modal-closed`));
    };

    this.toggleModal = () => {
      if (this.modalIsOpen) {
        this.closeModal();
      } else {
        this.showModal();
      }
    };

    dialogEl.addEventListener('click', (evt) => {
      if (evt.target.closest('.modal__dialog')) return;
      this.closeModal();
    });

    document.documentElement.addEventListener(
      'click',
      (evt) => {
        if (evt.target.closest('.modal__dialog') || !this.modalIsOpen) return;
        evt.preventDefault();
        evt.stopPropagation();
        this.closeModal();
      },
      {capture: true}
    );

    window.addEventListener('closeModal', () => {
      this.closeModal();
    });

    window.addEventListener(`${modalId}-open-modal`, () => {
      this.showModal();
    });

    window.addEventListener(`${modalId}-close-modal`, () => {
      this.closeModal();
    });

    toggleEl?.forEach((button) => {
      button.addEventListener('click', (evt) => {
        evt.preventDefault();
        this.toggleModal();
      });
    });

    triggerEl?.forEach((button) => {
      button.addEventListener('click', (evt) => {
        evt.preventDefault();
        this.showModal();
      });
    });

    if (timerReveal && window.localStorage && this.options.trigger !== 'exit-intent') {
      let now = new Date();
      now = now.setHours(now.getHours());
      if (!nextPopup || nextPopup <= now) {
        window.setTimeout(() => {
          this.showModal();
        }, timerReveal);
      }
    }

    modalCloseBtns?.forEach((button) => {
      button.addEventListener('click', (evt) => {
        evt.preventDefault();
        this.closeModal();

        if (timerReveal && window.localStorage && modalId) {
          if (nextPopup > new Date()) {
            return;
          }

          this.setLocalStorage();
        }
      });
    });
  }

  setLocalStorage() {
    const date = new Date();
    const frequency = this.options.trigger === 'exit-intent' ? this.options.frequencyDelay : 24;

    const expires = date.setHours(date.getHours() + frequency);
    localStorage.setItem(`timerPopup-${this.options.modalId}`, expires);
  }
}