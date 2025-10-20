import MartyInterface from "../MartyInterface";
import Addon from "../../models/addons/Addon";
import AddonSub from "../../models/addons/AddonSub";
import renameValueLabel from "../../utils/rename-value-label";
import EXCLUDED_ADDONS from "../../utils/constants/excluded-addons";
import whoAmINameMap from "../../utils/constants/whoAmI-names";
import SERVO_NAMES_MAP from "../../utils/constants/servo-names";
import {
  ACCELEROMETER_NAME,
  ACCELEROMETER_NAME_X,
  ACCELEROMETER_NAME_Y,
  ACCELEROMETER_NAME_Z,
  MOTOR_CURRENT_NAME,
  MOTOR_POSITION_NAME,
} from "../../utils/types/addon-names";
import type MartyType from "@robotical/webapp-types/dist-types/src/application/RAFTs/Marty/Marty";
import {
  type ROSSerialAddOnStatusList,
  type ROSSerialIMU,
  type ROSSerialSmartServos,
} from "@robotical/roboticaljs";

type MartyAddon = ROSSerialAddOnStatusList["addons"][number];
type MartyServo = ROSSerialSmartServos["smartServos"][number];

const UPDATE_INTERVAL_MS = 750;

const cloneAddons = (addons: MartyAddon[]): MartyAddon[] =>
  addons.map((addon) => ({
    ...addon,
    vals: { ...addon.vals },
  }));

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const mutateNumber = (value: number, min: number, max: number, maxDelta: number) => {
  const delta = (Math.random() * 2 - 1) * maxDelta;
  const next = value + delta;
  return Number(clamp(next, min, max).toFixed(2));
};

const randomBoolean = (current: number, flipChance = 0.15) => {
  if (Math.random() < flipChance) {
    return current > 0.5 ? 0 : 1;
  }
  return current;
};

const createInitialAddons = (): MartyAddon[] => [
  {
    id: 0,
    deviceTypeID: 0,
    whoAmI: "IRFoot",
    name: "Touch",
    status: 0,
    vals: {
      Touch: 0,
      Touch_IR: 180,
      Touch_Ambient: 200,
    },
  },
  {
    id: 1,
    deviceTypeID: 0,
    whoAmI: "coloursensor",
    name: "Color",
    status: 0,
    vals: {
      ColorClear: 120,
      ColorRed: 60,
      ColorGreen: 75,
      ColorBlue: 80,
    },
  },
  {
    id: 2,
    deviceTypeID: 0,
    whoAmI: "lightsensor",
    name: "Light",
    status: 0,
    vals: {
      LightReading1: 90,
      LightReading2: 110,
      LightReading3: 105,
    },
  },
];

const createInitialServos = (): MartyServo[] =>
  Array.from({ length: SERVO_NAMES_MAP.length }, (_, id) => ({
    id,
    pos: 90,
    current: 350,
    status: 0,
  }));

const createInitialAccel = (): ROSSerialIMU["accel"] => ({
  x: 0.04,
  y: -0.05,
  z: 0.98,
});

const buildMartyAddonList = (
  addons: MartyAddon[],
  servos: MartyServo[],
  accel: ROSSerialIMU["accel"]
) => {
  const addonObjects: Addon[] = [];

  for (const addon of addons) {
    const whoAmI = whoAmINameMap(addon.whoAmI);
    if (EXCLUDED_ADDONS.includes(whoAmI)) continue;
    const subAddons: AddonSub[] = [];
    for (const valKey in addon.vals) {
      const value = addon.vals[valKey];
      const addonInputName = renameValueLabel(valKey, addon.name);
      subAddons.push(new AddonSub(addonInputName, typeof value === "number" ? value : 0));
    }
    addonObjects.push(new Addon(whoAmI, subAddons));
  }

  const posAddonSub: AddonSub[] = [];
  const currAddonSub: AddonSub[] = [];
  for (const servo of servos) {
    const servoName = SERVO_NAMES_MAP[servo.id] || `servo-${servo.id}`;
    posAddonSub.push(new AddonSub(servoName, servo.pos));
    currAddonSub.push(new AddonSub(servoName, servo.current));
  }
  addonObjects.push(new Addon(MOTOR_POSITION_NAME, posAddonSub));
  addonObjects.push(new Addon(MOTOR_CURRENT_NAME, currAddonSub));

  const accelAddonSub: AddonSub[] = [
    new AddonSub(ACCELEROMETER_NAME_X, accel.x),
    new AddonSub(ACCELEROMETER_NAME_Y, accel.y),
    new AddonSub(ACCELEROMETER_NAME_Z, accel.z),
  ];
  addonObjects.push(new Addon(ACCELEROMETER_NAME, accelAddonSub));

  return addonObjects;
};

export class MockMartyInterface extends MartyInterface {
  private updateTimer: number | null = null;
  private currentAddons: MartyAddon[];
  private currentServos: MartyServo[];
  private currentAccel: ROSSerialIMU["accel"];
  private latestAddonList: Addon[] = [];

  constructor() {
    super({} as MartyType, { autoSubscribe: false });
    this.currentAddons = createInitialAddons();
    this.currentServos = createInitialServos();
    this.currentAccel = createInitialAccel();
    this.latestAddonList = buildMartyAddonList(
      this.currentAddons,
      this.currentServos,
      this.currentAccel
    );
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
    this.latestAddonList = buildMartyAddonList(
      this.currentAddons,
      this.currentServos,
      this.currentAccel
    );
    this.setAddons(cloneAddons(this.currentAddons));
    this.setServos({
      smartServos: this.currentServos.map((servo) => ({ ...servo })),
    } as ROSSerialSmartServos);
    this.setAccel({
      accel: { ...this.currentAccel },
    } as ROSSerialIMU);
  }

  private tick() {
    this.currentAddons = this.currentAddons.map((addon) => this.mutateAddon(addon));
    this.currentServos = this.currentServos.map((servo) => this.mutateServo(servo));
    this.currentAccel = this.mutateAccel(this.currentAccel);
    this.dispatchCurrentState();
  }

  private mutateAddon(addon: MartyAddon): MartyAddon {
    if (addon.name === "Touch") {
      return {
        ...addon,
        vals: {
          Touch: randomBoolean(Number(addon.vals.Touch ?? 0)),
          Touch_IR: mutateNumber(Number(addon.vals.Touch_IR ?? 0), 80, 320, 20),
          Touch_Ambient: mutateNumber(Number(addon.vals.Touch_Ambient ?? 0), 80, 320, 15),
        },
      };
    }
    if (addon.name === "Color") {
      return {
        ...addon,
        vals: {
          ColorClear: mutateNumber(Number(addon.vals.ColorClear ?? 0), 20, 255, 18),
          ColorRed: mutateNumber(Number(addon.vals.ColorRed ?? 0), 10, 255, 18),
          ColorGreen: mutateNumber(Number(addon.vals.ColorGreen ?? 0), 10, 255, 18),
          ColorBlue: mutateNumber(Number(addon.vals.ColorBlue ?? 0), 10, 255, 18),
        },
      };
    }
    if (addon.name === "Light") {
      return {
        ...addon,
        vals: {
          LightReading1: mutateNumber(Number(addon.vals.LightReading1 ?? 0), 0, 255, 15),
          LightReading2: mutateNumber(Number(addon.vals.LightReading2 ?? 0), 0, 255, 15),
          LightReading3: mutateNumber(Number(addon.vals.LightReading3 ?? 0), 0, 255, 15),
        },
      };
    }
    return addon;
  }

  private mutateServo(servo: MartyServo): MartyServo {
    return {
      ...servo,
      pos: mutateNumber(servo.pos, -90, 90, 6),
      current: mutateNumber(servo.current, 150, 700, 40),
    };
  }

  private mutateAccel(accel: ROSSerialIMU["accel"]): ROSSerialIMU["accel"] {
    return {
      x: mutateNumber(accel.x, -1.2, 1.2, 0.08),
      y: mutateNumber(accel.y, -1.2, 1.2, 0.08),
      z: mutateNumber(accel.z, 0.7, 1.2, 0.05),
    };
  }
}

export default MockMartyInterface;
