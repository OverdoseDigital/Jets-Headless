import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {createPortal} from 'react-dom';
import FocusTrap from 'focus-trap-react';
import cx from 'classnames';

import iconClose from '../../../assets/svg/icon-cross.svg';

const Modal = ({
  isOpen = false,
  size = 'md',
  triggerLabel,
  closeLabel = 'Close Modal',
  className,
  children,
  container = document.body,
  toggleClass,
  toggleEvent,
}) => {
  const [open, setOpen] = useState(isOpen);

  const toggleScrollLock = () => document.querySelector('html')?.classList.toggle('scroll-lock');

  const toggleOpenClass = () => {
    const toggleClassString = toggleClass ? `${toggleClass}-` : '';
    document.querySelector('html')?.classList.toggle(`modal-${toggleClassString}open`);
  };

  const closeModal = () => {
    setOpen(false);
    toggleScrollLock();
    toggleOpenClass();
  };

  const toggleModal = () => {
    setOpen(!open);
    toggleScrollLock();
    toggleOpenClass();
  };

  const handleEscKey = (event) => event.keyCode === 27 && closeModal();

  const handleOutsideClick = (event) => event.target === event.currentTarget && closeModal();

  /**
   * The below useEffect() allows the modal to be toggled with a custom event; toggleEvent.
   */
  useEffect(() => {
    if (!toggleEvent) return;
    document.addEventListener(toggleEvent, toggleModal);
    return () => document.removeEventListener(toggleEvent, toggleModal);
  }, [open]);

  return (
    <>
      <button onClick={toggleModal} className={cx('modal__trigger', className)} type="button">
        {triggerLabel}
      </button>

      {!open && null}

      {open &&
        createPortal(
          <FocusTrap>
            {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */}
            <div
              className={cx('modal', size === 'sm' && 'modal--sm', size === 'md' && 'modal--md')}
              role="dialog"
              tabIndex={-1}
              aria-modal="true"
              onClick={handleOutsideClick}
              onKeyDown={handleEscKey}
            >
              {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */}
              <div className="modal__dialog">
                <div className="container">
                  <button className="modal__close-button" onClick={closeModal} aria-label={closeLabel} type="button">
                    <span dangerouslySetInnerHTML={{__html: iconClose}} />
                  </button>
                  <div className="modal__body">{children}</div>
                </div>
              </div>
            </div>
          </FocusTrap>,
          container
        )}
    </>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'full-screen']),
  triggerLabel: PropTypes.node,
  closeLabel: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  container: PropTypes.node,
  toggleEvent: PropTypes.string,
  toggleClass: PropTypes.string,
};

export default Modal;
