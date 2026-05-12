import { fireEvent, render, screen } from "@testing-library/react";
import { useEffect, useRef, useState } from "react";
import AddonSub from "../../../../models/addons/AddonSub";
import AddonSubItem from ".";

function AddonSubItemHarness() {
  const [, refresh] = useState(0);
  const addonSub = useRef(new AddonSub("Reading 1", 0)).current;

  useEffect(() => {
    addonSub.setSelectedListener(() => refresh((value) => value + 1));
  }, [addonSub]);

  return <AddonSubItem addonSubItem={addonSub} />;
}

describe("AddonSubItem", () => {
  it("toggles once when clicking the checkbox itself", () => {
    render(<AddonSubItemHarness />);

    const checkbox = screen.getByRole("checkbox", { name: "Reading 1" });
    fireEvent.click(checkbox);

    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });

  it("toggles when clicking the row label", () => {
    render(<AddonSubItemHarness />);

    const checkbox = screen.getByRole("checkbox", { name: "Reading 1" });
    fireEvent.click(screen.getByText("Reading 1"));

    expect((checkbox as HTMLInputElement).checked).toBe(true);
  });
});
