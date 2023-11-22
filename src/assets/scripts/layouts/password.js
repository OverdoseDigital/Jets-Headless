import '../../styles/layouts/password.scss';

import ModalDialog from '../components/modal-dialog';

document.addEventListener('DOMContentLoaded', () => {
  const passwordModalEl = document.querySelector(`#modal--password`);
  const passwordModalTriggers = document.querySelectorAll('[data-password-modal-trigger]');
  if (passwordModalEl && passwordModalTriggers) {
    const passwordModalFocusEl = passwordModalEl.querySelector('#Password');
    // eslint-disable-next-line no-unused-vars
    const passwordModal = new ModalDialog(passwordModalEl, {
      triggerEl: passwordModalTriggers,
      focusEl: passwordModalFocusEl,
      modalId: 'password',
    });
  }
});
