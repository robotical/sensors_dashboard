import styles from "./styles.module.css";
import { ReactComponent as PlaySVG } from "../../assets/graph-controls/play.svg";
import { ReactComponent as PauseSVG } from "../../assets/graph-controls/pause.svg";
import { ReactComponent as StopSVG } from "../../assets/graph-controls/stop.svg";
import { Checkbox } from "@mui/material";
import Dropdown from "../Dropdown";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";

interface GraphControlsProps {
  onClickPlay: () => void;
  onClickPause: () => void;
  onClickStop: () => void;
  onAutoScrollToggle: () => void;
  autoScrollEnabled: boolean;
  onStartOptionChange: (selectedOption: string) => void;
  onEndOptionChange: (selectedOption: string) => void;
  startSelectedOption: string;
  endSelectedOption: string;
  startOptions: DropdownOptionsInterface;
  endOptions: DropdownOptionsInterface;
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
}: GraphControlsProps) {
  return (
    <div className={styles.container}>
      <div className={styles.playPauseContainer}>
        <div className={styles.graphControlsSVGContainer} onClick={onClickPlay}>
          <PlaySVG />
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

      <div className={styles.autoScrollContainer}>
        <p>Auto-scroll?</p>
        <Checkbox checked={autoScrollEnabled} onChange={onAutoScrollToggle} />
      </div>

      <div className={styles.startEndRules}>
        <Dropdown
          label="Start when"
          onChange={onStartOptionChange}
          options={startOptions}
          selectedOption={startSelectedOption}
        />
        <Dropdown
          label="End when"
          onChange={onEndOptionChange}
          options={endOptions}
          selectedOption={endSelectedOption}
        />
      </div>
    </div>
  );
}
