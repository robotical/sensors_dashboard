import { useState } from "react";
import modalState from "../../../state-observables/modal/ModalState";
import styles from "./styles.module.css";
import GeneralInfo from "./GeneralInfo";
import Terminology from "./Terminology";

export default function HowToUseModal() {
  const [activeTab, setActiveTab] = useState<"general-info" | "terminology">("general-info");

  return (
    <div className={styles.howToUseModalContainer}>
        <div className={styles.tabs}>
          <button
            className={activeTab === "general-info" ? styles.activeTab : ''}
            onClick={() => setActiveTab("general-info")}
          >
            General Info
          </button>
          <button
            className={activeTab === "terminology" ? styles.activeTab : ''}
            onClick={() => setActiveTab("terminology")}
          >
            Terminology
          </button>
        </div>
        <div className={styles.tabContent}>
          {activeTab === "general-info" && <GeneralInfo />}
          {activeTab === "terminology" && <Terminology />}
        </div>
      <button className={styles.closeButton} onClick={() => modalState.closeModal()}> Close </button>
    </div>
  );
}