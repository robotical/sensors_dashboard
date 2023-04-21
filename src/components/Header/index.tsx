import Connection from "../connection";
import styles from "./styles.module.css";
import modalState from "../../state-observables/modal/ModalState";
import HowToUseModal from "../modals/HowToUseModal";
import mv2Dashboard from "../../app-bridge/mv2-rn";

export default function Header() {
  return (
    <div className={styles.header}>
      {!!!mv2Dashboard.isModal && <Connection />}
      {!!!mv2Dashboard.isModal && <div className={styles.title}>Sensor Insights Hub</div>}
      <button
        className={styles.helpButton}
        onClick={() =>
          modalState.setModal(HowToUseModal, "Discover the Dashboard: A User-friendly Guide!")
        }
      >
        HELP
      </button>
    </div>
  );
}
