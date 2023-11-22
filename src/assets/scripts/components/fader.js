const fadeInPage = () => {
  const fader = () => {
    if (!window.AnimationEvent) {
      return;
    }
    const $fader = document.querySelector('#fader');
    $fader?.classList.add('fade-out');
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.AnimationEvent) return;

    const $fader = document.querySelector('#fader');
    if (!$fader) return;

    const anchors = document.querySelectorAll('a');
    for (const anchor of anchors) {
      if (anchor.hostname !== window.location.hostname) continue;

      anchor.addEventListener('click', (event) => {
        event.preventDefault();

        const target = event.currentTarget;
        const listener = () => {
          window.location = target.href;
          $fader.removeEventListener('animationend', listener);
        };

        $fader.addEventListener('animationend', listener);

        $fader.classList.add('fade-in');
      });
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;

    const $fader = document.querySelector('#fader');
    $fader?.classList.remove('fade-in');
  });

  fader();
};

export default fadeInPage;
