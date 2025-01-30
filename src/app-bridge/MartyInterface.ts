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
import renameValueLabel from "../utils/rename-value-label";
import whoAmINameMap from "../utils/constants/whoAmI-names";
import type MartyType from "@robotical/webapp-types/dist-types/src/application/RAFTs/Marty/Marty";

import {
  type RICStateInfo,
  type ROSSerialIMU,
  type ROSSerialAddOnStatusList,
  type ROSSerialSmartServos,
} from "@robotical/roboticaljs";
import { raftPubSubscriptionHelper } from "./pubSubHelper";
import RaftInterface from "./RaftInterface";
/* 
We initialise this class in app.tsx, and making it globally 
available by storing it in the window instance
*/
export class MartyInterface extends RaftInterface {
  public marty: MartyType;
  public addons: ROSSerialAddOnStatusList['addons'] = [];
  public servos: ROSSerialSmartServos | null = null;
  public accel: ROSSerialIMU | null = null;

  public subObject: ReturnType<typeof raftPubSubscriptionHelper> | null = null;

  constructor(marty: MartyType) {
    super();
    this.marty = marty;
    this.subscribeToPublishedData();
  }

  subscribeToPublishedData() {
    this.subObject = raftPubSubscriptionHelper(this.marty);
    this.subObject.subscribe(({ stateInfo }: {stateInfo: RICStateInfo}) => {
      this.setAddons(stateInfo.addOnInfo.addons);
      this.setServos(stateInfo.smartServos);
      this.setAccel(stateInfo.imuData);
    });
  }

  unsubscribeFromPublishedData() {
    this.subObject?.unsubscribe();
  }

  setAddons(addons: ROSSerialAddOnStatusList['addons']) {
    try {
      // rename dubplicated addons
      const addonsDupl: ROSSerialAddOnStatusList['addons'] = addons;

      checkForDoubleAddons(addonsDupl);
      // if the number of the old addons is different from the new one, we dispatch
      // an event to update the addons list in the GUI
      if (this.addons.length !== addonsDupl.length) {
        this.dispatchEvent({
          type: "onAddonsChange",
          addons: addonsDupl,
        });
      }
      this.addons = addonsDupl;
      for (const addon of this.addons) {
        const whoAmI = whoAmINameMap(addon.whoAmI);
        if (EXCLUDED_ADDONS.includes(whoAmI)) continue;
        for (const valKey in addon.vals) {
          const value = addon.vals[valKey];
          // if (typeof value === "number") {
          const nameOfAddonInput = renameValueLabel(valKey, addon.name);
          this.dispatchEvent({
            type: `on${whoAmI}=>${nameOfAddonInput}Change`,
            value: value,
            whoAmI: whoAmI,
            addonInput: nameOfAddonInput,
          });
          // }
        }
      }
    } catch (e) {
      this.addons = [];
    }
  }

  setServos(servos: ROSSerialSmartServos) {
    try {
      this.servos = servos;
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

  setAccel(accel: ROSSerialIMU) {
    try {
      this.accel = accel;
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

}

export default MartyInterface;

const checkForDoubleAddons = (addons: ROSSerialAddOnStatusList['addons']) => {
  /**
   * Checking if there exist double addons (2 IRFoot, or 2 coloursensors etc)
   * and renames them in place to IRFoot1, IRFoot2 and so on
   */
  const addonsMap: { [key: string]: ROSSerialAddOnStatusList['addons'] } = {};
  for (const addon of addons) {
    const whoAmIMapped = whoAmINameMap(addon.whoAmI);
    if (EXCLUDED_ADDONS.includes(whoAmIMapped)) continue;
    if (!addonsMap.hasOwnProperty(whoAmIMapped)) {
      addonsMap[whoAmIMapped] = [];
    }
    addonsMap[whoAmIMapped].push(addon);
  }

  for (const addonWhoAmIKey in addonsMap) {
    const addonsArr = addonsMap[addonWhoAmIKey];
    if (addonsArr.length < 2) continue;
    for (let i = 0; i < addonsArr.length; i++) {
      addonsArr[i].whoAmI = addonsArr[i].whoAmI + i;
    }
  }
};
