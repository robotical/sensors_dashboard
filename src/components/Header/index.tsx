import Connection from "../connection";
import styles from "./styles.module.css";
import modalState from "../../state-observables/modal/ModalState";
import HowToUseModal from "../modals/HowToUseModal";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import { useEffect, useState } from "react";

export default function Header() {
  const [isModal, setIsModal] = useState(mv2Dashboard.isModal);

  useEffect(() => {
    mv2Dashboard.addEventListener(
      "onIsModalChange",
      "",
      onIsModalChanged
    );
    return () => {
      mv2Dashboard.removeEventListener(
        "onIsModalChange",
        "",
        onIsModalChanged
      );
    };
  }, []);

  const onIsModalChanged = () => {
    setIsModal(mv2Dashboard.isModal);
  };

  return (
    <div className={styles.header}>
      {!!!isModal && <Connection />}
      {!!!isModal && <div className={styles.title}>Sensor Insights Hub</div>}
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
