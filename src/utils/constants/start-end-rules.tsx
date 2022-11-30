import {
  ACCELEROMETER_X_BIGGERN_THAN_20,
  ACCELEROMETER_Y_BIGGERN_THAN_20,
  ACCELEROMETER_Z_BIGGERN_THAN_20,
  COLOR_SENSOR_BLUE_BIGGER_THAN_100,
  COLOR_SENSOR_GREEN_BIGGER_THAN_100,
  COLOR_SENSOR_RED_BIGGER_THAN_100,
  IRFOOT_VAL_BIGGER_THAN_20,
  LIGHT_SENSOR_R1_BIGGERN_THAN_20,
  LIGHT_SENSOR_R2_BIGGERN_THAN_20,
  LIGHT_SENSOR_R3_BIGGERN_THAN_20,
} from "../types/start-end-rules";

export interface OptionsInterface {
  [whoAmI: string]: { [addonInput: string]: AddonInputRuleObj[] };
}

interface AddonInputRuleObj {
  ruleStr: string;
  ruleFunc: (val: number) => boolean;
}

export const START_OPTIONS_BY_WHOAMI_AND_NAME: OptionsInterface = {
  IRFoot: {
    Val: [{ruleStr: IRFOOT_VAL_BIGGER_THAN_20, ruleFunc: (val: number) => val > 20}],
  },
  Accelerometer: {
    x: [{ruleStr: ACCELEROMETER_X_BIGGERN_THAN_20, ruleFunc: (val: number) => val > 20}],
    y: [{ruleStr: ACCELEROMETER_Y_BIGGERN_THAN_20, ruleFunc: (val: number) => val > 20}],
    z: [{ruleStr: ACCELEROMETER_Z_BIGGERN_THAN_20, ruleFunc: (val: number) => val > 20}],
  },
  coloursensor: {
    Red: [{ruleStr: COLOR_SENSOR_RED_BIGGER_THAN_100, ruleFunc: (val: number) => val > 100}],
    Green: [{ruleStr: COLOR_SENSOR_GREEN_BIGGER_THAN_100, ruleFunc: (val: number) => val > 100}],
    Blue: [{ruleStr: COLOR_SENSOR_BLUE_BIGGER_THAN_100, ruleFunc: (val: number) => val > 100}],
  },
  lightsensor: {
    Reading1: [{ruleStr: LIGHT_SENSOR_R1_BIGGERN_THAN_20, ruleFunc: (val: number) => val > 20}],
    Reading2: [{ruleStr: LIGHT_SENSOR_R2_BIGGERN_THAN_20, ruleFunc: (val: number) => val > 20}],
    Reading3: [{ruleStr: LIGHT_SENSOR_R3_BIGGERN_THAN_20, ruleFunc: (val: number) => val > 20}],
  }
};

export const END_OPTIONS_BY_WHOAMI_AND_NAME: OptionsInterface = {
};
