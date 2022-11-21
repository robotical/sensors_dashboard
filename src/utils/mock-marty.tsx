import { Marty2 } from "../app-bridge/mv2-rn";

export default class MockMarty {
  mv2: Marty2;
  constructor(mv2: Marty2) {
    this.mv2 = mv2;
  }

  init() {
    console.log("initialising mock Marty");
    setInterval(() => {
      this._updateSensors();
    }, 1000);
  }

  _updateSensors() {
    this.mv2.setBattRemainCapacityPercent(Math.random() * 100);
    this.mv2.setMartyName("Marty");
    this.mv2.setAddons(this.createAddons());
    this.mv2.setAccel(this.createAccel());
    this.mv2.setServos(this.createServos());
    this.mv2.setIsConnected(true);
    // TODO 2022 - can rssi be got from WebBLE connection?
    this.mv2.setRSSI(Math.random() * -200);
  }

  createAccel() {
    return JSON.stringify({
      accel: {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1,
      },
    });
  }

  createServos() {
    return JSON.stringify({
      smartServos: [
        {
          id: 0,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 1,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 2,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 3,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 4,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 5,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 6,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 7,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
        {
          id: 8,
          pos: Math.random(),
          current: Math.random(),
          status: 128,
        },
      ],
    });
  }

  createAddons() {
    return JSON.stringify({
      addons: [
        {
          id: 35,
          deviceTypeID: 0,
          whoAmI: "coloursensor",
          name: "LeftColorSensor",
          status: 128,
          vals: {
            LeftColorSensorClear: Math.random(),
            LeftColorSensorRed: Math.random(),
            LeftColorSensorGreen: Math.random(),
            LeftColorSensorBlue: Math.random(),
            LeftColorSensorTouch: true,
            LeftColorSensorAir: true,
          },
        },
        {
          id: 34,
          deviceTypeID: 0,
          whoAmI: "IRFoot",
          name: "RightIRFoot",
          status: 128,
          vals: {
            RightIRFootTouch: true,
            RightIRFootAir: true,
            RightIRFootVal: Math.random(),
          },
        },
      ],
    });
  }
}
