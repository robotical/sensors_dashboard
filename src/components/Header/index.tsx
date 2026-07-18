import styles from "./styles.module.css";
import modalState from "../../state-observables/modal/ModalState";
import HowToUseModal from "../modals/HowToUseModal";
import { createElement } from "react";
import ConnectionArea from "../ConnectionArea";
import { FaQuestionCircle } from "react-icons/fa";

type Props = {
  isInModal?: boolean;
}

export default function Header({ isInModal }: Props) {

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
        <div className={styles.connectionRegion} aria-label="Robot connections">
          <ConnectionArea isNavMenuMinimized={false} />
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
