import {register} from '@shopify/theme-sections';

import {initialiseBookAppointmentButton} from '../components/brauz';

export default register('speak-to-a-fit-specialist', {
  onLoad() {
    const bookSelector = `[data-book-appointment-${this.id}]`

    window.addEventListener('DOMContentLoaded', () => {
      initialiseBookAppointmentButton(bookSelector)
    });
  },
});
