import React from "react";
import styles from "./styles.module.css";
import { Checkbox, Tooltip } from "@mui/material";
import Dropdown from "../Dropdown";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";
import { FaSort, FaPlay, FaPause, FaStop, FaDotCircle } from "react-icons/fa";

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

const GraphControls = React.memo(({
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
}: GraphControlsProps) => {
  console.log("rendering controls");
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

      <Tooltip title="Automatically scroll on the x-axis as new data arrives, keeping the most recent data in view.">
        <div className={styles.autoScrollContainer}
        >
          <p>Auto-scroll</p>
          <FaSort />
          <Checkbox checked={autoScrollEnabled} onChange={onAutoScrollToggle} />
        </div>
      </Tooltip>

      <div className={styles.playPauseContainer}>
        <div className={styles.graphControlsSVGContainer} onClick={onClickPlay}>
          {isTracking ? <FaDotCircle /> : <FaPlay />}
        </div>
        <div
          className={styles.graphControlsSVGContainer}
          onClick={onClickPause}
        >
          <FaPause />
        </div>

        <div className={styles.graphControlsSVGContainer} onClick={onClickStop}>
          <FaStop />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.autoScrollEnabled === nextProps.autoScrollEnabled &&
    prevProps.startSelectedOption === nextProps.startSelectedOption &&
    prevProps.endSelectedOption === nextProps.endSelectedOption &&
    prevProps.startOptions === nextProps.startOptions &&
    prevProps.endOptions === nextProps.endOptions &&
    prevProps.isTracking === nextProps.isTracking
  );
});

export default GraphControls;
