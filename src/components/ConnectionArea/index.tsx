import styles from "./styles.module.css";
import CogSelectedIcon from "../../assets/connect-button/cog_selected.svg";
import MartySelectedIcon from "../../assets/connect-button/marty_selected.svg";
import { ReactComponent as ConnectButtonDefault } from "../../assets/connect-button/connect_btn-default.svg";

import RobotButton from "./RobotButton";
import { FaPlus } from "react-icons/fa";
import { NewRobotIdE } from "@robotical/webapp-types/dist-types/src/store/SelectedRaftContext";
import { useEffect, useRef, useState } from "react";

type ConnectionStatus = "idle" | "connecting" | "error";

type Props = {
    isNavMenuMinimized: boolean;
};

const ConnectionArea: React.FC<Props> = ({ isNavMenuMinimized }) => {
    const [, setRefresh] = useState<number>(0);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
    const connectedRafts = window.applicationManager?.connectedRafts || {};
    const connectedRaftsArray = Object.values(connectedRafts);
    const visibleConnectedRafts = connectedRaftsArray.filter(raft => raft.id !== NewRobotIdE.NEW);
    const hasConnectedRafts = visibleConnectedRafts.length > 0;

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
        setConnectionStatus("connecting");

        try {
            await window.applicationManager.connectGeneric(() => {
                setRefresh((old) => old + 1);
                setConnectionStatus("idle");
            });
            setConnectionStatus("idle");
        } catch {
            setConnectionStatus("error");
        }
    };

    const onClickDisconnect = async (raftId: string) => {
        if (!window.applicationManager) return;
        await window.applicationManager.disconnectGeneric(
            window.applicationManager.connectedRafts[raftId],
            () => setRefresh((old) => old + 1)
        );
    };

    const connectionLabel =
        connectionStatus === "connecting"
            ? "Connecting…"
            : connectionStatus === "error"
                ? "Try connecting again"
                : "Connect device";

    return <div className={[styles.connectionAreaContainer].join(" ")}>
        <div className={[
            styles.connectionAreaContainerInner,
            isNavMenuMinimized ? styles.minimizedConnectionAreaInnerContainer : "",
        ].join(" ")}>
            {/* Connection button */}
            {!hasConnectedRafts && <>
                <button
                    type="button"
                    className={styles.connectButtonContainer}
                    onClick={onClickConnect}
                    disabled={!window.applicationManager || connectionStatus === "connecting"}
                    aria-busy={connectionStatus === "connecting"}
                    aria-label={connectionLabel}
                    aria-describedby="robot-connection-status"
                >
                    <span className={styles.emptyRow} aria-hidden="true" />
                    <span className={styles.connectButtonIconContainer} aria-hidden="true">
                        <img src={CogSelectedIcon} alt="" className={styles.connectButtonIcon} />
                        <img src={MartySelectedIcon} alt="" className={styles.connectButtonIcon} />
                    </span>
                    <span className={[styles.connectIconContainer, isNavMenuMinimized ? styles.minimizedConnectIconContainer : ""].join(" ")} aria-hidden="true">
                        <ConnectButtonDefault focusable="false" />
                    </span>
                </button>
                <span id="robot-connection-status" className={styles.connectionStatus} role="status">
                    {connectionStatus === "connecting"
                        ? "Connecting to a device."
                        : connectionStatus === "error"
                            ? "Connection failed. Please try again."
                            : "Ready to connect a device."}
                </span>
            </>}
            {/* End of connection button */}
            {isNavMenuMinimized ? null :
                visibleConnectedRafts.map((connectedRaft) => {
                    return <RobotButton
                        key={connectedRaft.id}
                        robotType={connectedRaft.type}
                        connectedRaft={window.applicationManager.connectedRafts[connectedRaft.id]}
                        onClickDisconnect={onClickDisconnect}
                    />
                })
            }
            {hasConnectedRafts && <button
                type="button"
                className={styles.plusIconContainer}
                onClick={onClickConnect}
                disabled={connectionStatus === "connecting"}
                aria-label={connectionStatus === "connecting" ? "Connecting another robot" : "Connect another robot"}
                title="Connect another robot"
            >
                <span className={styles.plusIconVisual} aria-hidden="true">
                    <FaPlus className={styles.plusIcon} focusable="false" />
                </span>
            </button>}
        </div>
    </div >
}

export default ConnectionArea;
