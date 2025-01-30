import styles from "./styles.module.css";
import MartyIcon from "../../../assets/connect-button/marty_selected.svg";
import MartyDeselectedIcon from "../../../assets/connect-button/marty_deselected.svg";
import CogIcon from "../../../assets/connect-button/cog_selected.svg";
import CogDeselectedIcon from "../../../assets/connect-button/cog_deselected.svg";
import { ReactComponent as DisconnectIcon } from "../../../assets/connect-button/disconnect_button.svg";
import { ReactComponent as DisconnectHoverIcon } from "../../../assets/connect-button/disconnect_button-hover.svg";
import { useEffect, useState } from "react";
import RaftSignal from "../RaftSignal";
import RaftBattery from "../RaftBattery";
import { RaftTypeE } from '@robotical/webapp-types/dist-types/src/types/raft';
import RAFT from '@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT';
import Logger from "../../../services/logger/Logger";

type Props = {
    robotType: RaftTypeE
    connectedRaft: RAFT
    onClickDisconnect: (raftId: string) => void
};

const SHOW_LOGS = true;
const TAG = "RobotButton";

const RobotButton: React.FC<Props> = ({ robotType, connectedRaft, onClickDisconnect }) => {
    const [connectedRaftName, setConnectedRaftName] = useState<string>("");
    const [batteryStrength, setBatteryStrength] = useState(0);
    const [RSSI, setRSSI] = useState(-200);
    const [isDisconnectHovered, setIsDisconnectHovered] = useState(false);

    useEffect(() => {
        if (!connectedRaft) return;
        const batteryUpdateTimout = setInterval(() => {
            setBatteryStrength(connectedRaft.getBatteryStrength());
            setRSSI(connectedRaft.getRSSI());
        }, 1000);
        return () => clearInterval(batteryUpdateTimout);
    }, [connectedRaft]);

    useEffect(() => {
        if (connectedRaft) {
            setTimeout(() => {
                connectedRaft.getRaftName()
                    .then((name) => {
                        console.log("name", name);
                        setConnectedRaftName(name);
                    })
                    .catch((error) => {
                        Logger.error(SHOW_LOGS, TAG, "Error getting raft name " + JSON.stringify(error));
                    });
            }, 500);
        }
    }, [connectedRaft]);


    const robotIcon = robotType === RaftTypeE.MARTY ? MartyIcon : CogIcon;

    return <div className={[styles.robotButtonContainer, styles.selected].join(" ")}>
        <div className={styles.robotButtonContainerInner}>
            <div className={styles.robotButtonIconContainer}>
                <img src={robotIcon} alt="Robot icon" className={styles.robotButtonIcon} />
            </div>
            <div className={styles.batteryContainer}>
                <div className={styles.batteryIcon}>
                    <RaftBattery batteryStrength={batteryStrength} />
                </div>
            </div>
            <div className={styles.signalContainer}>
                <RaftSignal connectedRaft={connectedRaft} signalStrength={RSSI} />
            </div>
            <div className={styles.robotButtonNameContainer}>
                <div className={styles.robotButtonName}>{truncateRobotName(connectedRaftName)}</div>
            </div>
            <div className={styles.trashContainer}
                onClick={() => onClickDisconnect(connectedRaft.id)}
                onMouseEnter={() => setIsDisconnectHovered(true)}
                onMouseLeave={() => setIsDisconnectHovered(false)}>
                {isDisconnectHovered ? <DisconnectHoverIcon /> : <DisconnectIcon />}
            </div>
        </div>
    </div>
}

export default RobotButton;


function truncateRobotName(name: string) {
    if (name.length > 13) {
        return name.substring(0, 11) + "...";
    }
    return name;
}