import MicroBitWebBluetooth from "./MicroBitWebBluetooth";

describe("MicroBitWebBluetooth", () => {
  const originalBluetooth = Object.getOwnPropertyDescriptor(
    navigator,
    "bluetooth"
  );

  afterEach(() => {
    if (originalBluetooth) {
      Object.defineProperty(navigator, "bluetooth", originalBluetooth);
    } else {
      delete (navigator as Navigator & { bluetooth?: unknown }).bluetooth;
    }
  });

  it("connects to the Scratch-compatible service and publishes sensor packets", async () => {
    const packet = new Uint8Array([
      0xff, 0x38, 0x00, 0xc8, 1, 0, 1, 0, 1, 0b101,
    ]);
    const characteristic = Object.assign(new EventTarget(), {
      startNotifications: jest.fn().mockResolvedValue(undefined),
      stopNotifications: jest.fn().mockResolvedValue(undefined),
      readValue: jest.fn().mockResolvedValue(new DataView(packet.buffer)),
      value: null,
    });
    const service = {
      getCharacteristic: jest.fn().mockResolvedValue(characteristic),
    };
    const server = {
      connected: true,
      disconnect: jest.fn(),
      getPrimaryService: jest.fn().mockResolvedValue(service),
    };
    const device = Object.assign(new EventTarget(), {
      id: "microbit-1",
      name: "BBC micro:bit",
      gatt: { connect: jest.fn().mockResolvedValue(server) },
    });
    const requestDevice = jest.fn().mockResolvedValue(device);
    Object.defineProperty(navigator, "bluetooth", {
      configurable: true,
      value: { requestDevice },
    });

    const microBit = new MicroBitWebBluetooth();
    const sensorListener = jest.fn();
    const disconnectListener = jest.fn();
    microBit.addSensorListener(sensorListener);
    microBit.addDisconnectListener(disconnectListener);

    await microBit.connect();

    expect(requestDevice).toHaveBeenCalledWith({
      filters: [{ services: [0xf005] }],
    });
    expect(service.getCharacteristic).toHaveBeenCalledWith(
      "5261da01-fa7e-42ab-850b-7c80220097cc"
    );
    expect(microBit.sensors).toEqual({
      tiltX: -200,
      tiltY: 200,
      buttonA: 1,
      buttonB: 0,
      touchPins: [1, 0, 1],
      gestureState: 0b101,
    });
    expect(sensorListener).toHaveBeenCalledTimes(1);

    microBit.disconnect();
    microBit.disconnect();

    expect(characteristic.stopNotifications).toHaveBeenCalledTimes(1);
    expect(server.disconnect).toHaveBeenCalledTimes(1);
    expect(disconnectListener).toHaveBeenCalledTimes(1);
  });
});
