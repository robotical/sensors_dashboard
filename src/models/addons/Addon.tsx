import AddonSub from "./AddonSub";

export default class Addon {
  name: string;
  id: string;
  addonInputs: AddonSub[];
  constructor(name: string, id: string, addonInputs: AddonSub[]) {
    this.name = name;
    this.id = id;
    this.addonInputs = addonInputs;
  }
}
