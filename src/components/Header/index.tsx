import styles from "./styles.module.css";
import modalState from "../../state-observables/modal/ModalState";
import HowToUseModal from "../modals/HowToUseModal";
import { createElement, useEffect, useState } from "react";
import ConnectionArea from "../ConnectionArea";

type Props = {
  isInModal?: boolean;
}

export default function Header({ isInModal }: Props) {

  return (
    <div className={styles.header}>
      {!!!isInModal && <ConnectionArea
        isNavMenuMinimized={false}
      />}
      {!!!isInModal && <div className={styles.title}>Sensor Insights Hub</div>}
      <button
        className={styles.helpButton}
        onClick={() =>
          modalState.setModal(createElement(HowToUseModal, {}), "Discover the Dashboard: A User-friendly Guide!")
        }
      >
        HELP
      </button>
    </div>
  );
}
