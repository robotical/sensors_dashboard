import AddonSub from "./AddonSub";

describe("AddonSub", () => {
  it("updates selected before notifying the listener", () => {
    const addonSub = new AddonSub("Red", 0);
    const selectedValuesSeenByListener: boolean[] = [];

    addonSub.setSelectedListener(() => {
      selectedValuesSeenByListener.push(addonSub.selected);
    });

    addonSub.selectedListener?.();

    expect(addonSub.selected).toBe(true);
    expect(selectedValuesSeenByListener).toEqual([true]);
  });
});
