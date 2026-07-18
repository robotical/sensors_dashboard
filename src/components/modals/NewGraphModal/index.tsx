import { NewRobotIdE } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import CogIcon from "../../../assets/connect-button/cog_selected.svg";
import MartyIcon from "../../../assets/connect-button/marty_selected.svg";
import styles from "./styles.module.css";
import { RaftTypeE } from "@robotical/webapp-types/dist-types/src/types/raft";
import modalState from "../../../state-observables/modal/ModalState";
import { FaTimes } from "react-icons/fa";

export default function NewGraphModal() {
  const connectedRaftsArray = window.applicationManager?.connectedRaftsContext || [];

  const handleRaftClick = (raftId: string) => {
    modalState.closeModal(raftId);
  };

  const areThereConnectedRafts = connectedRaftsArray.filter(raft => raft.id !== NewRobotIdE.NEW).length > 0;

  return (
    <div className={styles.newGraphModalContainer}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={() => modalState.closeModal()}
          aria-label="Close add graph dialog"
          title="Close"
        >
          <FaTimes className={styles.closeIcon} aria-hidden="true" focusable="false" />
        </button>
        {
          areThereConnectedRafts
            ? <p className={styles.title}>Select a connected robot for this graph</p>
            : <p className={styles.title}>No robots are connected. Close this dialog and connect a robot to continue.</p>
        }
      <div className={styles.gridContainer} role="group" aria-label="Connected robots">
        {connectedRaftsArray.filter(raftFil => raftFil.id !== NewRobotIdE.NEW).map((raft, index) => {

          let raftIcon;
          if (raft.type === RaftTypeE.COG) {
            raftIcon = CogIcon;
          } else if (raft.type === RaftTypeE.MARTY) {
            raftIcon = MartyIcon;
          }

          const robotName = raft.name?.trim() || `${raft.type} robot`;

          return (
            <button
              key={raft.id}
              type="button"
              className={styles.card}
              onClick={() => handleRaftClick(raft.id)}
              aria-label={`Create graph for ${robotName}`}
              data-modal-initial-focus={index === 0 ? "true" : undefined}
            >
              <img src={raftIcon} alt="" aria-hidden="true" className={styles.icon} />
              <span className={styles.raftName}>{robotName}</span>
              <span className={styles.connectedStatus}>
                <span className={styles.connectedStatusDot} aria-hidden="true" />
                Connected
              </span>
            </button>
          )
        })}
      </div>
    </div>
  );
}
