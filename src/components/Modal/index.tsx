import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Logo from "../Logo";
import modalState from "../../state-observables/modal/ModalState";

import styles from "./styles.module.css";

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS))
    .filter((element) =>
      element.tabIndex >= 0 &&
      !element.hidden &&
      element.getAttribute("aria-hidden") !== "true"
    );

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const focusRestoreTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const hasRestoredFocusRef = useRef(false);
  const generatedId = useId();
  const titleId = `${generatedId}-title`;

  const scheduleFocusRestoration = useCallback(() => {
    if (hasRestoredFocusRef.current) {
      return;
    }

    hasRestoredFocusRef.current = true;
    const previouslyFocusedElement = previouslyFocusedElementRef.current;
    focusRestoreTimerRef.current = window.setTimeout(() => {
      focusRestoreTimerRef.current = null;
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus({ preventScroll: true });
      }
    }, 0);
  }, []);

  const closeModalHandler = useCallback(() => {
    if (closingRef.current) {
      return;
    }

    closingRef.current = true;
    setClosing(true);
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    closeTimerRef.current = window.setTimeout(() => {
      setShowModal(false);
      modalResetter();
      closeTimerRef.current = null;
    }, prefersReducedMotion ? 0 : 700);
  }, [modalResetter]);

  useEffect(() => {
    if (focusRestoreTimerRef.current !== null) {
      window.clearTimeout(focusRestoreTimerRef.current);
      focusRestoreTimerRef.current = null;
    }
    hasRestoredFocusRef.current = false;
    previouslyFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIsBrowser(true);

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      scheduleFocusRestoration();
    };
  }, [scheduleFocusRestoration]);

  useEffect(() => {
    if (showModal) {
      window.scrollTo({ top: 0 });
      const previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousBodyOverflow;
      };
    }

    return undefined;
  }, [showModal]);

  useEffect(() => {
    if (shouldCloseModal) {
      closeModalHandler();
    }
  }, [shouldCloseModal, closeModalHandler]);

  useEffect(() => {
    if (!isBrowser || !showModal) {
      return undefined;
    }

    const dialog = dialogRef.current;
    if (!dialog) {
      return undefined;
    }

    const initialFocusTarget =
      dialog.querySelector<HTMLElement>("[data-modal-initial-focus]") ||
      getFocusableElements(dialog)[0] ||
      dialog;
    initialFocusTarget.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!closingRef.current) {
          event.preventDefault();
          event.stopPropagation();
          modalState.closeModal();
        }
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstFocusableElement || activeElement === dialog)) {
        event.preventDefault();
        lastFocusableElement.focus();
      } else if (!event.shiftKey && activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement.focus();
      } else if (!dialog.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastFocusableElement : firstFocusableElement).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isBrowser, showModal]);

  const modalContent = showModal ? (
    <div className={styles.styledModalOverlay}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={[styles.styledModal, closing ? styles.styleModalLeaveToTop : styles.styleModalComeInFromTop].join(" ")}
      >
        <div className={styles.styledModalHeader}></div>
        {withLogo && <div className={styles.modalLogoContainer}><Logo /></div>}
        {title && <h2 id={titleId} className={styles.styledTitle}>{title}</h2>}
        <div className={styles.styledModalBody}>{children}</div>
      </div>
    </div>
  ) : null;

  if (isBrowser && showModal) {
    const portalTarget = document.getElementById("sensors-dashboard-modal-main-container");
    if (!portalTarget) {
      return null;
    }

    return ReactDOM.createPortal(
      modalContent,
      portalTarget
    );
  } else {
    return null;
  }
}
export default Modal;
