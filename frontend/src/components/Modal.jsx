// src/components/Modal.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css'; // Import CSS Module

function Modal({ isOpen, onClose, children, title }) {
  // console.log("Modal component rendering. isOpen:", isOpen); // Diagnostic log removed for final code

  if (!isOpen) return null;

  // We need to clone children to inject props if children is a single element.
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onClose: onClose });
    }
    return child;
  });

  return ReactDOM.createPortal(
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} onClick={onClose}> {/* <-- NEW: Add overlayOpen class */}
      <div className={`${styles.modalContent} ${isOpen ? styles.modalContentOpen : ''}`} onClick={(e) => e.stopPropagation()}> {/* <-- NEW: Add modalContentOpen class */}
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          {childrenWithProps}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

export default Modal;