import AddonSub from "./AddonSub";

export default class Addon {
  whoAmI: string;
  addonInputs: AddonSub[];
  constructor(whoAmI: string, addonInputs: AddonSub[]) {
    this.whoAmI = whoAmI;
    this.addonInputs = addonInputs;
  }
}
