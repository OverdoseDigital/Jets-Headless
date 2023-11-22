import React from 'react';

import {TIER_COLOR_VARS} from './constants';

const RewardTierRibbon = ({tier}) => (
  <span dangerouslySetInnerHTML={{__html: TIER_COLOR_VARS[tier]}} />
);

export {RewardTierRibbon};
