const MICROBIT_SERVICE = 0xf005;
const MICROBIT_SENSOR_CHARACTERISTIC = "5261da01-fa7e-42ab-850b-7c80220097cc";
const SENSOR_DATA_TIMEOUT_MS = 4500;

export type MicroBitSensors = {
  tiltX: number;
  tiltY: number;
  buttonA: number;
  buttonB: number;
  touchPins: [number, number, number];
  gestureState: number;
};

export type MicroBitSensorListener = (
  current: MicroBitSensors,
  previous: MicroBitSensors
) => void;

type BluetoothCharacteristic = EventTarget & {
  value?: DataView | null;
  startNotifications(): Promise<unknown>;
  stopNotifications?(): Promise<unknown>;
  readValue(): Promise<DataView>;
};

type BluetoothService = {
  getCharacteristic(uuid: string): Promise<BluetoothCharacteristic>;
};

type BluetoothServer = {
  connected: boolean;
  disconnect(): void;
  getPrimaryService(uuid: number): Promise<BluetoothService>;
};

type BluetoothDevice = EventTarget & {
  id: string;
  name?: string | null;
  gatt?: {
    connect(): Promise<BluetoothServer>;
  };
};

type WebBluetooth = {
  requestDevice(options: {
    filters: Array<{ services: number[] }>;
  }): Promise<BluetoothDevice>;
};

const getWebBluetooth = () =>
  (navigator as Navigator & { bluetooth?: WebBluetooth }).bluetooth;

const signed16 = (high: number, low: number) => {
  let value = low | (high << 8);
  if (value >= 1 << 15) {
    value -= 1 << 16;
  }
  return value;
};

const copySensors = (sensors: MicroBitSensors): MicroBitSensors => ({
  ...sensors,
  touchPins: [...sensors.touchPins],
});

export const isMicroBitWebBluetoothSupported = () =>
  typeof navigator !== "undefined" &&
  typeof getWebBluetooth()?.requestDevice === "function";

export const isMicroBitDevice = (
  device: unknown
): device is MicroBitWebBluetooth =>
  Boolean(
    device &&
      typeof device === "object" &&
      (device as { isMicroBitWebBluetooth?: boolean }).isMicroBitWebBluetooth
  );

export default class MicroBitWebBluetooth {
  id = "";
  name = "micro:bit";
  readonly deviceType = "micro:bit";
  readonly isMicroBitWebBluetooth = true;
  sensors = MicroBitWebBluetooth.defaultSensors();

  private device: BluetoothDevice | null = null;
  private server: BluetoothServer | null = null;
  private sensorCharacteristic: BluetoothCharacteristic | null = null;
  private sensorListeners = new Set<MicroBitSensorListener>();
  private disconnectListeners = new Set<(microBit: MicroBitWebBluetooth) => void>();
  private receiveTimeoutId: number | null = null;
  private didEmitDisconnect = false;

  static defaultSensors(): MicroBitSensors {
    return {
      tiltX: 0,
      tiltY: 0,
      buttonA: 0,
      buttonB: 0,
      touchPins: [0, 0, 0],
      gestureState: 0,
    };
  }

  async connect() {
    const bluetooth = getWebBluetooth();
    if (!bluetooth) {
      throw new Error("Web Bluetooth is not available in this browser.");
    }

    const device = await bluetooth.requestDevice({
      filters: [{ services: [MICROBIT_SERVICE] }],
    });
    if (!device.gatt) {
      throw new Error("The selected micro:bit does not expose a Bluetooth connection.");
    }

    this.device = device;
    this.id = device.id || `microbit-${Date.now()}`;
    this.name = device.name || "micro:bit";
    this.didEmitDisconnect = false;
    device.addEventListener(
      "gattserverdisconnected",
      this.handleGattServerDisconnected
    );

    try {
      this.server = await device.gatt.connect();
      const service = await this.server.getPrimaryService(MICROBIT_SERVICE);
      this.sensorCharacteristic = await service.getCharacteristic(
        MICROBIT_SENSOR_CHARACTERISTIC
      );
      this.sensorCharacteristic.addEventListener(
        "characteristicvaluechanged",
        this.handleCharacteristicValueChanged
      );
      await this.sensorCharacteristic.startNotifications();

      try {
        this.handleSensorData(await this.sensorCharacteristic.readValue());
      } catch {
        // Some firmware begins notifying before direct reads are available.
      }

      this.resetReceiveTimeout();
      return this;
    } catch (error) {
      this.releaseConnection();
      throw error;
    }
  }

  disconnect() {
    this.clearReceiveTimeout();
    this.releaseConnection();
    this.emitDisconnect();
  }

  isConnected() {
    return Boolean(this.server?.connected);
  }

  getFriendlyName() {
    return this.name || "micro:bit";
  }

  addSensorListener(callback: MicroBitSensorListener) {
    this.sensorListeners.add(callback);
    return () => {
      this.sensorListeners.delete(callback);
    };
  }

  addDisconnectListener(callback: (microBit: MicroBitWebBluetooth) => void) {
    this.disconnectListeners.add(callback);
    return () => {
      this.disconnectListeners.delete(callback);
    };
  }

  handleSensorData(value: DataView | null | undefined) {
    if (!value || value.byteLength < 10) {
      return;
    }

    const data = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const previous = copySensors(this.sensors);
    this.sensors = {
      tiltX: signed16(data[0], data[1]),
      tiltY: signed16(data[2], data[3]),
      buttonA: data[4],
      buttonB: data[5],
      touchPins: [data[6], data[7], data[8]],
      gestureState: data[9],
    };

    this.sensorListeners.forEach((callback) =>
      callback(this.sensors, previous)
    );
    this.resetReceiveTimeout();
  }

  private handleCharacteristicValueChanged = (event: Event) => {
    this.handleSensorData(
      (event.target as BluetoothCharacteristic | null)?.value
    );
  };

  private handleGattServerDisconnected = () => {
    this.clearReceiveTimeout();
    this.releaseConnection();
    this.emitDisconnect();
  };

  private releaseConnection() {
    if (this.sensorCharacteristic) {
      this.sensorCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        this.handleCharacteristicValueChanged
      );
      try {
        this.sensorCharacteristic.stopNotifications?.().catch(() => undefined);
      } catch {
        // Ignore cleanup errors from a device that is already disconnected.
      }
    }

    this.device?.removeEventListener(
      "gattserverdisconnected",
      this.handleGattServerDisconnected
    );
    if (this.server?.connected) {
      this.server.disconnect();
    }

    this.server = null;
    this.sensorCharacteristic = null;
    this.device = null;
  }

  private resetReceiveTimeout() {
    this.clearReceiveTimeout();
    this.receiveTimeoutId = window.setTimeout(
      () => this.disconnect(),
      SENSOR_DATA_TIMEOUT_MS
    );
  }

  private clearReceiveTimeout() {
    if (this.receiveTimeoutId !== null) {
      window.clearTimeout(this.receiveTimeoutId);
      this.receiveTimeoutId = null;
    }
  }

  private emitDisconnect() {
    if (this.didEmitDisconnect) {
      return;
    }
    this.didEmitDisconnect = true;
    const listeners = Array.from(this.disconnectListeners);
    listeners.forEach((callback) => callback(this));
    this.sensorListeners.clear();
    this.disconnectListeners.clear();
  }
}
