/**
 * Password Template Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled to the Password template.
 *
 * @namespace password
 */

document.addEventListener('DOMContentLoaded', () => {
  const selectors = {
    recoverPasswordLink: '#RecoverPassword',
    hideRecoverPasswordLink: '#HideRecoverPasswordLink',
    recoverPasswordForm: '#RecoverPasswordForm',
    loginForm: '#CustomerLoginForm',
    formState: '.reset-password-success',
    successMessage: '#ResetSuccess',
  };

  /**
   *  Show/Hide recover password form
   */
  function toggleRecoverPasswordForm() {
    document.querySelector(selectors.recoverPasswordForm).classList.toggle('hide');
    document.querySelector(selectors.loginForm).classList.toggle('hide');
    window.scroll({ top: 0 });
  }

  function onShowHidePasswordForm(evt) {
    evt.preventDefault();
    toggleRecoverPasswordForm();
  }

  function checkUrlHash() {
    const hash = window.location.hash;

    // Allow deep linking to recover password form
    if (hash === '#recover') {
      toggleRecoverPasswordForm();
    }
  }

  /**
   *  Show reset password success message
   */
  function resetPasswordSuccess() {
    const formState = document.querySelector(selectors.formState);

    // check if reset password form was successfully submitted.
    if (!formState) {
      return;
    }

    // show success message
    const successMessage = document.querySelector(selectors.successMessage);
    if (successMessage) {
      successMessage.classList.remove('hide');
    }
  }

  if (document.querySelector(selectors.recoverPasswordLink)) {
    checkUrlHash();
    resetPasswordSuccess();

    document.querySelector(selectors.recoverPasswordLink).addEventListener('click', onShowHidePasswordForm);
    document.querySelector(selectors.hideRecoverPasswordLink).addEventListener('click', onShowHidePasswordForm);
  }
});
