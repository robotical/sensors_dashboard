import {
  ACCELEROMETER_X_BIGGERN_THAN,
  ACCELEROMETER_Y_BIGGERN_THAN,
  ACCELEROMETER_Z_BIGGERN_THAN,
  IRFOOT_VAL_BIGGER_THAN,
} from "../types/start-end-rules";

export interface StartOptionsInterface {
  [whoAmI: string]: { [addonInput: string]: string[] };
  IRFoot: { Val: string[]; [addonInput: string]: string[] };
  accelerometer: {
    x: string[];
    y: string[];
    z: string[];
    [addonInput: string]: string[];
  };
}

export const START_OPTIONS_BY_WHOAMI_AND_NAME: StartOptionsInterface = {
  IRFoot: {
    Val: [IRFOOT_VAL_BIGGER_THAN],
  },
  accelerometer: {
    x: [ACCELEROMETER_X_BIGGERN_THAN],
    y: [ACCELEROMETER_Y_BIGGERN_THAN],
    z: [ACCELEROMETER_Z_BIGGERN_THAN],
  },
};
