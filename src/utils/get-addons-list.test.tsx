import type RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import getAllAddonsList from "./get-addons-list";
import {
  COG_ROTATION_NAME,
  COG_STATE_NAME,
  GYROSCOPE_NAME,
  GYROSCOPE_NAME_X,
  GYROSCOPE_NAME_Y,
  GYROSCOPE_NAME_Z,
} from "./types/addon-names";

jest.mock("@robotical/webapp-types/dist-types/src/types/raft", () => ({
  RaftTypeE: {
    COG: "Cog",
    MARTY: "Marty",
  },
}));

describe("getAllAddonsList", () => {
  it("includes Cog gyroscope axes and derived rotation state", () => {
    const cog = {
      type: "Cog",
      raftStateInfo: {
        light: {
          amb0: 120,
          ir0: 10,
          ir1: 20,
          ir2: 30,
        },
        accelerometer: {
          ax: 0.1,
          ay: 0.2,
          az: 0.3,
        },
        gyroscope: {
          gx: 1.1,
          gy: 2.2,
          gz: 3.3,
        },
        power: {
          battV: 7.4,
          usb: "no",
        },
      },
      publishedDataAnalyser: {
        cogState: {
          tilt: "none",
          movementType: "none",
          rotation: "clockwise",
          buttonClick: "none",
          objectSense: "none",
          lightSense: "mid",
        },
      },
    } as unknown as RAFT;

    const addons = getAllAddonsList(cog);
    const gyroAddon = addons.find((addon) => addon.whoAmI === GYROSCOPE_NAME);
    const cogStateAddon = addons.find((addon) => addon.whoAmI === COG_STATE_NAME);

    expect(gyroAddon?.addonInputs.map((input) => [input.name, input.value])).toEqual([
      [GYROSCOPE_NAME_X, 1.1],
      [GYROSCOPE_NAME_Y, 2.2],
      [GYROSCOPE_NAME_Z, 3.3],
    ]);
    expect(
      cogStateAddon?.addonInputs.find((input) => input.name === COG_ROTATION_NAME)?.value
    ).toBe("clockwise");
  });
});
