import addonNamesMap from "./constants/addons-names";

export default function renameValueLabel(valKey: string, addonName: string) {
    let newValueLabel = valKey.replace(addonName, "");
    newValueLabel = addonNamesMap(newValueLabel);
    return newValueLabel;
  }