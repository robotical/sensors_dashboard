import renameValueLabel from "./rename-value-label";

describe("renameValueLabel", () => {
  it("uses full sensor-key mappings before removing the addon prefix", () => {
    expect(renameValueLabel("Touch", "Touch")).toBe("Obstacle Detected?");
    expect(renameValueLabel("Touch_IR", "Touch")).toBe("Obstacle Sensor");
    expect(renameValueLabel("Touch_Ambient", "Touch")).toBe("Ambient IR - Front");
  });

  it("falls back to shortened-key mappings for compound addon names", () => {
    expect(renameValueLabel("ColorClear", "Color")).toBe("Brightness");
    expect(renameValueLabel("LightReading1", "Light")).toBe("Light Level - Right");
  });

  it("never returns a blank visible label", () => {
    expect(renameValueLabel("Touch", "Touch")).not.toBe("");
  });
});
