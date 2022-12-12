import {
  ROSSerialAddOnStatus,
  ROSSerialIMU,
  ROSSerialSmartServos,
} from "@robotical/ricjs";
import EXCLUDED_ADDONS from "../utils/constants/excluded-addons";
import SERVO_NAMES_MAP from "../utils/constants/servo-names";
import {
  ACCELEROMETER_NAME,
  ACCELEROMETER_NAME_Y,
  ACCELEROMETER_NAME_Z,
  ACCELEROMETER_NAME_X,
  MOTOR_CURRENT_NAME,
  MOTOR_POSITION_NAME,
} from "../utils/types/addon-names";
import EventDispatcher from "./EventDispatcher";

/* 
We initialise this class in app.tsx, and making it globally 
available by storing it in the window instance
*/
export class Marty2 extends EventDispatcher {
  public battRemainCapacityPercent: number;
  public rssi: number;
  public isConnected: boolean;
  public isConnecting: boolean;
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
    this.isConnecting = false;
    this.martyName = "";
  }

  setAddons(addons: string) {
    try {
      // rename dubplicated addons
      const addonsDupl: ROSSerialAddOnStatus[] = JSON.parse(addons).addons;
      checkForDoubleAddons(addonsDupl);
      this.addons = addonsDupl;
      for (const addon of this.addons) {
        if (EXCLUDED_ADDONS.includes(addon.whoAmI)) continue;
        for (const valKey in addon.vals) {
          // @ts-ignore
          const value = addon.vals[valKey];
          // if (typeof value === "number") {
            const nameOfAddonInput = valKey.replace(addon.name, "");
            this.dispatchEvent({
              type: `on${addon.whoAmI}=>${nameOfAddonInput}Change`,
              value: value,
              whoAmI: addon.whoAmI,
              addonInput: nameOfAddonInput,
            });
          // }
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
          type: `on${MOTOR_POSITION_NAME}=>${SERVO_NAMES_MAP[servo.id]}Change`,
          value: servo.pos,
          whoAmI: MOTOR_POSITION_NAME,
          addonInput: SERVO_NAMES_MAP[servo.id],
        });
        this.dispatchEvent({
          type: `on${MOTOR_CURRENT_NAME}=>${SERVO_NAMES_MAP[servo.id]}Change`,
          value: servo.current,
          whoAmI: MOTOR_CURRENT_NAME,
          addonInput: SERVO_NAMES_MAP[servo.id],
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
        type: `on${ACCELEROMETER_NAME}=>${ACCELEROMETER_NAME_X}Change`,
        value: this.accel?.accel.x,
        whoAmI: ACCELEROMETER_NAME,
        addonInput: ACCELEROMETER_NAME_X,
      });
      this.dispatchEvent({
        type: `on${ACCELEROMETER_NAME}=>${ACCELEROMETER_NAME_Y}Change`,
        value: this.accel?.accel.y,
        whoAmI: ACCELEROMETER_NAME,
        addonInput: ACCELEROMETER_NAME_Y,
      });
      this.dispatchEvent({
        type: `on${ACCELEROMETER_NAME}=>${ACCELEROMETER_NAME_Z}Change`,
        value: this.accel?.accel.z,
        whoAmI: ACCELEROMETER_NAME,
        addonInput: ACCELEROMETER_NAME_Z,
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
  
  setIsConnecting(isConnecting: boolean) {
    if (isConnecting !== this.isConnecting) {
      this.isConnecting = isConnecting;
      this.dispatchEvent({
        type: "onIsConnectingChange",
        isConnected: this.isConnecting,
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



const checkForDoubleAddons = (addons: ROSSerialAddOnStatus[]) => {
  /**
   * Checking if there exist double addons (2 IRFoot, or 2 coloursensors etc)
   * and renames them in place to IRFoot1, IRFoot2 and so on
   */
  const addonsMap: { [key: string]: ROSSerialAddOnStatus[] } = {};
  for (const addon of addons) {
    if (EXCLUDED_ADDONS.includes(addon.whoAmI)) continue;
    if (!addonsMap.hasOwnProperty(addon.whoAmI)) {
      addonsMap[addon.whoAmI] = [];
    }
    addonsMap[addon.whoAmI].push(addon);
  }

  for (const addonWhoAmIKey in addonsMap) {
    const addonsArr = addonsMap[addonWhoAmIKey];
    if (addonsArr.length < 2) continue;
    for (let i = 0; i < addonsArr.length; i++) {
      addonsArr[i].whoAmI = addonsArr[i].whoAmI + i;
    }
  }
};
