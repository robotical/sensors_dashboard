import Addon from "../models/addons/Addon";
import AddonSub from "../models/addons/AddonSub";
import type MicroBitWebBluetooth from "../microbit/MicroBitWebBluetooth";
import type { MicroBitSensors } from "../microbit/MicroBitWebBluetooth";
import RaftInterface from "./RaftInterface";

export const MICROBIT_SIGNALS = {
  tilt: { group: "Tilt", x: "X (°)", y: "Y (°)" },
  buttons: { group: "Buttons", a: "A", b: "B" },
  touch: { group: "Touch pins", p0: "P0", p1: "P1", p2: "P2" },
  gestures: {
    group: "Gestures",
    moved: "Moved",
    shaken: "Shaken",
    jumped: "Jumped",
  },
} as const;

const bitValue = (value: number, bit: number) => (value >> bit) & 1;
const binaryValue = (value: number) => (Number(value) === 0 ? 0 : 1);

export default class MicroBitInterface extends RaftInterface {
  private unsubscribeSensorListener: (() => void) | null;

  constructor(public readonly microBit: MicroBitWebBluetooth) {
    super();
    this.unsubscribeSensorListener = microBit.addSensorListener(
      (sensors) => this.publishSensors(sensors)
    );
  }

  getAvailableAddons() {
    const sensors = this.microBit.sensors;
    return [
      new Addon(MICROBIT_SIGNALS.tilt.group, [
        new AddonSub(MICROBIT_SIGNALS.tilt.x, sensors.tiltX / 10),
        new AddonSub(MICROBIT_SIGNALS.tilt.y, sensors.tiltY / 10),
      ]),
      new Addon(MICROBIT_SIGNALS.buttons.group, [
        new AddonSub(MICROBIT_SIGNALS.buttons.a, binaryValue(sensors.buttonA)),
        new AddonSub(MICROBIT_SIGNALS.buttons.b, binaryValue(sensors.buttonB)),
      ]),
      new Addon(MICROBIT_SIGNALS.touch.group, [
        new AddonSub(MICROBIT_SIGNALS.touch.p0, binaryValue(sensors.touchPins[0])),
        new AddonSub(MICROBIT_SIGNALS.touch.p1, binaryValue(sensors.touchPins[1])),
        new AddonSub(MICROBIT_SIGNALS.touch.p2, binaryValue(sensors.touchPins[2])),
      ]),
      new Addon(MICROBIT_SIGNALS.gestures.group, [
        new AddonSub(
          MICROBIT_SIGNALS.gestures.moved,
          bitValue(sensors.gestureState, 2)
        ),
        new AddonSub(
          MICROBIT_SIGNALS.gestures.shaken,
          bitValue(sensors.gestureState, 0)
        ),
        new AddonSub(
          MICROBIT_SIGNALS.gestures.jumped,
          bitValue(sensors.gestureState, 1)
        ),
      ]),
    ];
  }

  unsubscribeFromPublishedData() {
    this.unsubscribeSensorListener?.();
    this.unsubscribeSensorListener = null;
  }

  private publishSensors(sensors: MicroBitSensors) {
    this.publish(
      MICROBIT_SIGNALS.tilt.group,
      MICROBIT_SIGNALS.tilt.x,
      sensors.tiltX / 10
    );
    this.publish(
      MICROBIT_SIGNALS.tilt.group,
      MICROBIT_SIGNALS.tilt.y,
      sensors.tiltY / 10
    );
    this.publish(
      MICROBIT_SIGNALS.buttons.group,
      MICROBIT_SIGNALS.buttons.a,
      binaryValue(sensors.buttonA)
    );
    this.publish(
      MICROBIT_SIGNALS.buttons.group,
      MICROBIT_SIGNALS.buttons.b,
      binaryValue(sensors.buttonB)
    );
    this.publish(
      MICROBIT_SIGNALS.touch.group,
      MICROBIT_SIGNALS.touch.p0,
      binaryValue(sensors.touchPins[0])
    );
    this.publish(
      MICROBIT_SIGNALS.touch.group,
      MICROBIT_SIGNALS.touch.p1,
      binaryValue(sensors.touchPins[1])
    );
    this.publish(
      MICROBIT_SIGNALS.touch.group,
      MICROBIT_SIGNALS.touch.p2,
      binaryValue(sensors.touchPins[2])
    );
    this.publish(
      MICROBIT_SIGNALS.gestures.group,
      MICROBIT_SIGNALS.gestures.moved,
      bitValue(sensors.gestureState, 2)
    );
    this.publish(
      MICROBIT_SIGNALS.gestures.group,
      MICROBIT_SIGNALS.gestures.shaken,
      bitValue(sensors.gestureState, 0)
    );
    this.publish(
      MICROBIT_SIGNALS.gestures.group,
      MICROBIT_SIGNALS.gestures.jumped,
      bitValue(sensors.gestureState, 1)
    );
  }

  private publish(whoAmI: string, addonInput: string, value: number) {
    this.dispatchEvent({
      type: `on${whoAmI}=>${addonInput}Change`,
      value,
      whoAmI,
      addonInput,
    });
  }
}
