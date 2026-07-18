import { fireEvent, render, screen } from "@testing-library/react";
import Addon from "../../models/addons/Addon";
import AddonSub from "../../models/addons/AddonSub";
import AddonsList from ".";

const createAddons = () => {
  const temperature = new AddonSub("Temperature", 20);
  temperature.selected = true;
  return [new Addon("Environment", [temperature, new AddonSub("Light", 0)])];
};

describe("AddonsList", () => {
  it("keeps signal selection available through an accessible disclosure", () => {
    render(<AddonsList addons={createAddons()} />);

    const disclosure = screen.getByRole("button", {
      name: /Available signals 1 selected/i,
    });
    const regionId = disclosure.getAttribute("aria-controls");

    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    expect(regionId).toBeTruthy();
    expect(document.getElementById(regionId!)).not.toBeNull();

    fireEvent.click(disclosure);
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(document.getElementById(regionId!)?.hidden).toBe(true);

    fireEvent.click(disclosure);
    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    expect(document.getElementById(regionId!)?.hidden).toBe(false);
  });

  it("provides an explicit empty state when no signals are available", () => {
    render(<AddonsList addons={[]} />);

    expect(screen.getByText("No signals are available yet.")).not.toBeNull();
  });
});
