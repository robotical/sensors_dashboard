import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Logo from "../Logo";

import styles from "./styles.module.css";

type ModalPropsTypes = {
  children: React.ReactNode | null;
  title: string;
  shouldCloseModal: boolean;
  withLogo?: boolean;
  modalResetter: () => void;
};

function Modal({
  children,
  title,
  shouldCloseModal,
  withLogo,
  modalResetter
}: ModalPropsTypes) {
  const [isBrowser, setIsBrowser] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showModal, setShowModal] = useState(true);

  const closeModalHandler = useCallback(() => {
    setClosing(true);
    const timer = window.setTimeout(() => {
      document
        .getElementsByTagName("body")[0]
        .setAttribute("style", "overflow: auto");
      setShowModal(false);
      modalResetter();
      window.clearTimeout(timer);
    }, 700);
  }, [modalResetter]);

  useEffect(() => {
    setIsBrowser(true);
    if (showModal) {
      window.scrollTo({ top: 0 });
      document
        .getElementsByTagName("body")[0]
        .setAttribute("style", "overflow: hidden");
    }
  }, [showModal]);

  useEffect(() => {
    if (shouldCloseModal) {
      closeModalHandler();
    }
  }, [shouldCloseModal, closeModalHandler]);

  const modalContent = showModal ? (
    <div className={styles.styledModalOverlay}>
      <div 
        className={[styles.styledModal, closing ? styles.styleModalLeaveToTop : styles.styleModalComeInFromTop].join(" ")}
      >
        <div className={styles.styledModalHeader}></div>
        {withLogo && <div className={styles.modalLogoContainer}><Logo /></div>}
        {title && <h2 className={styles.styledTitle}>{title}</h2>}
        <div className={styles.styledModalBody}>{children}</div>
      </div>
    </div>
  ) : null;

  if (isBrowser && showModal) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("sensors-dashboard-modal-main-container")!
    );
  } else {
    return null;
  }
}
export default Modal;
