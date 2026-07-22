import { NewRobotIdE } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import CogIcon from "../../../assets/connect-button/cog_selected.svg";
import MartyIcon from "../../../assets/connect-button/marty_selected.svg";
import MicroBitIcon from "../../../assets/connect-button/microbit-small.svg";
import styles from "./styles.module.css";
import { RaftTypeE } from "@robotical/webapp-types/dist-types/src/types/raft";
import modalState from "../../../state-observables/modal/ModalState";
import { FaTimes } from "react-icons/fa";
import type MicroBitWebBluetooth from "../../../microbit/MicroBitWebBluetooth";
import { useEffect, useState } from "react";

type Props = {
  microBit?: MicroBitWebBluetooth | null;
};

export default function NewGraphModal({ microBit = null }: Props) {
  const [connectedMicroBit, setConnectedMicroBit] =
    useState<MicroBitWebBluetooth | null>(() =>
      microBit?.isConnected() ? microBit : null
    );
  const connectedRaftsArray = window.applicationManager?.connectedRaftsContext || [];
  const connectedRafts = connectedRaftsArray.filter(
    (raft) => raft.id !== NewRobotIdE.NEW
  );

  const handleDeviceClick = (deviceId: string) => {
    modalState.closeModal(deviceId);
  };

  useEffect(() => {
    if (!microBit?.isConnected()) {
      setConnectedMicroBit(null);
      return;
    }

    setConnectedMicroBit(microBit);
    const unsubscribe = microBit.addDisconnectListener(() =>
      setConnectedMicroBit(null)
    );
    if (!microBit.isConnected()) {
      setConnectedMicroBit(null);
    }
    return unsubscribe;
  }, [microBit]);

  const hasConnectedDevices =
    connectedRafts.length > 0 || Boolean(connectedMicroBit);

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
          hasConnectedDevices
            ? <p className={styles.title}>Select a connected device for this graph</p>
            : <p className={styles.title}>No devices are connected. Close this dialog and connect a device to continue.</p>
        }
      <div className={styles.gridContainer} role="group" aria-label="Connected devices">
        {connectedRafts.map((raft, index) => {

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
              onClick={() => handleDeviceClick(raft.id)}
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
        {connectedMicroBit && (
          <button
            type="button"
            className={styles.card}
            onClick={() => handleDeviceClick(connectedMicroBit.id)}
            aria-label={`Create graph for ${connectedMicroBit.getFriendlyName()}`}
            data-modal-initial-focus={connectedRafts.length === 0 ? "true" : undefined}
          >
            <img
              src={MicroBitIcon}
              alt=""
              aria-hidden="true"
              className={styles.icon}
            />
            <span className={styles.raftName}>{connectedMicroBit.getFriendlyName()}</span>
            <span className={styles.connectedStatus}>
              <span className={styles.connectedStatusDot} aria-hidden="true" />
              Connected
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
