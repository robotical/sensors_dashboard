import MartyBattery from "../MartyBattery";
import MartySignal from "../MartySignal";
import { ReactComponent as DisconnectBtnSVG } from "../../../assets/connect-button/disconnect-button.svg";
import { ReactComponent as MartyGraphicSVG } from "../../../assets/connect-button/marty-graphic.svg";

import styles from "./styles.module.css";

import { useEffect, useState } from "react";
import mv2Dashboard from "../../../app-bridge/mv2-rn";

type ButtonDisconnProps = {
  onClick: () => void;
};

export default function ButtonDisconn({ onClick }: ButtonDisconnProps) {
  const [batteryStrength, setBatteryStrength] = useState(0);
  const [RSSI, setRSSI] = useState(-200);

  useEffect(() => {
    const batteryUpdateTimout = setInterval(() => {
      setBatteryStrength(mv2Dashboard.battRemainCapacityPercent);
      setRSSI(mv2Dashboard.rssi);
    }, 200);
    return () => clearInterval(batteryUpdateTimout);
  }, []);

  return (
    <div className={styles.buttonDisconnectContainer}>
      <p className={styles.buttonDisconnectTitle}>{mv2Dashboard.martyName}</p>
      <div className={styles.buttonDisconnectBatteryContainer}>
        <MartyBattery batteryStrength={batteryStrength} />
      </div>
      <div className={styles.webAppButtonDisconnectSignalContainer}>
        <MartySignal signalStrength={RSSI} />
      </div>
      <div
        className={styles.buttonDisconnectDisconnectBtnContainer}
        onClick={onClick}
      >
        <DisconnectBtnSVG />
      </div>
      <div className={styles.buttonDisconnectMartyContainer}>
        <MartyGraphicSVG />
      </div>
    </div>
  );
}
