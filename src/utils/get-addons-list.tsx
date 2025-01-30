import Addon from "../models/addons/Addon";
import AddonSub from "../models/addons/AddonSub";
import {
  ACCELEROMETER_NAME,
  ACCELEROMETER_NAME_X,
  ACCELEROMETER_NAME_Y,
  ACCELEROMETER_NAME_Z,
  COG_BUTTON_CLICK_NAME,
  COG_IR_BUTTON,
  COG_IR_LEFT,
  COG_IR_RIGHT,
  COG_LIGHT_AMB,
  COG_LIGHT_NAME,
  COG_LIGHT_SENSE_NAME,
  COG_MOVEMENT_TYPE_NAME,
  COG_OBJECT_SENSE_NAME,
  COG_STATE_NAME,
  COG_TILT_NAME,
  MOTOR_CURRENT_NAME,
  MOTOR_POSITION_NAME,
} from "./types/addon-names";
import EXCLUDED_ADDONS from "./constants/excluded-addons";
import SERVO_NAMES_MAP from "./constants/servo-names";
import renameValueLabel from "./rename-value-label";
import whoAmINameMap from "./constants/whoAmI-names";
import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import { RaftTypeE } from "@robotical/webapp-types/dist-types/src/types/raft";
import Cog from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/Cog";
import Marty from "@robotical/webapp-types/dist-types/src/application/RAFTs/Marty/Marty";
import { type SimplifiedCogStateInfo, type RICStateInfo } from "@robotical/roboticaljs";
import PublishedDataAnalyser from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/PublishedDataAnalyser";

/* Marty */

function getAddonsListMarty(addons: RICStateInfo['addOnInfo']['addons']) {
  const addonsNormalised = [];
  for (const addon of addons) {
    const whoAmI = whoAmINameMap(addon.whoAmI);
    if (EXCLUDED_ADDONS.includes(whoAmI)) continue;
    const subAddons = [];
    for (const valKey in addon.vals) {
      // @ts-ignore
      const value = addon.vals[valKey];
      // if (typeof value === "number") {
      const addonInputName = renameValueLabel(valKey, addon.name);
      subAddons.push(new AddonSub(addonInputName, value));
      // }
    }
    addonsNormalised.push(new Addon(whoAmI, subAddons));
  }
  return addonsNormalised;
}

function getServosListMarty(servos: RICStateInfo['smartServos']) {
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

function getAccelListMarty(accel: RICStateInfo['imuData']['accel']) {
  const addonSubs = [
    new AddonSub(ACCELEROMETER_NAME_X, accel.x),
    new AddonSub(ACCELEROMETER_NAME_Y, accel.y),
    new AddonSub(ACCELEROMETER_NAME_Z, accel.z),
  ];
  return [new Addon(ACCELEROMETER_NAME, addonSubs)];
}

function getAllAddonsListMarty(marty: Marty) {
  const stateInfo = marty.raftStateInfo as RICStateInfo;
  const addons = stateInfo.addOnInfo.addons;
  const servos = stateInfo.smartServos;
  const accel = stateInfo.imuData.accel;
  let addons_: Addon[] = [];
  let servos_: Addon[] = [];
  let accel_: Addon[] = [];
  // let magneto_: Addon[] = [];
  try {
    addons_ = getAddonsListMarty(addons);
  } catch (e) {
    console.log(e);
  }

  try {
    servos_ = getServosListMarty(servos);
  } catch (e) {
    console.log(e);
  }

  try {
    accel_ = getAccelListMarty(accel);
  } catch (e) {
    console.log(e);
  }

  // try {
  //   magneto_ = getMagnetoList(magneto);
  // } catch (e) {
  //   console.log(e);
  // }

  return addons_.concat(servos_).concat(accel_);
}

/* Cog */
function getAllAddonsListCog(cog: Cog) {
  if (!cog.raftStateInfo) {
    return [];
  }
  const light = cog.raftStateInfo.light;
  const accel = cog.raftStateInfo.accelerometer;

  let light_: Addon[] = [];
  let accel_: Addon[] = [];

  try {
    light_ = getLightListCog(light);
  } catch (e) {
    console.log(e);
  }

  try {
    accel_ = getAccelListCog(accel);
  } catch (e) {
    console.log(e);
  }

  try {
    const cogState = cog.publishedDataAnalyser.cogState;
    const cogStateList = getCogStateList(cogState);
    return light_.concat(accel_).concat(cogStateList);
  } catch (e) {
    console.log(e);
  }

  return light_.concat(accel_);
}

function getCogStateList(cogState: PublishedDataAnalyser['cogState']) {
  const addonSubs = [
    new AddonSub(COG_TILT_NAME, cogState.tilt),
    new AddonSub(COG_MOVEMENT_TYPE_NAME, cogState.movementType),
    new AddonSub(COG_BUTTON_CLICK_NAME, cogState.buttonClick),
    new AddonSub(COG_OBJECT_SENSE_NAME, cogState.objectSense),
    new AddonSub(COG_LIGHT_SENSE_NAME, cogState.lightSense),
  ];
  return [new Addon(COG_STATE_NAME, addonSubs)];
}

function getAccelListCog(accel: SimplifiedCogStateInfo['accelerometer']) {
  const addonSubs = [
    new AddonSub(ACCELEROMETER_NAME_X, accel.ax),
    new AddonSub(ACCELEROMETER_NAME_Y, accel.ay),
    new AddonSub(ACCELEROMETER_NAME_Z, accel.az),
  ];
  return [new Addon(ACCELEROMETER_NAME, addonSubs)];
}

function getLightListCog(light: SimplifiedCogStateInfo['light']) {
  const addonSubs = [
    new AddonSub(COG_LIGHT_AMB, light.amb0),
    new AddonSub(COG_IR_LEFT, light.ir0),
    new AddonSub(COG_IR_RIGHT, light.ir1),
    new AddonSub(COG_IR_BUTTON, light.ir2),
  ];
  return [new Addon(COG_LIGHT_NAME, addonSubs)];
}

export default function getAllAddonsList(raft: RAFT) {
  if (raft.type === RaftTypeE.COG) {
    return getAllAddonsListCog(raft as Cog);
  } else {
    return getAllAddonsListMarty(raft as Marty);
  }
}