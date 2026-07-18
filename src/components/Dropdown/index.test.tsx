import { render, screen } from "@testing-library/react";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";
import Dropdown from ".";

const option: DropdownOptionsInterface = [
  "default",
  "default",
  "Start is pressed",
  () => true,
];

describe("Dropdown", () => {
  it("uses a unique field id for each graph rule control", () => {
    render(
      <>
        <Dropdown
          label="Start when"
          options={[option]}
          onChange={jest.fn()}
          selectedOption={option}
          rule="start"
        />
        <Dropdown
          label="Start when"
          options={[option]}
          onChange={jest.fn()}
          selectedOption={option}
          rule="start"
        />
      </>
    );

    const fields = screen.getAllByLabelText("Start when");
    expect(fields).toHaveLength(2);
    expect(fields[0].id).toBeTruthy();
    expect(fields[1].id).toBeTruthy();
    expect(fields[0].id).not.toBe(fields[1].id);
  });

  it("exposes its disabled state while recording", () => {
    render(
      <Dropdown
        label="End when"
        options={[option]}
        onChange={jest.fn()}
        selectedOption={option}
        rule="end"
        disabled
      />
    );

    expect(screen.getByLabelText("End when").getAttribute("aria-disabled")).toBe(
      "true"
    );
  });
});
