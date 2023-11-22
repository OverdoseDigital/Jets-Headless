import React from 'react';

const TrendIcon = ({colorVar = '--color-grey-5'}) => (
  <svg
    aria-label="Reward tier ribbon"
    className="icon icon-trend"
    style={{color: `var(${colorVar})`}}
    viewBox="0 0 17 12"
    width="17"
    height="12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m1.5 10.5 5.065-5.065a.75.75 0 0 1 .947-.094L9.488 6.66a.75.75 0 0 0 .947-.094L15.496 1.5"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
    <path d="M12.344 1.5h3.154v3.154" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>
);

export {TrendIcon};
