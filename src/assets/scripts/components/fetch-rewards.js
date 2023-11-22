import {getRewardsInfo} from './rewards';

export default function fetchRewardsInfo() {
  fetchRewardsInformation();

  /**
   * @function fetchRewardsInformation - fetches loyalty information and places
   * it into the rewards status banner.
   *
   */
  async function fetchRewardsInformation() {
    if (!window.theme.rewards.enabled || !window.theme.customer) {
      return;
    }

    try {
      await getRewardsInfo();
    } catch (error) {
      window.console.error(error, error?.message);
    }
  }
}
