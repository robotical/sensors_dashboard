import { KeyboardEvent, useId, useRef, useState } from "react";
import modalState from "../../../state-observables/modal/ModalState";
import styles from "./styles.module.css";
import GeneralInfo from "./GeneralInfo";
import Terminology from "./Terminology";

export default function HowToUseModal() {
  const [activeTab, setActiveTab] = useState<"general-info" | "terminology">("general-info");
  const tabsId = useId();
  const quickStartTabRef = useRef<HTMLButtonElement>(null);
  const terminologyTabRef = useRef<HTMLButtonElement>(null);

  const selectTab = (tab: "general-info" | "terminology") => {
    setActiveTab(tab);
    if (tab === "general-info") {
      quickStartTabRef.current?.focus();
    } else {
      terminologyTabRef.current?.focus();
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    selectTab(activeTab === "general-info" ? "terminology" : "general-info");
  };

  return (
    <div className={styles.howToUseModalContainer}>
        <p className={styles.modalIntro}>
          Follow the quick start to create a live sensor graph, or look up what each sensor reports.
        </p>
        <div className={styles.tabs} role="tablist" aria-label="Dashboard guide sections">
          <button
            ref={quickStartTabRef}
            type="button"
            role="tab"
            id={`${tabsId}-quick-start-tab`}
            aria-controls={`${tabsId}-quick-start-panel`}
            aria-selected={activeTab === "general-info"}
            tabIndex={activeTab === "general-info" ? 0 : -1}
            className={`${styles.button} ${activeTab === "general-info" ? styles.activeTab : ''}`}
            onClick={() => selectTab("general-info")}
            onKeyDown={handleTabKeyDown}
          >
            Quick start
          </button>
          <button
            ref={terminologyTabRef}
            type="button"
            role="tab"
            id={`${tabsId}-terminology-tab`}
            aria-controls={`${tabsId}-terminology-panel`}
            aria-selected={activeTab === "terminology"}
            tabIndex={activeTab === "terminology" ? 0 : -1}
            className={`${styles.button} ${activeTab === "terminology" ? styles.activeTab : ''}`}
            onClick={() => selectTab("terminology")}
            onKeyDown={handleTabKeyDown}
          >
            Sensor terms
          </button>
        </div>
        <div
          className={styles.tabContent}
          role="tabpanel"
          id={`${tabsId}-${activeTab === "general-info" ? "quick-start" : "terminology"}-panel`}
          aria-labelledby={`${tabsId}-${activeTab === "general-info" ? "quick-start" : "terminology"}-tab`}
        >
          {activeTab === "general-info" && <GeneralInfo />}
          {activeTab === "terminology" && <Terminology />}
        </div>
      <button type="button" className={styles.closeButton} onClick={() => modalState.closeModal()}>
        Close guide
      </button>
    </div>
  );
}
