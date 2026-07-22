import MicroBitInterface, { MICROBIT_SIGNALS } from "./MicroBitInterface";
import MicroBitWebBluetooth, {
  MicroBitSensorListener,
  MicroBitSensors,
} from "../microbit/MicroBitWebBluetooth";

describe("MicroBitInterface", () => {
  it("exposes graph signals and translates every sensor value", () => {
    let sensorListener: MicroBitSensorListener | null = null;
    const unsubscribe = jest.fn();
    const microBit = {
      sensors: MicroBitWebBluetooth.defaultSensors(),
      addSensorListener: jest.fn((listener: MicroBitSensorListener) => {
        sensorListener = listener;
        return unsubscribe;
      }),
    } as unknown as MicroBitWebBluetooth;
    const adapter = new MicroBitInterface(microBit);
    const dispatch = jest.spyOn(adapter, "dispatchEvent");

    expect(adapter.getAvailableAddons().map((addon) => addon.whoAmI)).toEqual([
      MICROBIT_SIGNALS.tilt.group,
      MICROBIT_SIGNALS.buttons.group,
      MICROBIT_SIGNALS.touch.group,
      MICROBIT_SIGNALS.gestures.group,
    ]);

    const sensors: MicroBitSensors = {
      tiltX: -155,
      tiltY: 202,
      buttonA: 1,
      buttonB: 0,
      touchPins: [1, 0, 1],
      gestureState: 0b111,
    };
    sensorListener!(sensors, MicroBitWebBluetooth.defaultSensors());

    expect(dispatch.mock.calls.map(([event]) => event)).toEqual([
      expect.objectContaining({
        type: "onTilt=>X (°)Change",
        value: -15.5,
      }),
      expect.objectContaining({
        type: "onTilt=>Y (°)Change",
        value: 20.2,
      }),
      expect.objectContaining({ type: "onButtons=>AChange", value: 1 }),
      expect.objectContaining({ type: "onButtons=>BChange", value: 0 }),
      expect.objectContaining({ type: "onTouch pins=>P0Change", value: 1 }),
      expect.objectContaining({ type: "onTouch pins=>P1Change", value: 0 }),
      expect.objectContaining({ type: "onTouch pins=>P2Change", value: 1 }),
      expect.objectContaining({ type: "onGestures=>MovedChange", value: 1 }),
      expect.objectContaining({ type: "onGestures=>ShakenChange", value: 1 }),
      expect.objectContaining({ type: "onGestures=>JumpedChange", value: 1 }),
    ]);

    adapter.unsubscribeFromPublishedData();
    adapter.unsubscribeFromPublishedData();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
