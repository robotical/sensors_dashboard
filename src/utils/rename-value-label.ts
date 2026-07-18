import addonNamesMap from "./constants/addons-names";

export default function renameValueLabel(valKey: string, addonName: string) {
  const mappedFullKey = addonNamesMap(valKey);
  if (mappedFullKey !== valKey) {
    return mappedFullKey;
  }

  const shortenedKey = valKey
    .replace(addonName, "")
    .replace(/^[_\s-]+/, "");
  const mappedShortKey = addonNamesMap(shortenedKey);

  return mappedShortKey || valKey;
}
