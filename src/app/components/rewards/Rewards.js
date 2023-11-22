import React, {useState, useEffect} from 'react';

import {RewardsInfo} from './RewardsInfo';
import {RewardsError} from './RewardsError';
import {MESSAGES} from './constants';

const Rewards = ({nextRewardAmount}) => {
  const [rewardsInfo, rewardsError] = useRewardsInfo();

  return (
    (rewardsInfo && <RewardsInfo info={rewardsInfo} nextRewardAmount={nextRewardAmount} />) ||
    (rewardsError && <RewardsError error={rewardsError} />) || <p>{MESSAGES.loading}</p>
  );
};

const useRewardsInfo = () => {
  const [rewardsInfo, setRewardsInfo] = useState();
  const [rewardsError, setRewardsError] = useState();

  useEffect(makeRewardsInfoFetcher(setRewardsInfo, setRewardsError), []);

  return [rewardsInfo, rewardsError];
};

const makeRewardsInfoFetcher = (setRewardsInfo, setRewardsError) => () => {
  document.addEventListener('rewardsInfoFetched', () => {
    setRewardsInfo(window.rewardsApi.data);
  });

  document.addEventListener('rewardsInfoFetchError', () => {
    setRewardsError(window.theme.rewards.error);
  });
};

export default Rewards;
