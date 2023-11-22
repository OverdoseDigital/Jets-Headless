import React from 'react';
import {formatMoney} from '@shopify/theme-currency';

import {TIER_LIMITS} from './constants';

const ProgressBar = ({tier, spendToNextTier}) => (
  <div className="account__tier-status-progress-bar-outer">
    <div
      className="account__tier-status-progress-bar"
      style={{
        '--rewards-progress-percentage': `${getProgressPercentage(TIER_LIMITS[tier], Number(spendToNextTier))}%`,
      }}
    >
      <div className="account__tier-status-progress-bar-progress" />
      <p className="account__tier-status-progress-label small">
        {formatMoney(TIER_LIMITS[tier][0] * 100, window.theme?.moneyFormatWithoutDecimalsOrCurrency)}
        {!TIER_LIMITS[tier][1] && '+'}
      </p>
      {TIER_LIMITS[tier][1] && (
        <p className="account__tier-status-progress-label small">
          {formatMoney(TIER_LIMITS[tier][1] * 100, window.theme?.moneyFormatWithoutDecimalsOrCurrency)}
        </p>
      )}
      {TIER_LIMITS[tier][1] && (
        <h6 className="account__tier-status-progress-spend">
          {formatMoney(
            (Number(TIER_LIMITS[tier][1]) + 1 - spendToNextTier) * 100,
            window.theme?.moneyFormatWithoutDecimalsOrCurrency
          )}
        </h6>
      )}
    </div>
  </div>
);

function getProgressPercentage(tierLimits, spend) {
  const spendNew = Number(tierLimits[1]) - spend;
  if (!tierLimits[1]) {
    return 50;
  }

  if (spendNew - tierLimits[0] < 0) {
    // handle error case
    return 0;
  }

  if (spendNew - tierLimits[1] > 0) {
    // handle error case
    return 100;
  }

  return ((spendNew - tierLimits[0]) / (tierLimits[1] - tierLimits[0])) * 100;
}

export {ProgressBar};
