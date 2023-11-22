import iconRewardBronze from '../../../assets/svg/icon-reward-beach-club-bronze.svg';
import iconRewardSilver from '../../../assets/svg/icon-reward-beach-club-silver.svg';
import iconRewardGold from '../../../assets/svg/icon-reward-beach-club-gold.svg';

import {getLimitsFromYearlySpendMessage} from './helpers';

const MESSAGES = window.theme?.strings?.accountRewards || {};

// Map of api values to the keys we will use for the tiers in frontend code. If
// the api ever changes, we should only need to change it here.
const TIERS = {
  bronze: 'White Sand',
  silver: 'Blue Sea',
  gold: 'Gold Sun',
};

const TIER_COLOR_VARS = {
  [TIERS.bronze]: iconRewardBronze,
  [TIERS.silver]: iconRewardSilver,
  [TIERS.gold]: iconRewardGold,
};

const TIER_TITLES = {
  [TIERS.bronze]: MESSAGES.titleBronze,
  [TIERS.silver]: MESSAGES.titleSilver,
  [TIERS.gold]: MESSAGES.titleGold,
};

const TIER_SPENDS = {
  [TIERS.bronze]: MESSAGES.spendBronze,
  [TIERS.silver]: MESSAGES.spendSilver,
  [TIERS.gold]: MESSAGES.spendGold,
};

const TIER_LIMITS = {
  [TIERS.bronze]: getLimitsFromYearlySpendMessage(MESSAGES.spendBronze),
  [TIERS.silver]: getLimitsFromYearlySpendMessage(MESSAGES.spendSilver),
  [TIERS.gold]: getLimitsFromYearlySpendMessage(MESSAGES.spendGold),
};

const NEXT_TIERS = {
  [TIERS.bronze]: TIERS.silver,
  [TIERS.silver]: TIERS.gold,
  [TIERS.gold]: null,
};

export {MESSAGES, TIERS, TIER_COLOR_VARS, TIER_TITLES, TIER_SPENDS, TIER_LIMITS, NEXT_TIERS};
