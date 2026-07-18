import React, { useId } from "react";
import { Checkbox } from "@mui/material";
import {
  FaChevronDown,
  FaDotCircle,
  FaPause,
  FaPlay,
  FaStop,
} from "react-icons/fa";
import { DropdownOptionsInterface } from "../../utils/start-end-rules/start-end-options";
import Dropdown from "../Dropdown";
import styles from "./styles.module.css";

export type GraphRecordingState =
  | "choose-signals"
  | "ready"
  | "recording"
  | "paused";

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
  recordingState: GraphRecordingState;
  hasData: boolean;
  endConditionReached?: boolean;
  mode?: "all" | "primary" | "advanced";
}

const getStatusCopy = (
  recordingState: GraphRecordingState,
  endConditionReached: boolean
) => {
  if (recordingState === "choose-signals") {
    return {
      title: "Choose signals",
      description: "Select at least one signal to enable recording.",
    };
  }
  if (recordingState === "ready") {
    return {
      title: "Ready to record",
      description: "Your signals are selected. Start when you’re ready.",
    };
  }
  if (recordingState === "recording") {
    return {
      title: "Recording active",
      description:
        "Data appears as readings arrive and the start condition is met.",
    };
  }
  if (endConditionReached) {
    return {
      title: "Recording ended",
      description: "The end condition was met. Reset the graph to record again.",
    };
  }
  return {
    title: "Recording paused",
    description: "Resume to continue this recording, or reset to start over.",
  };
};

function GraphControls({
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
  recordingState,
  hasData,
  endConditionReached = false,
  mode = "all",
}: GraphControlsProps) {
  const reactId = useId();
  const isRecording = recordingState === "recording";
  const canRecord =
    recordingState !== "choose-signals" &&
    !isRecording &&
    !endConditionReached;
  const canPause = isRecording;
  const canReset =
    hasData || recordingState === "recording" || recordingState === "paused";
  const statusCopy = getStatusCopy(recordingState, endConditionReached);
  const recordLabel = recordingState === "paused" ? "Resume" : "Record";
  const statusDescriptionId = `recording-status-${reactId.replace(/:/g, "")}`;
  const showPrimaryControls = mode !== "advanced";
  const showAdvancedSettings = mode !== "primary";
  const sectionLabel =
    mode === "primary"
      ? "Recording controls"
      : mode === "advanced"
        ? "Advanced graph settings"
        : "Recording controls and graph settings";

  return (
    <section className={styles.container} aria-label={sectionLabel}>
      {showPrimaryControls && (
        <div className={styles.primaryBar}>
          <div
            className={styles.statusCopy}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className={styles.statusTitle}>{statusCopy.title}</p>
            <p className={styles.statusDescription} id={statusDescriptionId}>
              {statusCopy.description}
            </p>
          </div>

          <div className={styles.primaryActions}>
            <button
              type="button"
              className={[
                styles.controlButton,
                styles.recordButton,
                isRecording ? styles.controlButtonActive : "",
              ].join(" ")}
              onClick={onClickPlay}
              disabled={!canRecord}
              aria-describedby={statusDescriptionId}
              aria-pressed={isRecording}
            >
              {isRecording ? (
                <FaDotCircle aria-hidden="true" />
              ) : (
                <FaPlay aria-hidden="true" />
              )}
              <span>{isRecording ? "Recording" : recordLabel}</span>
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={onClickPause}
              disabled={!canPause}
              aria-describedby={statusDescriptionId}
            >
              <FaPause aria-hidden="true" />
              <span>Pause</span>
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={onClickStop}
              disabled={!canReset}
              aria-describedby={statusDescriptionId}
            >
              <FaStop aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {showAdvancedSettings && (
        <details className={styles.advancedSettings}>
          <summary className={styles.advancedSummary}>
            <span>
              <strong>Advanced settings</strong>
              <small>Trigger conditions and chart scrolling</small>
            </span>
            <FaChevronDown className={styles.chevron} aria-hidden="true" />
          </summary>

          <div className={styles.advancedContent}>
            <div className={styles.ruleBlock}>
              <div className={styles.blockHeading}>
                <p className={styles.blockLabel}>Trigger conditions</p>
                {isRecording && (
                  <p className={styles.disabledReason} role="note">
                    Pause recording to edit trigger conditions.
                  </p>
                )}
              </div>
              <div className={styles.startEndRules}>
                <Dropdown
                  rule="start"
                  label="Start when"
                  onChange={onStartOptionChange}
                  options={startOptions}
                  selectedOption={startSelectedOption}
                  disabled={isRecording}
                />
                <Dropdown
                  rule="end"
                  label="End when"
                  onChange={onEndOptionChange}
                  options={endOptions}
                  selectedOption={endSelectedOption}
                  disabled={isRecording}
                />
              </div>
            </div>

            <label className={styles.autoScrollContainer}>
              <span>
                <strong>Keep latest data in view</strong>
                <small>
                  Automatically follow new readings along the time axis.
                </small>
              </span>
              <Checkbox
                checked={autoScrollEnabled}
                onChange={onAutoScrollToggle}
                inputProps={{ "aria-label": "Keep latest data in view" }}
              />
            </label>
          </div>
        </details>
      )}
    </section>
  );
}

export default React.memo(GraphControls);
