import {register} from '@shopify/theme-sections';

export default register('template-careers', {
  onLoad() {
    const jobsWidget = document.getElementById('ja-jobs-widget');

    const handleMutation = mutations => {
      mutations.forEach(() => {
        window.scrollTo({ top: 0 });
      });
    }

    const observer = new MutationObserver(handleMutation);

    observer.observe(jobsWidget, {
      childList: true,
    });
  },
});
