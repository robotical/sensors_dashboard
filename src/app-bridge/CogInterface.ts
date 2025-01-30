import EXCLUDED_ADDONS from "../utils/constants/excluded-addons";
import {
  ACCELEROMETER_NAME,
  ACCELEROMETER_NAME_Y,
  ACCELEROMETER_NAME_Z,
  ACCELEROMETER_NAME_X,
  COG_LIGHT_NAME,
  COG_LIGHT_AMB,
  COG_IR_BUTTON,
  COG_IR_LEFT,
  COG_IR_RIGHT,
  COG_STATE_NAME,
  COG_TILT_NAME,
  COG_MOVEMENT_TYPE_NAME,
  COG_BUTTON_CLICK_NAME,
  COG_OBJECT_SENSE_NAME,
  COG_LIGHT_SENSE_NAME,
} from "../utils/types/addon-names";
import EventDispatcher from "./EventDispatcher";

import {
  type SimplifiedCogStateInfo,
} from "@robotical/roboticaljs";
import { raftPubSubscriptionHelper } from "./pubSubHelper";
import RaftInterface from "./RaftInterface";
import Cog from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/Cog";
import PublishedDataAnalyser from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/PublishedDataAnalyser";
/* 
We initialise this class in app.tsx, and making it globally 
available by storing it in the window instance
*/
export class CogInterface extends RaftInterface {
  public cog: Cog;
  public lightData: SimplifiedCogStateInfo['light'] | null = null;
  public accel: SimplifiedCogStateInfo['accelerometer'] | null = null;
  public cogState: PublishedDataAnalyser['cogState'] | null = null;

  public subObject: ReturnType<typeof raftPubSubscriptionHelper> | null = null;

  private _publishedDataDebouncePeriod = 0; // ms
  private lastPublishedDataTime: number | null = null;

  constructor(cog: Cog) {
    super();
    this.cog = cog;
    this.subscribeToPublishedData();
  }

  setPublishedDataDebouncePeriod(period: number) {
    this._publishedDataDebouncePeriod = period;
  }

  subscribeToPublishedData() {
    this.subObject = raftPubSubscriptionHelper(this.cog);
    this.subObject.subscribe(({ stateInfo }: {stateInfo: SimplifiedCogStateInfo}) => {
      // debounce
      const now = Date.now();
      if (this.lastPublishedDataTime && now - this.lastPublishedDataTime < this._publishedDataDebouncePeriod) {
        return;
      }
      this.lastPublishedDataTime = now;
      this.setAccel(stateInfo.accelerometer);
      this.setLight(stateInfo.light);
      this.setCogPublishedState(this.cog.publishedDataAnalyser.cogState);
    });
  }

  unsubscribeFromPublishedData() {
    this.subObject?.unsubscribe();
  }

  setAccel(accel: SimplifiedCogStateInfo['accelerometer']) {
    try {
      this.accel = accel;
      this.dispatchEvent({
        type: `on${ACCELEROMETER_NAME}=>${ACCELEROMETER_NAME_X}Change`,
        value: this.accel?.ax,
        whoAmI: ACCELEROMETER_NAME,
        addonInput: ACCELEROMETER_NAME_X,
      });
      this.dispatchEvent({
        type: `on${ACCELEROMETER_NAME}=>${ACCELEROMETER_NAME_Y}Change`,
        value: this.accel?.ay,
        whoAmI: ACCELEROMETER_NAME,
        addonInput: ACCELEROMETER_NAME_Y,
      });
      this.dispatchEvent({
        type: `on${ACCELEROMETER_NAME}=>${ACCELEROMETER_NAME_Z}Change`,
        value: this.accel?.az,
        whoAmI: ACCELEROMETER_NAME,
        addonInput: ACCELEROMETER_NAME_Z,
      });
    } catch (e) {
      this.accel = null;
    }
  }

  setLight(lightData: SimplifiedCogStateInfo['light']) {
    try {
      this.lightData = lightData;
      this.dispatchEvent({
        type: `on${COG_LIGHT_NAME}=>${COG_LIGHT_AMB}Change`,
        value: this.lightData?.amb0,
        whoAmI: COG_LIGHT_NAME,
        addonInput: COG_LIGHT_AMB
      });
      this.dispatchEvent({
        type: `on${COG_LIGHT_NAME}=>${COG_IR_BUTTON}Change`,
        value: this.lightData?.ir2,
        whoAmI: COG_LIGHT_NAME,
        addonInput: COG_IR_BUTTON
      });
      this.dispatchEvent({
        type: `on${COG_LIGHT_NAME}=>${COG_IR_LEFT}Change`,
        value: this.lightData?.ir0,
        whoAmI: COG_LIGHT_NAME,
        addonInput: COG_IR_LEFT
      });
      this.dispatchEvent({
        type: `on${COG_LIGHT_NAME}=>${COG_IR_RIGHT}Change`,
        value: this.lightData?.ir1,
        whoAmI: COG_LIGHT_NAME,
        addonInput: COG_IR_RIGHT
      });
    } catch (e) {
      this.lightData = null;
    }
  }

  setCogPublishedState(cogState: PublishedDataAnalyser['cogState']) {
      this.cogState = cogState;
      this.dispatchEvent({
        type: `on${COG_STATE_NAME}=>${COG_TILT_NAME}Change`,
        value: this.cogState.tilt,
        whoAmI: COG_TILT_NAME,
        addonInput: COG_TILT_NAME
      });
      this.dispatchEvent({
        type: `on${COG_STATE_NAME}=>${COG_MOVEMENT_TYPE_NAME}Change`,
        value: this.cogState.movementType,
        whoAmI: COG_MOVEMENT_TYPE_NAME,
        addonInput: COG_MOVEMENT_TYPE_NAME
      });
      this.dispatchEvent({
        type: `on${COG_STATE_NAME}=>${COG_BUTTON_CLICK_NAME}Change`,
        value: this.cogState.buttonClick === "none" ? "release" : this.cogState.buttonClick,
        whoAmI: COG_BUTTON_CLICK_NAME,
        addonInput: COG_BUTTON_CLICK_NAME
      });
      this.dispatchEvent({
        type: `on${COG_STATE_NAME}=>${COG_OBJECT_SENSE_NAME}Change`,
        value: this.cogState.objectSense,
        whoAmI: COG_OBJECT_SENSE_NAME,
        addonInput: COG_OBJECT_SENSE_NAME
      });
      this.dispatchEvent({
        type: `on${COG_STATE_NAME}=>${COG_LIGHT_SENSE_NAME}Change`,
        value: this.cogState.lightSense,
        whoAmI: COG_LIGHT_SENSE_NAME,
        addonInput: COG_LIGHT_SENSE_NAME
      });
  }

}

export default CogInterface;
