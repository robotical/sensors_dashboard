import Addon from "../models/addons/Addon";
import AddonSub from "../models/addons/AddonSub";
import { preserveAddonSelections } from "./addon-selection";

describe("preserveAddonSelections", () => {
  it("keeps matching selected inputs when the addon list is rebuilt", () => {
    const previousAddons = [
      new Addon("Light Sensor", [
        new AddonSub("Reading 1", 0),
        new AddonSub("Reading 2", 0),
      ]),
    ];
    previousAddons[0].addonInputs[1].selected = true;

    const nextAddons = [
      new Addon("Light Sensor", [
        new AddonSub("Reading 1", 10),
        new AddonSub("Reading 2", 20),
      ]),
    ];

    preserveAddonSelections(nextAddons, previousAddons);

    expect(nextAddons[0].addonInputs[0].selected).toBe(false);
    expect(nextAddons[0].addonInputs[1].selected).toBe(true);
  });
});
