import EventDispatcher from "./EventDispatcher";

/* 
We initialise this class in app.tsx, and making it globally 
available by storing it in the window instance
*/
export class Marty2 extends EventDispatcher {
  public battRemainCapacityPercent: number;
  public rssi: number;
  public isConnected: boolean;
  public martyName: string;
  public addons: any[] = [];

  commandPromise: {
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
  } | null;

  constructor() {
    super();
    this.commandPromise = null;
    this.battRemainCapacityPercent = 0;
    this.rssi = 0;
    this.isConnected = false;
    this.commandPromise = null;
    this.martyName = "";
  }

  setAddons(addons: any) {
    this.addons = JSON.parse(addons).addons;
  }

  setMartyName(name: string) {
    if (name !== this.martyName) {
      this.martyName = name;
      this.dispatchEvent({
        type: "onMartyNameChange",
        martyName: this.martyName,
      });
    }
    this.martyName = name;
  }

  setRSSI(rssi: number) {
    if (rssi !== this.rssi) {
      this.rssi = rssi;
      this.dispatchEvent({ type: "onRSSIChange", rssi: this.rssi });
    }
  }

  setBattRemainCapacityPercent(battery: number) {
    if (battery !== this.battRemainCapacityPercent) {
      this.battRemainCapacityPercent = battery;
      this.dispatchEvent({
        type: "onBattRemainCapacityPercentChange",
        battery: this.battRemainCapacityPercent,
      });
    }
  }

  setIsConnected(isConnected: boolean) {
    if (isConnected !== this.isConnected) {
      this.isConnected = isConnected;
      console.log("dispatching");
      this.dispatchEvent({
        type: "onIsConnectedChange",
        isConnected: this.isConnected,
      });
    }
  }

  send_REST(cmd: any) {
    // TODO: Change the type of cmd
    console.log(`Marty REST command: ${cmd}`);
    try {
      //@ts-ignore
      window.ReactNativeWebView.postMessage(cmd); // this call triggers onMessage in the app
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(`Error sending to react native: ${err}`);
    }
  }

  /**
   * Sends a command to the react-native code and returns a promise that will be
   * fulfilled when the react-native code replies
   * @param {{command: string}} payload Payload to send to the react-native code
   * @returns {Promise} Promise
   */
  sendCommand(payload: any) {
    if (this.commandPromise) {
      console.warn("Command already in flight");
    }
    const promise = new Promise((resolve, reject) => {
      this.commandPromise = { resolve, reject };
    });

    //@ts-ignore
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    return promise;
  }

  /**
   * Called by the react-native code to respond to sendCommand
   * @param {{success: boolean, error: string}} args Response from the react native side
   */
  onCommandReply(args: any) {
    if (this.commandPromise) {
      if (args.success) {
        this.commandPromise.resolve(args);
      } else {
        this.commandPromise.reject(new Error(args.error));
      }
      this.commandPromise = null;
    } else {
      console.warn("Unhandled command reply");
    }
  }
}

const mv2Dashboard = new Marty2();
export default mv2Dashboard;
