import Addon from "../models/addons/Addon";
import {
  ROSSerialAddOnStatus,
  ROSSerialIMU,
  ROSSerialSmartServos,
} from "@robotical/ricjs";
import AddonSub from "../models/addons/AddonSub";

function getAddonsList(addons: ROSSerialAddOnStatus[]) {
  const addonsNormalised = [];
  for (const addon of addons) {
    const id = addon.name + addon.whoAmI;
    const subAddons = [];
    for (const valKey in addon.vals) {
      // @ts-ignore
      const value = addon.vals[valKey];
      if (typeof value === "number") {
        subAddons.push(new AddonSub(valKey, value));
      }
    }
    addonsNormalised.push(new Addon(addon.name, id, subAddons));
  }
  return addonsNormalised;
}

function getServosList(servos: ROSSerialSmartServos) {
  const smartServos = servos.smartServos;
  const posAddonSub: AddonSub[] = [];
  const currAddonSub: AddonSub[] = [];
  const addonsNormalised = [];
  for (const servo of smartServos) {
    posAddonSub.push(new AddonSub(servo.id.toString()+"pos", servo.pos));
    currAddonSub.push(new AddonSub(servo.id.toString()+"curr", servo.current));
  }
  addonsNormalised.push(new Addon("Motor Position", "motor-pos", posAddonSub));
  addonsNormalised.push(
    new Addon("Motor Current", "motor-current", currAddonSub)
  );

  return addonsNormalised;
}

function getAccelList(accel: ROSSerialIMU) {
  const addonSubs = [
    new AddonSub("x", accel.accel.x),
    new AddonSub("y", accel.accel.y),
    new AddonSub("z", accel.accel.z),
  ];
  return [new Addon("Accelerometer", "accelerometer", addonSubs)];
}

export default function getAllAddonsList(
  addons: ROSSerialAddOnStatus[],
  servos: ROSSerialSmartServos,
  accel: ROSSerialIMU
) {
    return getAddonsList(addons).concat(getServosList(servos)).concat(getAccelList(accel));
}
