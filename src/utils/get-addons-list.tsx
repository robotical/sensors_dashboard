import Addon from "../models/addons/Addon";
import {
  ROSSerialAddOnStatus,
  ROSSerialIMU,
  ROSSerialSmartServos,
} from "@robotical/ricjs";
import AddonSub from "../models/addons/AddonSub";
import {
  ACCELEROMETER_NAME,
  ACCELEROMETER_NAME_X,
  ACCELEROMETER_NAME_Y,
  ACCELEROMETER_NAME_Z,
  MOTOR_CURRENT_NAME,
  MOTOR_POSITION_NAME,
} from "./types/addon-names";
import EXCLUDED_ADDONS from "./constants/excluded-addons";
import SERVO_NAMES_MAP from "./constants/servo-names";
import renameValueLabel from "./rename-value-label";

function getAddonsList(addons: ROSSerialAddOnStatus[]) {
  const addonsNormalised = [];
  for (const addon of addons) {
    if (EXCLUDED_ADDONS.includes(addon.whoAmI)) continue;
    const subAddons = [];
    for (const valKey in addon.vals) {
      // @ts-ignore
      const value = addon.vals[valKey];
      // if (typeof value === "number") {
        const addonInputName = renameValueLabel(valKey, addon.name);
        subAddons.push(new AddonSub(addonInputName, value));
      // }
    }
    addonsNormalised.push(new Addon(addon.whoAmI, subAddons));
  }
  return addonsNormalised;
}

function getServosList(servos: ROSSerialSmartServos) {
  const smartServos = servos.smartServos;
  const posAddonSub: AddonSub[] = [];
  const currAddonSub: AddonSub[] = [];
  const addonsNormalised = [];
  for (const servo of smartServos) {
    posAddonSub.push(new AddonSub(SERVO_NAMES_MAP[servo.id], servo.pos));
    currAddonSub.push(new AddonSub(SERVO_NAMES_MAP[servo.id], servo.current));
  }
  addonsNormalised.push(new Addon(MOTOR_POSITION_NAME, posAddonSub));
  addonsNormalised.push(new Addon(MOTOR_CURRENT_NAME, currAddonSub));

  return addonsNormalised;
}

function getAccelList(accel: ROSSerialIMU) {
  const addonSubs = [
    new AddonSub(ACCELEROMETER_NAME_X, accel.accel.x),
    new AddonSub(ACCELEROMETER_NAME_Y, accel.accel.y),
    new AddonSub(ACCELEROMETER_NAME_Z, accel.accel.z),
  ];
  return [new Addon(ACCELEROMETER_NAME, addonSubs)];
}

export default function getAllAddonsList(
  addons: ROSSerialAddOnStatus[],
  servos: ROSSerialSmartServos,
  accel: ROSSerialIMU
) {
  let addons_: Addon[] = [];
  let servos_: Addon[] = [];
  let accel_: Addon[] = [];
  try {
    addons_ = getAddonsList(addons);
  } catch (e) {
    console.log(e);
  }

  try {
    servos_ = getServosList(servos);
  } catch (e) {
    console.log(e);
  }

  try {
    accel_ = getAccelList(accel);
  } catch (e) {
    console.log(e);
  }

  return addons_.concat(servos_).concat(accel_);
}