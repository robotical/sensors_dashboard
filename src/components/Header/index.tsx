import styles from "./styles.module.css";
import modalState from "../../state-observables/modal/ModalState";
import HowToUseModal from "../modals/HowToUseModal";
import { createElement } from "react";
import ConnectionArea from "../ConnectionArea";
import { FaQuestionCircle } from "react-icons/fa";

type Props = {
  isInModal?: boolean;
  deviceControlsRef?: (element: HTMLDivElement | null) => void;
}

export default function Header({ isInModal, deviceControlsRef }: Props) {

  return (
    <header className={`${styles.header} ${isInModal ? styles.headerInModal : ""}`}>
      {!isInModal && (
        <div className={styles.brand}>
          <span className={styles.eyebrow}>Robotical</span>
          <h1 className={styles.title}>Sensor Insights Hub</h1>
          <p className={styles.subtitle}>Live robot data, made visible.</p>
        </div>
      )}
      {!isInModal && (
        <div className={styles.connectionRegion} aria-label="Device connections">
          <div className={styles.robotPanel}>
            <ConnectionArea isNavMenuMinimized={false} />
          </div>
          <div ref={deviceControlsRef} className={styles.extensionRegion} />
        </div>
      )}
      <button
        type="button"
        className={styles.helpButton}
        onClick={() =>
          modalState.setModal(createElement(HowToUseModal, {}), "Sensor dashboard guide")
        }
      >
        <FaQuestionCircle aria-hidden="true" />
        <span>How it works</span>
      </button>
    </header>
  );
}
