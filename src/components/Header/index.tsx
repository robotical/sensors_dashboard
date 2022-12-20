import Connection from "../connection";
import styles from "./styles.module.css";
import modalState from "../../state-observables/modal/ModalState";
import HowToUseModal from "../modals/HowToUseModal";

export default function Header() {
  return (
    <div className={styles.header}>
      <Connection />
      <div className={styles.title}>Dashboard</div>
      <button
        className={styles.helpButton}
        onClick={() =>
          modalState.setModal(HowToUseModal, "How to use the Dashboard!")
        }
      >
        HELP
      </button>
    </div>
  );
}
