import { ReactComponent as ConnectButtonSVG } from "../../../assets/connect-button/connect-button.svg";
import { ReactComponent as ConnectSilhouetSVG } from "../../../assets/connect-button/connect-silhouet.svg";
import LoadingSpinner from "../../LoadingSpinner";

import styles from "./styles.module.css";

type ButtonConnProps = {
  onClick: () => void;
  isConnecting: boolean;
};

export default function ButtonConn({ onClick, isConnecting }: ButtonConnProps) {
  
  return (
    <div className={styles.buttonConnContainer} onClick={onClick}>
      <div className={styles.connectButtonSvgContainer}>
        <ConnectButtonSVG />
      </div>
      <div className={styles.connectSilhouetSvgContainer}>
        {isConnecting ? <LoadingSpinner /> : <ConnectSilhouetSVG />}
      </div>
    </div>
  );
}
