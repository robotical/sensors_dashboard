import {
  ROSSerialAddOnStatus,
  ROSSerialIMU,
  ROSSerialSmartServos,
} from "@robotical/ricjs";
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
  public addons: ROSSerialAddOnStatus[] = [];
  public servos: ROSSerialSmartServos | null = null;
  public accel: ROSSerialIMU | null = null;

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
    this.martyName = "";
  }

  setAddons(addons: string) {
    try {
      this.addons = JSON.parse(addons).addons;
      for (const addon of this.addons) {
        for (const valKey in addon.vals) {
          // @ts-ignore
          const value = addon.vals[valKey];
          if (typeof value === "number") {
            this.dispatchEvent({
              type: `on${valKey}Change`,
              value: value,
            });
          }
        }
      }
    } catch (e) {
      this.addons = [];
    }
  }

  setServos(servos: string) {
    try {
      this.servos = JSON.parse(servos);
      for (const servo of this.servos!.smartServos) {
        this.dispatchEvent({
          type: `on${servo.id}posChange`,
          value: servo.pos,
        });
        this.dispatchEvent({
          type: `on${servo.id}currChange`,
          value: servo.current,
        });
      }
    } catch (e) {
      this.servos = null;
    }
  }

  setAccel(accel: string) {
    try {
      this.accel = JSON.parse(accel);
      this.dispatchEvent({
        type: "onAccelxChange",
        value: this.accel?.accel.x,
      });
      this.dispatchEvent({
        type: "onAccelyChange",
        value: this.accel?.accel.y,
      });
      this.dispatchEvent({
        type: "onAccelzChange",
        value: this.accel?.accel.z,
      });
    } catch (e) {
      this.accel = null;
    }
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
      this.dispatchEvent({
        type: "onRSSIChange",
        rssi: this.rssi,
      });
    }
  }

  setBattRemainCapacityPercent(battery: number) {
    battery = Math.round(battery);
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
