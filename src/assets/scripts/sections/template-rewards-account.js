import {register} from '@shopify/theme-sections';

export default register('template-rewards-account', {
  onLoad() {
    const props = {
      ...this.container.dataset,
    }

    import(/* webpackChunkName: 'rewards' */ '../../../app/rewards')
    .then((module) => module.default(props))
    .catch((error) => window.console.error('Could not load rewards module', error));
  },
});
