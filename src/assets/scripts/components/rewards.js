import api from './seafolly-api';

/**
 * getRewardsInfo - calls the api and prepares the response.
 *
 * @returns {object} - containing `balance` and `expiryDateString` fields.
 */
async function getRewardsInfo() {
  const {
    rewardAccountDetails: {rewardBalance, rewards, ...properties},
  } = await api.getRewardsDetails();

  const {remainingValue, expiryDate} = findNextExpiringReward(rewards) || {};

  return {
    ...properties,
    balance: rewardBalance,
    nextExpiringValue: remainingValue,
    expiryDateString: expiryDate,
    rewards,
  };
}

function findNextExpiringReward(rewards) {
  if(!rewards) {
    return;
  }
  return rewards.sort((a, b) => a.expiryDate - b.expiryDate).find(({remainingValue}) => remainingValue !== '00.00');
}

export {getRewardsInfo};
