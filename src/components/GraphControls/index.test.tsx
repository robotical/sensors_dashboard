import { fireEvent, render, screen } from "@testing-library/react";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";
import GraphControls, { GraphRecordingState } from ".";

jest.mock("../Dropdown", () => ({
  __esModule: true,
  default: ({
    label,
    disabled,
  }: {
    label: string;
    disabled?: boolean;
  }) => <select aria-label={label} disabled={disabled} />,
}));

const startOption: DropdownOptionsInterface = [
  "default",
  "default",
  "Start is pressed",
  () => true,
];
const endOption: DropdownOptionsInterface = [
  "default",
  "default",
  "Pause is pressed",
  () => false,
];

const renderControls = (
  recordingState: GraphRecordingState,
  overrides: Partial<React.ComponentProps<typeof GraphControls>> = {}
) => {
  const props: React.ComponentProps<typeof GraphControls> = {
    onClickPlay: jest.fn(),
    onClickPause: jest.fn(),
    onClickStop: jest.fn(),
    onAutoScrollToggle: jest.fn(),
    autoScrollEnabled: false,
    onStartOptionChange: jest.fn(),
    onEndOptionChange: jest.fn(),
    startSelectedOption: startOption,
    endSelectedOption: endOption,
    startOptions: [startOption],
    endOptions: [endOption],
    recordingState,
    hasData: false,
    ...overrides,
  };

  render(<GraphControls {...props} />);
  return props;
};

describe("GraphControls", () => {
  it("explains why recording is unavailable until a signal is selected", () => {
    const props = renderControls("choose-signals");
    const recordButton = screen.getByRole("button", { name: "Record" });

    expect((recordButton as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Select at least one signal to enable recording.")).not.toBeNull();
    expect((screen.getByRole("button", { name: "Pause" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Reset" }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(recordButton);
    expect(props.onClickPlay).not.toHaveBeenCalled();
  });

  it("keeps recording actions prominent in the ready state", () => {
    const props = renderControls("ready");
    const recordButton = screen.getByRole("button", { name: "Record" });

    expect((recordButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(recordButton);
    expect(props.onClickPlay).toHaveBeenCalledTimes(1);
  });

  it("disables trigger rules while recording and explains how to edit them", () => {
    renderControls("recording");
    fireEvent.click(screen.getByText("Advanced settings"));

    expect((screen.getByLabelText("Start when") as HTMLSelectElement).disabled).toBe(true);
    expect((screen.getByLabelText("End when") as HTMLSelectElement).disabled).toBe(true);
    expect(screen.getByText("Pause recording to edit trigger conditions.")).not.toBeNull();
    expect((screen.getByRole("button", { name: "Pause" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("requires a reset after an automatic end condition", () => {
    renderControls("paused", {
      hasData: true,
      endConditionReached: true,
    });

    expect((screen.getByRole("button", { name: "Resume" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Reset" }) as HTMLButtonElement).disabled).toBe(false);
    expect(
      screen.getByText("The end condition was met. Reset the graph to record again.")
    ).not.toBeNull();
  });
});
