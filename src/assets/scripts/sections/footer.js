/**
 * Footer Section Script
 * ------------------------------------------------------------------------------
 * A file that contains scripts highly coupled code to the Footer Section.
 *
 */

 import {register} from '@shopify/theme-sections';
 
 export default register('footer', {
   onLoad() {
    const container = this.container;
    const onetrustTriggers = Array.from(container.querySelectorAll('button[data-onetrust-trigger]'));
    if (!onetrustTriggers.length) { return; };
    onetrustTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        window.OneTrust.ToggleInfoDisplay();
      })
    })
   }
 });
 