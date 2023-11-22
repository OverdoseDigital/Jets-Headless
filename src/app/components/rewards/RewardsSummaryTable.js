import React from 'react';
import {formatMoney} from '@shopify/theme-currency';

import {MESSAGES} from './constants';
import {dateTimeFormatter} from './helpers';

const RewardsSummaryTable = ({rewards}) => (
  <div className="account__rewards-summary">
    <h5>{MESSAGES.rewardsTableTitle}</h5>
    <table>
      <tr>
        <th>{MESSAGES.tableColDescription}</th>
        <th>{MESSAGES.tableColExpiry}</th>
        <th>{MESSAGES.tableColRemaining}</th>
      </tr>
      {rewards.map(({description, expiryDate, remainingValue}, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <tr key={index}>
          <td>{description}</td>
          <td>{dateTimeFormatter.format(new Date(expiryDate))}</td>
          <td>{formatMoney(remainingValue, window.theme?.moneyFormatWithoutCurrency)}</td>
        </tr>
      ))}
    </table>
  </div>
);

export {RewardsSummaryTable};
