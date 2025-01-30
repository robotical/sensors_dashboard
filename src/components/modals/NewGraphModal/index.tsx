import { NewRobotIdE } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import CogIcon from "../../../assets/connect-button/cog_selected.svg";
import MartyIcon from "../../../assets/connect-button/marty_selected.svg";
import styles from "./styles.module.css";
import { RaftTypeE } from "@robotical/webapp-types/dist-types/src/types/raft";
import modalState from "../../../state-observables/modal/ModalState";
import { FaTimes } from "react-icons/fa";

export default function NewGraphModal() {
  const connectedRaftsArray = window.applicationManager?.connectedRaftsContext;

  const handleRaftClick = (raftId: string) => {
    console.log(`Raft with id ${raftId} clicked`);
    modalState.closeModal(raftId);
  };

  const areThereConnectedRafts = connectedRaftsArray.filter(raft => raft.id !== NewRobotIdE.NEW).length > 0;

  return (
    <div className={styles.newGraphModalContainer}>
        <FaTimes className={styles.closeIcon} onClick={() => modalState.closeModal()} /> {/* Add the X icon */}
        {
          areThereConnectedRafts
            ? <h6 className={styles.title}>Select a robot to generate a graph</h6>
            : <h2 className={styles.title}>No robots connected. Please close this window and connect a robot to continue.</h2>
        }
      <div className={styles.gridContainer}>
        {connectedRaftsArray.filter(raftFil => raftFil.id !== NewRobotIdE.NEW).map((raft, index) => {

          let raftIcon;
          if (raft.type === RaftTypeE.COG) {
            raftIcon = CogIcon;
          } else if (raft.type === RaftTypeE.MARTY) {
            raftIcon = MartyIcon;
          }

          return (
            <div key={raft.id} className={styles.card} onClick={() => handleRaftClick(raft.id)}>
              <img src={raftIcon} alt="Raft Icon" className={styles.icon} />
              <div className={styles.raftName}>{raft.name}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}