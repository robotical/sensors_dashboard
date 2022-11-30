import { useEffect, useRef, useState } from "react";
import { ListenerOptionsType } from "../../app-bridge/EventDispatcher";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import Addon from "../../models/addons/Addon";
import getAllAddonsList from "../../utils/get-addons-list";
import { isRuleMet } from "../../utils/start-end-rules/decider";
import {
  DropdownOptionsInterface,
  getRuleOptions,
} from "../../utils/start-end-rules/start-end-options";
import AddonsList from "../AddonsList";
import Graph from "../Graph";
import GraphControls from "../GraphControls";
import styles from "./styles.module.css";
import { CSVLink } from "react-csv";

interface GraphAreaProps {
  graphId: string;
  removeGraph: (graphId: string) => void;
}

export interface TraceData {
  x: number[];
  y: number[];
}

export type TraceIdType = `${string}=>${string}`;
export type GraphDataType = {
  [traceTitle: TraceIdType]: TraceData;
};

type CsvData = string[][];

export default function GraphArea({ graphId, removeGraph }: GraphAreaProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [refreshGraphArea, setRefreshGraphArea] = useState(0);
  const [refreshAddons, setRefreshAddons] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [csvData, setCsvData] = useState<CsvData>([]);
  const graphData = useRef<GraphDataType>({});
  const maxDataLen = useRef<number>(0);
  const isTracking = useRef<boolean>(false);
  const hasStartRuleMet = useRef<boolean>(false);
  const hasEndRuleMet = useRef<boolean>(false);
  const startSelectedOption = useRef<DropdownOptionsInterface>([] as unknown as DropdownOptionsInterface);
  const endSelectedOption = useRef<DropdownOptionsInterface>([] as unknown as DropdownOptionsInterface);
  const startOptions = useRef<DropdownOptionsInterface[]>([]);
  const endOptions = useRef<DropdownOptionsInterface[]>([]);
  const startDisplayingTime = useRef<number | null>(null);

  useEffect(() => {
    const normalisedAddons = getAllAddonsList(
      mv2Dashboard.addons,
      mv2Dashboard.servos!,
      mv2Dashboard.accel!
    );
    addSelectedListener(normalisedAddons);
    setAddons(normalisedAddons);
  }, []);

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
    };
  }, [refreshAddons]);

  const addSelectedListener = (addonsArr: Addon[]) => {
    for (const addon of addonsArr) {
      for (const addonInput of addon.addonInputs) {
        addonInput.setSelectedListener(onSelectAddon);
      }
    }
  };

  const onSelectAddon = () => {
    setRefreshAddons((oldVal) => oldVal + 1);
  };

  const addAddonsListeners = (addns: Addon[]) => {
    for (const addon of addns) {
      for (const addonInput of addon.addonInputs) {
        if (addonInput.selected) {
          mv2Dashboard.addEventListener(
            `on${addon.whoAmI+"=>"+addonInput.name}Change`,
            graphId,
            onAddonChange
          );
        } else {
          mv2Dashboard.removeEventListener(
            `on${addon.whoAmI+"=>"+addonInput.name}Change`,
            graphId,
            onAddonChange
          );
        }
      }
    }
  };

  const removeAddonsListeners = (addns: Addon[]) => {
    for (const addon of addns) {
      for (const addonInput of addon.addonInputs) {
        mv2Dashboard.removeEventListener(
          `on${addon.whoAmI+"=>"+addonInput.name}Change`,
          graphId,
          onAddonChange
        );
      }
    }
  };

  const onAddonChange = (evt: ListenerOptionsType) => {
    /* for the following if's, order matters */
    if (!isTracking.current) return;
    if (!startSelectedOption.current || !endSelectedOption.current) return;
    // decide whether or not to start based on start/end rules
    if (!hasStartRuleMet.current && !isRuleMet(evt, startSelectedOption.current)) return;
    hasStartRuleMet.current = true;
    if (hasEndRuleMet.current || isRuleMet(evt, endSelectedOption.current)) {
      hasEndRuleMet.current = true;
      return;
    }

    if (!startDisplayingTime.current)  {
      startDisplayingTime.current = new Date().getTime();
    }
    
    maxDataLen.current = getMaxDataLen(graphData.current);
    const traceId:TraceIdType = `${evt.whoAmI}=>${evt.addonInput}`;
    const newTimestamp =  (new Date().getTime() -startDisplayingTime.current) / 1000;
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
  };

  const stopHandler = () => {
    isTracking.current = false;
    for (const traceKey in graphData.current) {
      delete graphData.current[traceKey as TraceIdType];
    }
    maxDataLen.current = 0;
    hasStartRuleMet.current = false;
    hasEndRuleMet.current = false;
    startDisplayingTime.current = null;
    setRefreshGraphArea((old) => old + 1);
  };

  const setIsTracking = (value: boolean) => {
    // if there are no selected addons do nothing;
    let isAnyAddonSelected = false;
    for (const addon of addons) {
      for (const addonInput of addon.addonInputs) {
        if (addonInput.selected) {
          isAnyAddonSelected = true;
          break;
        }
      }
    }
    if (!isAnyAddonSelected) return;
    isTracking.current = value;
    setRefreshGraphArea((old) => old + 1);
  };

  const onRuleOptionChange = (selectedOption: DropdownOptionsInterface, rule: "start" | "end") => {
    if (isTracking.current) return; // changing rule won't affect graph if it's currently traking 
    if (rule === "start") {
      startSelectedOption.current = selectedOption;
    } else {
      endSelectedOption.current = selectedOption;
    }
    setRefreshGraphArea((old) => old + 1);
  };

  const exportCsvHandler = () => {
    // transform graph data to csv data
    const csvLines: CsvData = [];
    for (const traceKey in graphData.current) {
      csvLines.push(traceKey.split("=>"));
      csvLines.push(["x", "y"]);
      for (let i = 0; i < graphData.current[traceKey as TraceIdType].x.length; i++) {
        csvLines.push([graphData.current[traceKey as TraceIdType].x[i].toString(), graphData.current[traceKey as TraceIdType].y[i].toString()]);
      }
  }
  setCsvData(csvLines);
  return true;
}

  return (
    <div className={styles.graphArea}>
      <AddonsList addons={addons} />
      <Graph
        data={graphData.current}
        maxDataLen={maxDataLen.current}
        autoScrollEnabled={autoScrollEnabled}
      />
      <GraphControls
        onClickPlay={() => setIsTracking(true)}
        onClickPause={() => setIsTracking(false)}
        onClickStop={stopHandler}
        onAutoScrollToggle={() => setAutoScrollEnabled((oldVal) => !oldVal)}
        autoScrollEnabled={autoScrollEnabled}
        onStartOptionChange={onRuleOptionChange}
        onEndOptionChange={onRuleOptionChange}
        startSelectedOption={startSelectedOption.current}
        endSelectedOption={endSelectedOption.current}
        startOptions={startOptions.current}
        endOptions={endOptions.current}
        isTracking={isTracking.current}
      />
      <div className={styles.rightPanel}>
        <div className={styles.closeGraph} onClick={() => removeGraph(graphId)}>
          X
        </div>
        <CSVLink data={csvData} onClick={exportCsvHandler}>Export CSV</CSVLink>
      </div>
    </div>
  );
}


const getMaxDataLen = (data: GraphDataType) => {
  let mxDataLen = 1;
  for (const traceKey in data) {
    if (data[traceKey as TraceIdType].x.length > mxDataLen)
      mxDataLen = data[traceKey as TraceIdType].x.length;
  }
  return mxDataLen;
}