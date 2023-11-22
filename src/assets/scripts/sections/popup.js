import {register} from '@shopify/theme-sections';

import ModalDialog from '../components/modal-dialog';

export default register('popup', {
  onLoad() {
    this.modalId = `${this.id}`;
    this.timerDelay = Number(this.container.dataset.timerDelay);
    const modalEl = this.container.querySelector(`#modal--${this.modalId}`);
    if (modalEl) {
      // eslint-disable-next-line no-unused-vars
      const popupModal = new ModalDialog(modalEl, {
        modalId: this.modalId,
        focusEl: modalEl.querySelector('[data-modal-close]'),
        timerReveal: this.timerDelay,
      });
    }
  },
});
