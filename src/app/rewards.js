import React from 'react';
import ReactDOM from 'react-dom';

// eslint-disable-next-line @shopify/strict-component-boundaries
import Rewards from './components/rewards';

const mountRewards = (props) => {
  ReactDOM.render(<Rewards {...props} />, document.querySelector('#react-account-rewards'));
};

export default mountRewards;
