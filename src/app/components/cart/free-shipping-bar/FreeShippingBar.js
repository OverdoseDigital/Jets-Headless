import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {formatMoney} from '@shopify/theme-currency';

const FreeShippingBar = ({total, freeShippingBarSettings, items}) => {
  const {remainingTemplate, reachedTemplate, serviceOne, thresholdOne} = freeShippingBarSettings;
  const [shippingProgressVisible, setShippingProgressVisible] = useState(true)
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

  useEffect(() => {
    let hasUpsellOffers = false
    let itemsWithUpsells = items.filter(i => i?.properties?._upsell_data)
    if(itemsWithUpsells.length) {
      itemsWithUpsells.map(iwu => {
        let upsellData = JSON.parse(iwu.properties?._upsell_data)
        let inCart = items.find(i => i.handle == upsellData.handle)
        if(!inCart) hasUpsellOffers = true
      })
    }
    if(hasUpsellOffers) {
      setShippingProgressVisible(false)
    } else {
      setShippingProgressVisible(true)
    }
  }, [items]);

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

  return ( shippingProgressVisible ?
    <div className="cart__free-shipping">
      <div className="cart__progress">
        <div className="cart__progress-bar" style={barWidth} />
      </div>
      <p>{barMessage}</p>
    </div> : null
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
