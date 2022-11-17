import { ReactComponent as ConnectButtonSVG } from "../../../assets/connect-button/connect-button.svg";
import { ReactComponent as ConnectSilhouetSVG } from "../../../assets/connect-button/connect-silhouet.svg";

import styles from "./styles.module.css";

type ButtonConnProps = {
  onClick: () => void;
};

export default function ButtonConn({ onClick }: ButtonConnProps) {
  return (
    <div className={styles.buttonConnContainer} onClick={onClick}>
      <div className={styles.connectButtonSvgContainer}>
        <ConnectButtonSVG />
      </div>
      <div className={styles.connectSilhouetSvgContainer}>
        <ConnectSilhouetSVG />
      </div>
    </div>
  );
}
