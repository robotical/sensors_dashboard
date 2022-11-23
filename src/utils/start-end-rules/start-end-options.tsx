import Addon from "../../models/addons/Addon";
import { START_OPTIONS_BY_WHOAMI_AND_NAME } from "../constants/start-end-rules";
export interface DropdownOptionsInterface {
  [addonNameTOaddonInput: string]: string[];
}

export const getStartOptions = (addons: Addon[]) => {
  const startOptions: DropdownOptionsInterface = {"": ["=>start is pressed"]};

  for (const addon of addons) {
    for (const addonInput of addon.addonInputs) {
      if (addonInput.selected) {
        let specificOptionsForThatAddonInput: string[] = [];
        try {
          specificOptionsForThatAddonInput = START_OPTIONS_BY_WHOAMI_AND_NAME[addon.id][addonInput.name];
        } catch(e) {
          console.log("No specific options for that addon input", e);
        }
        if (startOptions.hasOwnProperty(addon.name)) {
          startOptions[addon.name].push(...specificOptionsForThatAddonInput);
        } else {
          startOptions[addon.name] = specificOptionsForThatAddonInput;
        }
      }
    }
  }
  return startOptions;
};

export const getEndOptions = (addons: Addon[]) => {
  const endOptions: DropdownOptionsInterface = {"": ["=>paused is pressed"]};

  for (const addon of addons) {
    for (const addonInput of addon.addonInputs) {
      if (addonInput.selected) {
        const specificOptionsForThatAddonInput: string[] = [];
        if (endOptions.hasOwnProperty(addon.name)) {
          endOptions[addon.name].push(...specificOptionsForThatAddonInput);
        } else {
          endOptions[addon.name] = specificOptionsForThatAddonInput;
        }
      }
    }
  }
  return endOptions;
};
