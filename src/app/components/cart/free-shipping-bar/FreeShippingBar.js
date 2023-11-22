import React from 'react';
import PropTypes from 'prop-types';
import {formatMoney} from '@shopify/theme-currency';

const FreeShippingBar = ({total, freeShippingBarSettings}) => {
  const {remainingTemplate, reachedTemplate, serviceOne, thresholdOne} = freeShippingBarSettings;

  /**
   * Create the free shipping remaining spend message.
   * @param {number} cartTotal
   * @param {number} threshold
   * @param {string} service
   * @returns {string}
   */
  const createRemainingMessage = (cartTotal, threshold, service) => {
    const remainingAmt = formatMoney(threshold - cartTotal, window.theme.moneyFormat);
    return remainingTemplate.replace('{{ amount }}', remainingAmt).replace('{{ service }}', service);
  };

  /**
   * Construct free shipping bar percentage and message.
   *
   * @return {{percentage:Number, message:String}}
   */
  const calcFreeShippingStatus = () => {
    if (total < thresholdOne) {
      return {
        barPercentage: (total / thresholdOne) * 100,
        barMessage: createRemainingMessage(total, thresholdOne, serviceOne),
      };
    } else {
      const service = serviceOne;
      return {
        barPercentage: 100,
        barMessage: reachedTemplate.replace('{{ service }}', service),
      };
    }
  };

  const {barPercentage, barMessage} = calcFreeShippingStatus();
  const barWidth = {
    width: `${barPercentage}%`,
  };

  return (
    <div className="cart__free-shipping">
      <div className="cart__progress">
        <div className="cart__progress-bar" style={barWidth} />
      </div>
      <p>{barMessage}</p>
    </div>
  );
};

FreeShippingBar.propTypes = {
  total: PropTypes.number,
  freeShippingBarSettings: PropTypes.shape({
    enabled: PropTypes.bool.isRequired,
    remainingTemplate: PropTypes.string.isRequired,
    reachedTemplate: PropTypes.string.isRequired,
    serviceOne: PropTypes.string.isRequired,
    thresholdOne: PropTypes.number.isRequired,
  }),
};

export default FreeShippingBar;
