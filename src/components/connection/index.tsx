import { useEffect, useState } from "react";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import ButtonConn from "./ButtonConn";
import ButtonDisconn from "./ButtonDisconn";

import styles from "./styles.module.css";

const ConnectButton = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    mv2Dashboard.addEventListener(
      "onIsConnectedChange",
      onMartyConnectedChanged
    );
    return () => {
      mv2Dashboard.addEventListener(
        "onIsConnectedChange",
        onMartyConnectedChanged
      );
    };
  }, []);

  const onMartyConnectedChanged = () => {
    setIsConnected(mv2Dashboard.isConnected);
  };

  const onClickConnect = async () => {
    console.log("connecting")
    const connectMsg = { type: "connect" };
    mv2Dashboard.send_REST(JSON.stringify(connectMsg));
  };

  const onClickDisconnect = () => {
    mv2Dashboard.send_REST("disconnect");
  };

  return (
    <div className={styles.connectButtonContainer}>
      {isConnected ? (
        <ButtonDisconn onClick={onClickDisconnect} />
      ) : (
        <ButtonConn onClick={onClickConnect} />
      )}
    </div>
  );
};

export default ConnectButton;
