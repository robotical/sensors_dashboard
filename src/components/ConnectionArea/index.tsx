import styles from "./styles.module.css";
import CogSelectedIcon from "../../assets/connect-button/cog_selected.svg";
import MartySelectedIcon from "../../assets/connect-button/marty_selected.svg";
import { ReactComponent as ConnectButtonDefault } from "../../assets/connect-button/connect_btn-default.svg";

import RobotButton from "./RobotButton";
import { FaPlus } from "react-icons/fa";
import { NewRobotIdE } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import { useEffect, useRef, useState } from "react";

type Props = {
    isNavMenuMinimized: boolean;
};

const SHOW_LOGS = true;
const TAG = "ConnectionArea";

const ConnectionArea: React.FC<Props> = ({ isNavMenuMinimized }) => {
    const [refresh, setRefresh] = useState<number>(0);
    const connectedRafts = window.applicationManager?.connectedRafts || {};
    const connectedRaftsArray = Object.values(connectedRafts);

    const connectedRaftsLength = useRef(connectedRaftsArray.length);

    useEffect(() => {
        const connectedRaftInterval = setInterval(() => {
            const allConnectedRafts = window.applicationManager?.connectedRafts || {};
            if (connectedRaftsLength.current !== Object.keys(allConnectedRafts).length) {
                connectedRaftsLength.current = Object.keys(allConnectedRafts).length;
                setRefresh(old => old + 1);
            }
        }, 2000);
        return () => {
            clearInterval(connectedRaftInterval);
        }
    }, []);
    
    const onClickConnect = async () => {
        if (!window.applicationManager) return;
        window.applicationManager.connectGeneric((newRaft) => setRefresh(refresh + 1));
    };

    const onClickDisconnect = async (raftId: string) => {
        if (!window.applicationManager) return;
        await window.applicationManager.disconnectGeneric(window.applicationManager.connectedRafts[raftId], () => setRefresh(refresh + 1));
    };

    return <div className={[styles.connectionAreaContainer].join(" ")}>
        <div className={[styles.connectionAreaContainerInner, isNavMenuMinimized ? styles.minimizedConnectionAreaInnerContainer : ""].join(" ")}>
            {/* Connection button */}
            {connectedRaftsArray.filter(raft => raft.id !== NewRobotIdE.NEW).length === 0 && <div className={styles.connectButtonContainer} onClick={onClickConnect}>
                <div className={styles.emptyRow}></div>
                <div className={styles.connectButtonIconContainer}>
                    <img src={CogSelectedIcon} alt="Cog icon" className={styles.connectButtonIcon} />
                    <img src={MartySelectedIcon} alt="Marty icon" className={styles.connectButtonIcon} />
                </div>
                <div className={[styles.connectIconContainer, isNavMenuMinimized ? styles.minimizedConnectIconContainer : ""].join(" ")}>
                    <ConnectButtonDefault />
                </div>
            </div>}
            {/* End of connection button */}
            {isNavMenuMinimized ? null :
                connectedRaftsArray.map((connectedRaft) => {
                    if (connectedRaft.id === NewRobotIdE.NEW) return null;
                    return <RobotButton
                        key={connectedRaft.id}
                        robotType={connectedRaft.type}
                        connectedRaft={window.applicationManager.connectedRafts[connectedRaft.id]}
                        onClickDisconnect={onClickDisconnect}
                    />
                })
            }
            {connectedRaftsArray.filter(raft => raft.id !== NewRobotIdE.NEW).length > 0 && <div className={styles.plusIconContainer} onClick={onClickConnect}>
                <FaPlus className={styles.plusIcon} />
            </div>}
        </div>
    </div >
}

export default ConnectionArea;