/**
 * A small, dependency-free utility to play and pause YouTube and Vimeo
 * iFrame players without needing to load an external SDK.
 * @param {HTMLIFrameElement} video - YouTube or Vimeo player iFrame
 * @param {('play'|'pause')} action - `play` or `pause` the player
 */
export const playPause = (video, action) => {
  if (video?.tagName !== 'IFRAME') return;
  if (!video?.contentWindow?.postMessage) return;
  if (!video?.src?.match(/(youtube|vimeo)/)) return;
  if (action !== 'play' && action !== 'pause') return;

  const messageBuilder = (src) => {
    const videoType = src.match('youtube') ? 'youtube' : 'vimeo';
    const messageObject = videoType === 'youtube' ? {event: 'command', func: `${action}Video`} : {method: action};
    return JSON.stringify(messageObject);
  };

  const message = messageBuilder(video.src);
  video.contentWindow.postMessage(message, '*');
};
