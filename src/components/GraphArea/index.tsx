import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ListenerOptionsType } from "../../app-bridge/EventDispatcher";
import { MartyInterface } from "../../app-bridge/MartyInterface";
import Addon from "../../models/addons/Addon";
import getAllAddonsList from "../../utils/get-addons-list";
import { isRuleMet } from "../../utils/start-end-rules/decider";
import {
  DropdownOptionsInterface,
  getRuleOptions,
} from "../../utils/start-end-rules/start-end-options";
import AddonsList from "../AddonsList";
import Graph from "../Graph";
import GraphControls, { type GraphRecordingState } from "../GraphControls";
import styles from "./styles.module.css";
import { getCSVTitle, prepareCSVData, prepareTitles } from "../../utils/export-csv";
import { FaTimes, FaFileCsv } from "react-icons/fa";
import Tooltip from "@mui/material/Tooltip";
import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";
import RaftInterface from "../../app-bridge/RaftInterface";
import { RaftTypeE } from "@robotical/webapp-types/dist-types/src/types/raft";
import Marty from "@robotical/webapp-types/dist-types/src/application/RAFTs/Marty/Marty";
import CogInterface from "../../app-bridge/CogInterface";
import Cog from "@robotical/webapp-types/dist-types/src/application/RAFTs/Cog/Cog";
import MockMartyInterface from "../../app-bridge/mocks/MockMartyInterface";
import MockCogInterface from "../../app-bridge/mocks/MockCogInterface";
import { isMockRaft } from "../../mock/MockApplicationManager";
import { preserveAddonSelections } from "../../utils/addon-selection";
import MicroBitInterface from "../../app-bridge/MicroBitInterface";
import MicroBitWebBluetooth, {
  isMicroBitDevice,
} from "../../microbit/MicroBitWebBluetooth";

const hasAddonProvider = (
  raftInterface: RaftInterface
): raftInterface is RaftInterface & { getAvailableAddons: () => Addon[] } =>
  typeof (raftInterface as unknown as { getAvailableAddons?: () => Addon[] }).getAvailableAddons ===
  "function";

interface GraphAreaProps {
  graphId: string;
  raft: RAFT | MicroBitWebBluetooth;
  deviceName: string;
  removeGraph: (graphId: string) => void;
  mainRef: React.RefObject<HTMLDivElement>;
}

export interface TraceData {
  x: number[];
  y: number[];
}

export type TraceIdType = `${string}=>${string}`;
export type GraphDataType = {
  [traceTitle: TraceIdType]: TraceData;
};

function GraphArea({ graphId, removeGraph, mainRef, raft, deviceName }: GraphAreaProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [, setRefreshGraphArea] = useState(0);
  const [refreshAddons, setRefreshAddons] = useState(0);
  const [refreshAddonsList, setRefreshAddonsList] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const graphData = useRef<GraphDataType>({});
  const maxDataXValue = useRef<number>(0);
  const isTracking = useRef<boolean>(false);
  const hasSessionStarted = useRef<boolean>(false);
  const hasStartRuleMet = useRef<boolean>(false);
  const hasEndRuleMet = useRef<boolean>(false);
  const startSelectedOption = useRef<DropdownOptionsInterface | undefined>(undefined);
  const endSelectedOption = useRef<DropdownOptionsInterface | undefined>(undefined);
  const startOptions = useRef<DropdownOptionsInterface[]>([]);
  const endOptions = useRef<DropdownOptionsInterface[]>([]);
  const startDisplayingTime = useRef<number | null>(null);

  const [raftInterface, setRaftInterface] = useState<RaftInterface | null>(null);
  const chartPanelRef = useRef<HTMLDivElement>(null);
  const latestAddons = useRef<Addon[]>([]);
  const reactId = useId();
  const statusId = `graph-status-${reactId.replace(/:/g, "")}`;
  const csvHintId = `graph-csv-hint-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    let interfaceInstance: RaftInterface | null = null;
    if (isMicroBitDevice(raft)) {
      interfaceInstance = new MicroBitInterface(raft);
    } else if (isMockRaft(raft)) {
      if (raft.type === RaftTypeE.COG) {
        const mockCog = new MockCogInterface();
        mockCog.start();
        interfaceInstance = mockCog;
      } else {
        const mockMarty = new MockMartyInterface();
        mockMarty.start();
        interfaceInstance = mockMarty;
      }
    } else if (raft.type === RaftTypeE.COG) {
      interfaceInstance = new CogInterface(raft as Cog);
    } else if (raft.type === RaftTypeE.MARTY) {
      interfaceInstance = new MartyInterface(raft as Marty);
    }
    setRaftInterface(interfaceInstance);

    return () => {
      interfaceInstance?.unsubscribeFromPublishedData();
    };
  }, [raft]);

  const cleanupStartEndRules = useCallback(() => {
    startSelectedOption.current?.[4]?.(); // cleanup rule
    endSelectedOption.current?.[4]?.(); // cleanup rule
  }, []);

  const onSelectAddon = useCallback(() => {
    if (!hasSelectedSignal(latestAddons.current)) {
      isTracking.current = false;
    }
    setRefreshAddons((oldVal) => oldVal + 1);
  }, []);

  const addSelectedListener = useCallback((addonsArr: Addon[]) => {
    for (const addon of addonsArr) {
      for (const addonInput of addon.addonInputs) {
        addonInput.setSelectedListener(onSelectAddon);
      }
    }
  }, [onSelectAddon]);

  const onAddonChange = useCallback((evt: ListenerOptionsType) => {
    /* for the following if's, order matters */
    if (!isTracking.current) return;
    if (!startSelectedOption.current || !endSelectedOption.current) return;
    // decide whether or not to start based on start/end rules
    if (!hasStartRuleMet.current && !isRuleMet(evt, startSelectedOption.current)) return;
    hasStartRuleMet.current = true;
    if (hasEndRuleMet.current || isRuleMet(evt, endSelectedOption.current)) {
      hasEndRuleMet.current = true;
      isTracking.current = false;
      setRefreshGraphArea((old) => old + 1);
      return;
    }

    if (!startDisplayingTime.current) {
      startDisplayingTime.current = new Date().getTime();
    }

    maxDataXValue.current = getMaxDataXValue(graphData.current);
    const traceId: TraceIdType = `${evt.whoAmI}=>${evt.addonInput}`;
    const newTimestamp = (new Date().getTime() - startDisplayingTime.current) / 1000;
    if (graphData.current.hasOwnProperty(traceId)) {
      graphData.current[traceId].x.push(
        +newTimestamp.toFixed(2)
      );
      graphData.current[traceId].y.push(evt.value!);
    } else {
      graphData.current[traceId] = {
        x: [+newTimestamp.toFixed(2)],
        y: [evt.value!],
      };
    }
    setRefreshGraphArea((old) => old + 1);
  }, []);

  const addAddonsListeners = useCallback((addns: Addon[]) => {
    for (const addon of addns) {
      for (const addonInput of addon.addonInputs) {
        if (addonInput.selected) {
          raftInterface?.addEventListener(
            `on${addon.whoAmI + "=>" + addonInput.name}Change`,
            graphId,
            onAddonChange
          );
        } else {
          raftInterface?.removeEventListener(
            `on${addon.whoAmI + "=>" + addonInput.name}Change`,
            graphId,
            onAddonChange
          );
        }
      }
    }
  }, [raftInterface, graphId, onAddonChange]);

  const removeAddonsListeners = useCallback((addns: Addon[]) => {
    for (const addon of addns) {
      for (const addonInput of addon.addonInputs) {
        raftInterface?.removeEventListener(
          `on${addon.whoAmI + "=>" + addonInput.name}Change`,
          graphId,
          onAddonChange
        );
      }
    }
  }, [raftInterface, graphId, onAddonChange]);

  const onAddonsChange = useCallback(() => {
    setRefreshAddons((oldV) => oldV + 1);
    setRefreshAddonsList((oldV) => oldV + 1);
  }, []);

  useEffect(() => {
    raftInterface?.addEventListener(
      "onAddonsChange",
      "",
      onAddonsChange
    );
    return () => {
      raftInterface?.removeEventListener(
        "onAddonsChange",
        "",
        onAddonsChange
      );
    };
  }, [raftInterface, onAddonsChange]);

  useEffect(() => {
    if (!raftInterface) return;
    const normalisedAddons =
      hasAddonProvider(raftInterface)
        ? raftInterface.getAvailableAddons()
        : getAllAddonsList(raft as RAFT);
    const addonsWithSelections = preserveAddonSelections(normalisedAddons, latestAddons.current);
    addSelectedListener(addonsWithSelections);
    latestAddons.current = addonsWithSelections;
    setAddons(addonsWithSelections);
  }, [addSelectedListener, refreshAddonsList, raftInterface, raft]);

  useEffect(() => {
    removeAddonsListeners(addons);
    addAddonsListeners(addons);
    const startOpts = getRuleOptions(addons, "start");
    startOptions.current = startOpts;
    startSelectedOption.current = startOpts.filter(opt => opt[1] === "default")[0];
    const endOpts = getRuleOptions(addons, "end");
    endOptions.current = endOpts;
    endSelectedOption.current = endOpts.filter(opt => opt[1] === "default")[0];
    setRefreshGraphArea((oldV) => oldV + 1);
    return () => {
      removeAddonsListeners(addons);
      cleanupStartEndRules();
    };
  }, [addAddonsListeners, addons, cleanupStartEndRules, refreshAddons, removeAddonsListeners]);

  const stopHandler = useCallback(() => {
    isTracking.current = false;
    hasSessionStarted.current = false;
    for (const traceKey in graphData.current) {
      delete graphData.current[traceKey as TraceIdType];
    }
    maxDataXValue.current = 0;
    hasStartRuleMet.current = false;
    cleanupStartEndRules();
    hasEndRuleMet.current = false;
    startDisplayingTime.current = null;
    setRefreshGraphArea((old) => old + 1);
  }, [cleanupStartEndRules]);

  const setIsTracking = useCallback((value: boolean) => {
    if (value && (!hasSelectedSignal(addons) || hasEndRuleMet.current)) return;
    if (value) {
      hasSessionStarted.current = true;
    }
    isTracking.current = value;
    setRefreshGraphArea((old) => old + 1);
  }, [addons]);

  const startHandler = useCallback(() => {
    setIsTracking(true);
  }, [setIsTracking]);

  const pauseHandler = useCallback(() => {
    setIsTracking(false);
  }, [setIsTracking]);

  const autoScrollHandler = useCallback(() => {
    setAutoScrollEnabled((oldValue) => !oldValue);
  }, []);

  const onRuleOptionChange = useCallback((selectedOption: DropdownOptionsInterface, rule: "start" | "end") => {
    if (isTracking.current) return; // changing rule won't affect graph if it's currently traking 
    cleanupStartEndRules();
    if (rule === "start") {
      startSelectedOption.current = selectedOption;
    } else {
      endSelectedOption.current = selectedOption;
    }
    setRefreshGraphArea((old) => old + 1);
  }, [cleanupStartEndRules]);

  const exportCsvHandler = useCallback(async () => {
    const preparedCsvData = await prepareCSVData(graphData.current);
    const titles = prepareTitles(graphData.current, "Time (s)");
    const csvContent = [titles, ...preparedCsvData]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = getCSVTitle(graphData.current);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  }, []);

  const currentStartSelectedOption = startSelectedOption.current;
  const currentEndSelectedOption = endSelectedOption.current;
  const currentStartOptions = startOptions.current;
  const currentEndOptions = endOptions.current;
  const selectedSignalCount = getSelectedSignalCount(addons);
  const hasData = hasGraphData(graphData.current);
  const recordingState: GraphRecordingState =
    selectedSignalCount === 0
      ? "choose-signals"
      : isTracking.current
        ? "recording"
        : hasSessionStarted.current
          ? "paused"
          : "ready";
  const statusLabel = {
    "choose-signals": "Choose signals",
    ready: "Ready",
    recording: "Recording",
    paused: "Paused",
  }[recordingState];
  const statusBadgeClassName = [
    styles.statusBadge,
    recordingState === "recording"
      ? styles.statusLive
      : recordingState === "ready"
        ? styles.statusReady
        : recordingState === "paused"
          ? styles.statusPaused
          : styles.statusChoose,
  ].join(" ");
  const emptyChartMessage =
    recordingState === "choose-signals"
      ? "Choose at least one signal to begin."
      : recordingState === "ready"
        ? "Ready when you are. Press Record to start plotting data."
        : recordingState === "recording"
          ? "Waiting for the first sensor reading…"
          : "No readings have been captured yet. Resume when you’re ready.";
  const graphControlsProps = {
    onClickPlay: startHandler,
    onClickPause: pauseHandler,
    onClickStop: stopHandler,
    onAutoScrollToggle: autoScrollHandler,
    autoScrollEnabled,
    onStartOptionChange: onRuleOptionChange,
    onEndOptionChange: onRuleOptionChange,
    startSelectedOption: currentStartSelectedOption,
    endSelectedOption: currentEndSelectedOption,
    startOptions: currentStartOptions,
    endOptions: currentEndOptions,
    recordingState,
    hasData,
    endConditionReached: hasEndRuleMet.current,
  };

  return (
    <section
      className={styles.graphCard}
      aria-label={`Sensor graph for ${deviceName}`}
    >
      <header className={styles.graphHeader}>
        <div className={styles.graphHeading}>
          <p className={styles.graphEyebrow}>Live data</p>
          <h2 className={styles.graphTitle}>Sensor graph — {deviceName}</h2>
        </div>
        <div className={styles.graphHeaderActions}>
          <span
            className={statusBadgeClassName}
            id={statusId}
          >
            {statusLabel}
          </span>
          <Tooltip
            title={
              hasData
                ? "Export recorded data to CSV"
                : "Record some data before exporting a CSV"
            }
          >
            <span className={styles.iconButtonWrapper}>
              <button
                type="button"
                onClick={exportCsvHandler}
                className={styles.iconButton}
                disabled={!hasData}
                aria-describedby={!hasData ? csvHintId : undefined}
              >
                <FaFileCsv aria-hidden="true" />
                <span>CSV</span>
              </button>
            </span>
          </Tooltip>
          {!hasData && (
            <span className={styles.visuallyHidden} id={csvHintId}>
              CSV export becomes available after sensor data has been recorded.
            </span>
          )}
          <Tooltip title="Close graph">
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => removeGraph(graphId)}
              aria-label="Close graph"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </header>

      <div className={styles.graphBody}>
        <div className={styles.chartPanel} ref={chartPanelRef}>
          <GraphControls {...graphControlsProps} mode="primary" />
          <div className={styles.chartFrame}>
            <Graph
              mainRef={mainRef}
              data={graphData.current}
              maxDataXValue={maxDataXValue.current}
              autoScrollEnabled={autoScrollEnabled}
              containerRef={chartPanelRef}
            />
            {!hasData && (
              <p className={styles.emptyChartMessage}>{emptyChartMessage}</p>
            )}
          </div>
          <GraphControls {...graphControlsProps} mode="advanced" />
        </div>

        <aside className={styles.sidebar} aria-labelledby={`${statusId}-signals`}>
          <div className={styles.sidebarHeader}>
            <h3 id={`${statusId}-signals`}>Select signals</h3>
            <p>
              Choose the data streams you want to visualise in this graph.
            </p>
          </div>
          <AddonsList addons={addons} />
        </aside>
      </div>
    </section>
  );
}


const getMaxDataXValue = (data: GraphDataType) => {
  let mxDataXValue = 1;
  for (const traceKey in data) {
    const currLen = data[traceKey as TraceIdType].x.length;
    if (data[traceKey as TraceIdType].x[currLen - 1] > mxDataXValue)
      mxDataXValue = data[traceKey as TraceIdType].x[currLen - 1];
  }
  return mxDataXValue;
};

const getSelectedSignalCount = (addons: Addon[]) =>
  addons.reduce(
    (count, addon) =>
      count +
      addon.addonInputs.reduce(
        (addonCount, input) => addonCount + (input.selected ? 1 : 0),
        0
      ),
    0
  );

const hasSelectedSignal = (addons: Addon[]) =>
  getSelectedSignalCount(addons) > 0;

const hasGraphData = (data: GraphDataType) =>
  Object.values(data).some((trace) => trace.x.length > 0);

export default GraphArea;
