import React from 'react';
import {formatMoney} from '@shopify/theme-currency';

import {RewardTierRibbon} from './RewardTierRibbon';
import {TrendIcon} from './TrendIcon';
import {ProgressBar} from './ProgressBar';
import {RewardsSummaryTable} from './RewardsSummaryTable';
import {TIER_TITLES, TIER_SPENDS, MESSAGES, NEXT_TIERS} from './constants';
import {dateTimeFormatter, dateTimeFormatterLong} from './helpers';

const RewardsInfo = ({
  nextRewardAmount,
  info: {currentTierName, anniversaryDate, balance, spendToNextReward, spendToNextTier, expiryDateString, rewards = []},
} = {}) => {
  const nextTier = NEXT_TIERS[currentTierName];

  return (
    <>
      {currentTierName && (
        <header className="account__tier-status-header">
          <RewardTierRibbon tier={currentTierName} />
          <h4>{TIER_TITLES[currentTierName]}</h4>
          <p className="small muted">
            {MESSAGES.yearlySpend} {TIER_SPENDS[currentTierName]}
          </p>
        </header>
      )}
      <div className={nextTier ? 'account__tier-status' : 'account__tier-status account__tier-status--top-tier'}>
        <div className="account__tier-status-available">
          <h5>{MESSAGES.availableTitle}</h5>
          <p className="h1">{formatMoney(balance, window.theme?.moneyFormatWithoutDecimalsOrCurrency)}</p>
          <a href="/collections/all" className="btn">
            {MESSAGES.availableCTA}
          </a>
        </div>
        <div className="account__tier-status-anniversary">
          <h5>{MESSAGES.anniversaryTitle}</h5>
          {anniversaryDate && (
            <p className="muted">{dateTimeFormatter.format(new Date(anniversaryDate))}</p>
          )}
        </div>
        {nextTier && spendToNextTier && (
          <div className="account__tier-status-spend-to-next">
            <h5>
              {MESSAGES.spendTo} {TIER_TITLES[nextTier]}
            </h5>
            <p className="muted">
              <span>{formatMoney(spendToNextTier * 100, window.theme?.moneyFormatWithoutDecimalsOrCurrency)}</span>
              <TrendIcon />
            </p>
          </div>
        )}
        <div className="account__tier-status-progress-bar-wrapper">
          {nextTier && currentTierName && spendToNextTier && (
            <ProgressBar tier={currentTierName} spendToNextTier={spendToNextTier} />
          )}
          {spendToNextReward && expiryDateString && (
            <p className="small">
              {MESSAGES.spendForNextReward
                .replace(
                  '{{ amount }}',
                  formatMoney(spendToNextReward, window.theme?.moneyFormatWithoutDecimalsOrCurrency)
                )
                .replace('{{ date }}', dateTimeFormatterLong.format(new Date(expiryDateString)))}
            </p>
          )}
          <p className="small">
            <strong>
              {MESSAGES.nextReward.replace(
                '{{ amount }}',
                formatMoney(nextRewardAmount * 100, window.theme?.moneyFormatWithoutDecimalsOrCurrency)
              )}
            </strong>
          </p>
        </div>
      </div>
      {rewards.length > 0 && (
        <RewardsSummaryTable rewards={rewards} />
      )}
    </>
  );
};

export {RewardsInfo};
