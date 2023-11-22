import React from 'react';
import PropTypes from 'prop-types';
import Flickity from 'react-flickity-component';

const flickityOptions = {
  draggable: '>1',
  wrapAround: true,
  groupCells: false,
  pageDots: true,
  prevNextButtons: false,
  autoPlay: true,
  cellAlign: 'center',
  watchCSS: true,
};

const TrustIndicatorsInnerContent = () => (
  <>
    {window.theme.indicators.text1 && (
      <>
        {window.theme.indicators.link1 ? (
          <a href={window.theme.indicators.link1} className="trust-indicator">
            <span className="trust-indicator__icon">
              <svg
                aria-label={window.theme.indicators.text1}
                className={`icon icon-${window.theme.indicators.icon1}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <use xlinkHref="#iconIndicator1" />
              </svg>
            </span>
            <span className="trust-indicator__text">{window.theme.indicators.text1}</span>
          </a>
        ) : (
          <span className="trust-indicator">
            <span className="trust-indicator__icon">
              <svg
                aria-label={window.theme.indicators.text1}
                className={`icon icon-${window.theme.indicators.icon1}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <use xlinkHref="#iconIndicator1" />
              </svg>
            </span>
            <span className="trust-indicator__text">{window.theme.indicators.text1}</span>
          </span>
        )}
      </>
    )}
    {window.theme.indicators.text2 && (
      <>
        {window.theme.indicators.link2 ? (
          <a href={window.theme.indicators.link2} className="trust-indicator">
            <span className="trust-indicator__icon">
              <svg
                aria-label={window.theme.indicators.text2}
                className={`icon icon-${window.theme.indicators.icon2}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <use xlinkHref="#iconIndicator2" />
              </svg>
            </span>
            <span className="trust-indicator__text">{window.theme.indicators.text2}</span>
          </a>
        ) : (
          <span className="trust-indicator">
            <span className="trust-indicator__icon">
              <svg
                aria-label={window.theme.indicators.text2}
                className={`icon icon-${window.theme.indicators.icon2}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <use xlinkHref="#iconIndicator2" />
              </svg>
            </span>
            <span className="trust-indicator__text">{window.theme.indicators.text2}</span>
          </span>
        )}
      </>
    )}
    {window.theme.indicators.text3 && (
      <>
        {window.theme.indicators.link3 ? (
          <a href={window.theme.indicators.link3} className="trust-indicator">
            <span className="trust-indicator__icon">
              <svg
                aria-label={window.theme.indicators.text3}
                className={`icon icon-${window.theme.indicators.icon3}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <use xlinkHref="#iconIndicator3" />
              </svg>
            </span>
            <span className="trust-indicator__text">{window.theme.indicators.text3}</span>
          </a>
        ) : (
          <span className="trust-indicator">
            <span className="trust-indicator__icon">
              <svg
                aria-label={window.theme.indicators.text3}
                className={`icon icon-${window.theme.indicators.icon3}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <use xlinkHref="#iconIndicator3" />
              </svg>
            </span>
            <span className="trust-indicator__text">{window.theme.indicators.text3}</span>
          </span>
        )}
      </>
    )}
  </>
);

const TrustIndicators = ({layout, isCartPage}) => (
  <>
    {layout === 'grid' && isCartPage ? (
      <div className="trust-indicators">
        <TrustIndicatorsInnerContent />
      </div>
    ) : (
      <Flickity
        className={isCartPage ? 'trust-indicators--slider  trust-indicators--slider-alt' : 'trust-indicators--slider'}
        elementType="div"
        options={flickityOptions}
        disableImagesLoaded={false}
        reloadOnUpdate
        static
      >
        <TrustIndicatorsInnerContent />
      </Flickity>
    )}
  </>
);

TrustIndicators.propTypes = {
  layout: PropTypes.string,
  isCartPage: PropTypes.bool,
};

export default TrustIndicators;
