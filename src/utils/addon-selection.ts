import Addon from "../models/addons/Addon";

export const getAddonInputKey = (addon: Addon, addonInputName: string) =>
  `${addon.whoAmI}=>${addonInputName}`;

export const preserveAddonSelections = (nextAddons: Addon[], previousAddons: Addon[]) => {
  const previousSelections = new Map<string, boolean>();

  for (const addon of previousAddons) {
    for (const addonInput of addon.addonInputs) {
      previousSelections.set(getAddonInputKey(addon, addonInput.name), addonInput.selected);
    }
  }

  for (const addon of nextAddons) {
    for (const addonInput of addon.addonInputs) {
      const previousSelection = previousSelections.get(getAddonInputKey(addon, addonInput.name));
      if (previousSelection !== undefined) {
        addonInput.selected = previousSelection;
      }
    }
  }

  return nextAddons;
};
