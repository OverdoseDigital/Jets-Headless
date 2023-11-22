const rteVideosInit = () => {
  // Add wrapping div to videos in RTE
  const rteVideos = document.querySelectorAll('.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"]');
  if (rteVideos.length === 0) return;

  rteVideos.forEach((item) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('rte__video-wrapper');
    item.parentNode.insertBefore(wrapper, item);
    wrapper.appendChild(item);
  });
};

export default rteVideosInit;
