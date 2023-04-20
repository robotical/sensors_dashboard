import Header from "../../components/Header";
import MainContent from "../../components/MainContent";
import styles from "./styles.module.css";
import { useEffect, useState } from "react";
import {
  ModalEventTopics,
  ModalStateData,
} from "../../state-observables/modal/ModalObserver";
import modalState from "../../state-observables/modal/ModalState";

import Modal from "../../components/Modal";

export default function LandingPage() {
  const [modalData, setModalData] = useState<null | ModalStateData>(null);
  const [shouldCloseModal, setShouldCloseModal] = useState(false);

  const modalSubscriptionHelper = {
    notify(eventTopic: ModalEventTopics, eventData: ModalStateData) {
      switch (eventTopic) {
        case "SetModal":
          setModalData(eventData);
          break;
        case "CloseModal":
          setShouldCloseModal(true);
          break;
      }
    },
  };

  // Create subscription to the modal state
  useEffect(() => {
    // Subscribe
    modalState.subscribe(modalSubscriptionHelper, ["SetModal", "CloseModal"]);

    // Return unsubscribe function
    return () => {
      modalState.unsubscribe(modalSubscriptionHelper);
    };
  }, []);

  const resetModal = () => {
    setShouldCloseModal(false);
    setModalData(null);
  };
  return (
    <>
      {!!modalData?.modalContent && <Modal
          title={modalData ? modalData.modalTitle : ""}
          modalResetter={resetModal}
          shouldCloseModal={shouldCloseModal}
          withLogo
        >
          {modalData && modalData.modalContent && <modalData.modalContent />}
        </Modal>
      }
      <main id="modal-main-container"></main>
      <main className={styles.mainContainer}>
        <Header />
        <MainContent />
      </main>
    </>
  );
}
