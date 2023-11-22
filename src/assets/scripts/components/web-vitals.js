import {getCLS, getFID, getLCP, getFCP, getTTFB} from 'web-vitals';

function sendToGoogleAnalytics({name, delta, id}) {
  // Assumes the global `ga()` function exists, hence window.load
  // listener used below.
  ga('send', 'event', {
    eventCategory: 'Web Vitals',
    eventAction: name,
    eventValue: Math.round(name === 'CLS' ? delta * 1000 : delta),
    eventLabel: id,
    nonInteraction: true,
  });
}

window.addEventListener('load', () => {
  if (typeof window.ga === 'undefined') {
    return;
  }
  getCLS(sendToGoogleAnalytics);
  getFID(sendToGoogleAnalytics);
  getLCP(sendToGoogleAnalytics);
  getFCP(sendToGoogleAnalytics);
  getTTFB(sendToGoogleAnalytics);
});
