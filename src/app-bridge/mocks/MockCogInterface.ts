import CogInterface from "../CogInterface";
import Addon from "../../models/addons/Addon";
import AddonSub from "../../models/addons/AddonSub";
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
} from "../../utils/types/addon-names";
import type Cog from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/Cog";
import type PublishedDataAnalyser from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/PublishedDataAnalyser";
import { type SimplifiedCogStateInfo } from "@robotical/roboticaljs";

type CogState = PublishedDataAnalyser["cogState"];

const UPDATE_INTERVAL_MS = 750;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mutateNumber = (value: number, min: number, max: number, maxDelta: number) => {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  const next = value + delta;
  return Number(clamp(next, min, max).toFixed(2));
};

const pickWithChance = <T,>(current: T, options: readonly T[], changeChance: number): T => {
  if (Math.random() > changeChance) return current;
  return options[Math.floor(Math.random() * options.length)];
};

const createInitialLight = (): SimplifiedCogStateInfo["light"] => ({
  amb0: 120,
  ir0: 140,
  ir1: 135,
  ir2: 20,
});

const createInitialAccel = (): SimplifiedCogStateInfo["accelerometer"] => ({
  ax: 0.05,
  ay: -0.08,
  az: 0.97,
});

const createInitialGyro = (): SimplifiedCogStateInfo["gyroscope"] => ({
  gx: -0.5,
  gy: 0.4,
  gz: 0.1,
});

const createInitialPower = (): SimplifiedCogStateInfo["power"] => ({
  battV: 7.4,
  usb: "disconnected",
});

const createInitialCogState = (): CogState => ({
  tilt: "none",
  movementType: "none",
  rotation: "none",
  buttonClick: "none",
  objectSense: "none",
  lightSense: "mid",
});

const buildCogAddonList = (
  light: SimplifiedCogStateInfo["light"],
  accel: SimplifiedCogStateInfo["accelerometer"],
  cogState: CogState
) => {
  const lightAddon = new Addon(COG_LIGHT_NAME, [
    new AddonSub(COG_LIGHT_AMB, light.amb0),
    new AddonSub(COG_IR_LEFT, light.ir0),
    new AddonSub(COG_IR_RIGHT, light.ir1),
    new AddonSub(COG_IR_BUTTON, light.ir2),
  ]);

  const accelAddon = new Addon(ACCELEROMETER_NAME, [
    new AddonSub(ACCELEROMETER_NAME_X, accel.ax),
    new AddonSub(ACCELEROMETER_NAME_Y, accel.ay),
    new AddonSub(ACCELEROMETER_NAME_Z, accel.az),
  ]);

  const stateAddon = new Addon(COG_STATE_NAME, [
    new AddonSub(COG_TILT_NAME, cogState.tilt),
    new AddonSub(COG_MOVEMENT_TYPE_NAME, cogState.movementType),
    new AddonSub(
      COG_BUTTON_CLICK_NAME,
      cogState.buttonClick === "none" ? "release" : cogState.buttonClick
    ),
    new AddonSub(COG_OBJECT_SENSE_NAME, cogState.objectSense),
    new AddonSub(COG_LIGHT_SENSE_NAME, cogState.lightSense),
  ]);

  return [lightAddon, accelAddon, stateAddon];
};

export class MockCogInterface extends CogInterface {
  private updateTimer: number | null = null;
  private currentLight = createInitialLight();
  private currentAccel = createInitialAccel();
  private currentGyro = createInitialGyro();
  private currentPower = createInitialPower();
  private currentCogState = createInitialCogState();
  private latestAddonList = buildCogAddonList(
    this.currentLight,
    this.currentAccel,
    this.currentCogState
  );

  constructor() {
    super({} as Cog, { autoSubscribe: false });
  }

  start() {
    this.dispatchCurrentState();
    this.updateTimer = window.setInterval(() => {
      this.tick();
    }, UPDATE_INTERVAL_MS);
  }

  getAvailableAddons() {
    return this.latestAddonList;
  }

  unsubscribeFromPublishedData() {
    if (this.updateTimer !== null) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private dispatchCurrentState() {
    this.latestAddonList = buildCogAddonList(
      this.currentLight,
      this.currentAccel,
      this.currentCogState
    );
    this.setLight({ ...this.currentLight });
    this.setAccel({ ...this.currentAccel });
    this.setCogPublishedState({ ...this.currentCogState });
  }

  private tick() {
    this.currentLight = this.mutateLight(this.currentLight);
    this.currentAccel = this.mutateAccel(this.currentAccel);
    this.currentGyro = this.mutateGyro(this.currentGyro);
    this.currentPower = this.mutatePower(this.currentPower);
    this.currentCogState = this.mutateCogState(this.currentCogState);
    this.dispatchCurrentState();
  }

  private mutateLight(light: SimplifiedCogStateInfo["light"]): SimplifiedCogStateInfo["light"] {
    return {
      amb0: mutateNumber(light.amb0, 20, 250, 12),
      ir0: mutateNumber(light.ir0, 10, 380, 18),
      ir1: mutateNumber(light.ir1, 10, 380, 18),
      ir2: mutateNumber(light.ir2, 0, 180, 12),
    };
  }

  private mutateAccel(
    accel: SimplifiedCogStateInfo["accelerometer"]
  ): SimplifiedCogStateInfo["accelerometer"] {
    return {
      ax: mutateNumber(accel.ax, -1.1, 1.1, 0.07),
      ay: mutateNumber(accel.ay, -1.1, 1.1, 0.07),
      az: mutateNumber(accel.az, 0.6, 1.1, 0.05),
    };
  }

  private mutateGyro(gyro: SimplifiedCogStateInfo["gyroscope"]): SimplifiedCogStateInfo["gyroscope"] {
    return {
      gx: mutateNumber(gyro.gx, -2.5, 2.5, 0.2),
      gy: mutateNumber(gyro.gy, -2.5, 2.5, 0.2),
      gz: mutateNumber(gyro.gz, -2.5, 2.5, 0.3),
    };
  }

  private mutatePower(power: SimplifiedCogStateInfo["power"]): SimplifiedCogStateInfo["power"] {
    return {
      battV: mutateNumber(power.battV, 6.8, 8, 0.05),
      usb: power.usb,
    };
  }

  private mutateCogState(prev: CogState): CogState {
    const tiltOptions: readonly CogState["tilt"][] = ["none", "forward", "backward", "left", "right"];
    const movementOptions: readonly CogState["movementType"][] = ["none", "shake", "move"];
    const objectSenseOptions: readonly CogState["objectSense"][] = ["none", "left", "right"];
    const lightSenseOptions: readonly CogState["lightSense"][] = ["none", "low", "mid", "high"];

    let buttonClick = prev.buttonClick;
    if (prev.buttonClick === "none" && Math.random() < 0.08) {
      buttonClick = "click";
    } else if (prev.buttonClick === "click") {
      buttonClick = "release";
    } else if (prev.buttonClick === "release") {
      buttonClick = Math.random() < 0.3 ? "none" : "release";
    } else if (Math.random() < 0.05) {
      buttonClick = "none";
    }

    return {
      tilt: pickWithChance(prev.tilt, tiltOptions, 0.12),
      movementType: pickWithChance(prev.movementType, movementOptions, 0.1),
      rotation: "none",
      buttonClick,
      objectSense: pickWithChance(prev.objectSense, objectSenseOptions, 0.08),
      lightSense: pickWithChance(prev.lightSense, lightSenseOptions, 0.1),
    };
  }
}

export default MockCogInterface;
