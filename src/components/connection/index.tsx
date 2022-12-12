import { useEffect, useState } from "react";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import ButtonConn from "./ButtonConn";
import ButtonDisconn from "./ButtonDisconn";

import styles from "./styles.module.css";

const ConnectButton = () => {
  const [isConnected, setIsConnected] = useState(mv2Dashboard.isConnected);
  const [isConnecting, setIsConnecting] = useState(mv2Dashboard.isConnecting);

  useEffect(() => {
    mv2Dashboard.addEventListener(
      "onIsConnectedChange",
      "",
      onMartyConnectedChanged
    );
    mv2Dashboard.addEventListener(
      "onIsConnectingChange",
      "",
      onMartyConnectingChanged
    );
    return () => {
      mv2Dashboard.removeEventListener(
        "onIsConnectedChange",
        "",
        onMartyConnectedChanged
      );
      mv2Dashboard.removeEventListener(
        "onIsConnectingChange",
        "",
        onMartyConnectingChanged
      );
    };
  }, []);

  const onMartyConnectedChanged = () => {
    console.log("got connected event");
    setIsConnected(mv2Dashboard.isConnected);
  };

  const onMartyConnectingChanged = () => {
    console.log("got connecting event");
    setIsConnecting(mv2Dashboard.isConnecting);
  };


  const onClickConnect = async () => {
    console.log("connecting")
    const connectMsg = { type: "connect" };
    mv2Dashboard.send_REST(JSON.stringify(connectMsg));
  };

  const onClickDisconnect = () => {
    const disconnectMsg = { type: "disconnect" };
    mv2Dashboard.send_REST(JSON.stringify(disconnectMsg));
  };

  return (
    <div className={styles.connectButtonContainer}>
      {isConnected && !isConnecting ? (
        <ButtonDisconn onClick={onClickDisconnect} />
      ) : (
        <ButtonConn onClick={onClickConnect} isConnecting={isConnecting} />
      )}
    </div>
  );
};

export default ConnectButton;
