import styles from "./styles.module.css";
import { ReactComponent as PlaySVG } from "../../assets/graph-controls/play.svg";
import { ReactComponent as PauseSVG } from "../../assets/graph-controls/pause.svg";
import { ReactComponent as StopSVG } from "../../assets/graph-controls/stop.svg";
import { ReactComponent as RecordingSVG } from "../../assets/graph-controls/recording.svg";
import { Checkbox } from "@mui/material";
import Dropdown from "../Dropdown";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";

interface GraphControlsProps {
  onClickPlay: () => void;
  onClickPause: () => void;
  onClickStop: () => void;
  onAutoScrollToggle: () => void;
  autoScrollEnabled: boolean;
  onStartOptionChange: (
    selectedOption: DropdownOptionsInterface,
    rule: "start" | "end"
  ) => void;
  onEndOptionChange: (
    selectedOption: DropdownOptionsInterface,
    rule: "start" | "end"
  ) => void;
  startSelectedOption: DropdownOptionsInterface | undefined;
  endSelectedOption: DropdownOptionsInterface | undefined;
  startOptions: DropdownOptionsInterface[];
  endOptions: DropdownOptionsInterface[];
  isTracking: boolean;
}

export default function GraphControls({
  onClickPlay,
  onClickPause,
  onClickStop,
  onAutoScrollToggle,
  autoScrollEnabled,
  onStartOptionChange,
  onEndOptionChange,
  startSelectedOption,
  endSelectedOption,
  startOptions,
  endOptions,
  isTracking,
}: GraphControlsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.startEndRules}>
        <Dropdown
          rule="start"
          label="Start when"
          onChange={onStartOptionChange}
          options={startOptions}
          selectedOption={startSelectedOption}
        />
        <Dropdown
          rule="end"
          label="End when"
          onChange={onEndOptionChange}
          options={endOptions}
          selectedOption={endSelectedOption}
        />
      </div>

      <div className={styles.autoScrollContainer}>
        <p>Auto-scroll?</p>
        <Checkbox checked={autoScrollEnabled} onChange={onAutoScrollToggle} />
      </div>

      <div className={styles.playPauseContainer}>
        <div className={styles.graphControlsSVGContainer} onClick={onClickPlay}>
          {isTracking ? <RecordingSVG /> : <PlaySVG />}
        </div>
        <div
          className={styles.graphControlsSVGContainer}
          onClick={onClickPause}
        >
          <PauseSVG />
        </div>

        <div className={styles.graphControlsSVGContainer} onClick={onClickStop}>
          <StopSVG />
        </div>
      </div>
    </div>
  );
}
