const customSelectHybrid = (customSelectHybridsSelectors) => {
  /* Features needed to make the selectCustom work for mouse users.

- Toggle custom select visibility when clicking the "box"
- Update custom select value when clicking in a option
- Navigate through options when using keyboard up/down
- Pressing Enter or Space selects the current hovered option
- Close the select when clicking outside of it
- Sync both selects values when selecting a option. (native or custom)

*/

  if (!customSelectHybridsSelectors && !customSelectHybridsSelectors.length > 0) return;

  customSelectHybridsSelectors.forEach((select) => {
    const elSelectNative = select.querySelector('.js-selectNative');
    const elSelectCustom = select.querySelector('.js-selectCustom');

    const elSelectCustomBox = elSelectCustom.children[0];
    const elSelectCustomOpts = elSelectCustom.children[1];

    let optionChecked = '';
    let optionHoveredIndex = -1;

    // Toggle custom select visibility when clicking the box
    elSelectCustomBox.addEventListener('click', () => {
      const isClosed = !elSelectCustom.classList.contains('isActive');

      if (isClosed) {
        openSelectCustom();
      } else {
        closeSelectCustom();
      }
    });

    function openSelectCustom() {
      const customOptsList = Array.from(elSelectCustomOpts.children);
      elSelectCustom.classList.add('isActive');
      // Remove aria-hidden in case this was opened by a user
      // who uses AT (e.g. Screen Reader) and a mouse at the same time.
      elSelectCustom.setAttribute('aria-hidden', false);

      if (optionChecked) {
        const optionCheckedIndex = customOptsList.findIndex((el) => el.getAttribute('data-value') === optionChecked);

        updateCustomSelectHovered(optionCheckedIndex);
      }

      // Add related event listeners
      document.addEventListener('click', watchClickOutside);
      document.addEventListener('keydown', supportKeyboardNavigation);
    }

    function closeSelectCustom() {
      elSelectCustom.classList.remove('isActive');

      elSelectCustom.setAttribute('aria-hidden', true);

      updateCustomSelectHovered(-1);

      // Remove related event listeners
      document.removeEventListener('click', watchClickOutside);
      document.removeEventListener('keydown', supportKeyboardNavigation);
    }

    function updateCustomSelectHovered(newIndex) {
      const prevOption = elSelectCustomOpts.children[optionHoveredIndex];
      const option = elSelectCustomOpts.children[newIndex];

      if (prevOption) {
        prevOption.classList.remove('isHover');
      }
      if (option) {
        option.classList.add('isHover');
      }

      optionHoveredIndex = newIndex;
    }

    function updateCustomSelectChecked(value, text) {
      const prevValue = optionChecked;

      const elPrevOption = elSelectCustomOpts.querySelector(`[data-value="${prevValue}"`);

      const elOption = elSelectCustomOpts.querySelector(`[data-value="${value}"`);

      if (elPrevOption) {
        elPrevOption.classList.remove('isActive');
      }

      if (elOption) {
        elOption.classList.add('isActive');
      }

      elSelectCustomBox.textContent = text;
      optionChecked = value;
    }

    function watchClickOutside(evt) {
      const didClickedOutside = !elSelectCustom.contains(evt.target);
      if (didClickedOutside) {
        closeSelectCustom();
      }
    }

    function supportKeyboardNavigation(evt) {
      const customOptsList = Array.from(elSelectCustomOpts.children);
      const optionsCount = customOptsList.length;
      // press down -> go next
      if (evt.keyCode === 40 && optionHoveredIndex < optionsCount - 1) {
        // prevent page scrolling
        evt.preventDefault();
        updateCustomSelectHovered(optionHoveredIndex + 1);
      }

      // press up -> go previous
      if (evt.keyCode === 38 && optionHoveredIndex > 0) {
        // prevent page scrolling
        evt.preventDefault();
        updateCustomSelectHovered(optionHoveredIndex - 1);
      }

      // press Enter or space -> select the option
      if (evt.keyCode === 13 || evt.keyCode === 32) {
        evt.preventDefault();

        const option = elSelectCustomOpts.children[optionHoveredIndex];
        const value = option && option.getAttribute('data-value');

        if (value) {
          elSelectNative.value = value;
          updateCustomSelectChecked(value, option.textContent);
        }
        closeSelectCustom();
      }

      // press ESC -> close selectCustom
      if (evt.keyCode === 27) {
        closeSelectCustom();
      }
    }

    // Update selectCustom value when selectNative is changed.
    elSelectNative.addEventListener('change', (evt) => {
      const value = evt.target.value;
      const elRespectiveCustomOption = elSelectCustomOpts.querySelectorAll(`[data-value="${value}"]`)[0];

      updateCustomSelectChecked(value, elRespectiveCustomOption.textContent);
    });

    // Update selectCustom value when an option is clicked or hovered
    elSelectCustomOpts.addEventListener('click', (evt) => {
      const option = evt.target.closest('.selectCustom-option');
      if (!option) return;
      const value = option.getAttribute('data-value');
      // Sync native select to have the same value
      elSelectNative.value = value;
      elSelectNative.dispatchEvent(new Event('change'));
      updateCustomSelectChecked(value, option.textContent);
      closeSelectCustom();
    });

    elSelectCustomOpts.addEventListener('mouseover', (evt) => {
      const option = evt.target.closest('.selectCustom-option');
      if (!option) return;
      const value = option.getAttribute('data-value');
      const index = [...elSelectCustomOpts.children].findIndex((el) => el.dataset.value === value);
      updateCustomSelectHovered(index);
    });
  });
};

export default customSelectHybrid;
