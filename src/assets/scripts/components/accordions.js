const accordionsInit = () => {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach((accordion) => {
    const triggers = accordion.querySelectorAll('.accordion__trigger');
    const panels = accordion.querySelectorAll('.accordion__panel');

    panels.forEach((panel) => {
      if (panel.classList.contains('show-panel')) {
        panel.style.height = `${panel.scrollHeight}px`;
      }
    });

    const handleClick = (event) => {
      // find the current trigger
      const currentTrigger = event.target.closest('.accordion__trigger');

      // if we haven't clicked on a trigger return
      if (!currentTrigger) {
        return;
      }

      // find the current panel
      const panelId = currentTrigger.getAttribute('aria-controls');
      const currentPanel = accordion.querySelector(`#${panelId}`);
      const multiplePanes = currentTrigger.getAttribute('aria-multi');

      if (multiplePanes !== '1') {
        // hide all panels
        triggers.forEach((trigger) => {
          if (trigger !== currentTrigger) {
            trigger.setAttribute('aria-expanded', false);
          }
        });
        panels.forEach((panel) => {
          if (panel === currentPanel) {
            const ariaState = currentTrigger.getAttribute('aria-expanded');
            if (ariaState === 'true') {
              currentTrigger.setAttribute('aria-expanded', false);
              panel.style.height = 0;
            } else {
              currentTrigger.setAttribute('aria-expanded', true);
              panel.style.height = `${panel.scrollHeight}px`;
            }
          } else {
            panel.style.height = 0;
          }
        });
      } else if (multiplePanes === '1') {
        if (currentTrigger.getAttribute('aria-expanded') === 'true') {
          currentTrigger.setAttribute('aria-expanded', false);
          currentPanel.style.height = 0;
        } else {
          currentTrigger.setAttribute('aria-expanded', true);
          currentPanel.style.height = `${currentPanel.scrollHeight}px`;
        }
      }
    };

    // attach event listener to the accordion itself
    accordion.addEventListener('click', handleClick);
  });
};

export default accordionsInit;
