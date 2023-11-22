import React, {useState, useEffect} from 'react';
import {formatMoney} from '@shopify/theme-currency';

const RewardsBalance = () => {
  // eslint-disable-next-line no-unused-vars
  const [balance, error] = useBalance();

  return (
    window.theme?.customer &&
    window.theme?.rewards?.enabled &&
    balance && (
      <div className="cart__rewards-balance">
        <p>
          <span>{window.theme.rewards.yourRewardsBalance}</span>
          <span>{formatMoney(balance, window.theme.moneyFormatWithoutCurrency)}</span>
        </p>
      </div>
    )
  );
};

const useBalance = () => {
  const [balance, setBalance] = useState();
  const [error, setError] = useState();
  useEffect(() => {
    if (!window.theme?.rewards?.enabled) return;

    document.addEventListener('rewardsInfoFetched', () => {
      setBalance(window.rewardsApi.data.balance);
    });

    document.addEventListener('rewardsInfoFetchError', () => {
      setError(window.theme.rewards.error);
    });
  }, []);
  return [balance, error];
};

export default RewardsBalance;
