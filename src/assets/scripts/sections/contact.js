/**
 * Contact Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled to the Contact section.
 *
 * @namespace contact
 */
import {register} from '@shopify/theme-sections';
import Pristine from 'pristinejs';

export default register('contact', {
  /**
   * @method onLoad()
   */
  onLoad() {
    const contactForm = this.container.querySelector('.contact-form');
    if (contactForm) {
      this.initFormValidation(contactForm);
    }
  },

  initFormValidation(form) {
    const config = {
      classTo: 'form__group',
      errorClass: 'has-error',
      errorTextParent: 'form__group',
      errorTextTag: 'p',
      errorTextClass: 'form__field-error',
    };

    this.pristine = new Pristine(form, config, true);

    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const valid = this.pristine.validate();
      if (valid) form.submit();
    });
  },
});
