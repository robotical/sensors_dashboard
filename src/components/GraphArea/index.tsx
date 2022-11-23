import { useEffect, useRef, useState } from "react";
import { EventType } from "../../app-bridge/EventDispatcher";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import Addon from "../../models/addons/Addon";
import getAllAddonsList from "../../utils/get-addons-list";
import { isEndRuleMet, isStartRuleMet } from "../../utils/start-end-rules/decider";
import {
  DropdownOptionsInterface,
  getEndOptions,
  getStartOptions,
} from "../../utils/start-end-rules/start-end-options";
import AddonsList from "../AddonsList";
import Graph from "../Graph";
import GraphControls from "../GraphControls";
import styles from "./styles.module.css";

interface GraphAreaProps {
  graphId: string;
  removeGraph: (graphId: string) => void;
}

export interface TraceData {
  x: number[];
  y: number[];
}

export type GraphDataType = {
  [traceTitle: string]: TraceData;
};

export default function GraphArea({ graphId, removeGraph }: GraphAreaProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [refreshGraphArea, setRefreshGraphArea] = useState(0);
  const [refreshAddons, setRefreshAddons] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const graphData = useRef<GraphDataType>({});
  const maxDataLen = useRef<number>(0);
  const isTracking = useRef<boolean>(false);
  const hasStartRuleMet = useRef<boolean>(false);
  const hasEndRuleMet = useRef<boolean>(false);
  const startSelectedOption = useRef<string>("");
  const endSelectedOption = useRef<string>("");
  const startOptions = useRef<DropdownOptionsInterface>({});
  const endOptions = useRef<DropdownOptionsInterface>({});

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
    const startOpts = getStartOptions(addons);
    startOptions.current = startOpts;
    startSelectedOption.current = "=>"+startOpts[""][0];
    const endOpts = getEndOptions(addons);
    endOptions.current = endOpts;
    endSelectedOption.current = endOpts[""][0];
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
            `on${addon.name+"=>"+addonInput.name}Change`,
            graphId,
            onAddonChange
          );
        } else {
          mv2Dashboard.removeEventListener(
            `on${addon.name+"=>"+addonInput.name}Change`,
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
          `on${addon.name+"=>"+addonInput.name}Change`,
          graphId,
          onAddonChange
        );
      }
    }
  };

  const onAddonChange = (evt: {
    type: EventType;
    [key: string]: any;
    subtype: string;
  }) => {
    /* for the following if's, order matters */
    if (!isTracking.current) return;
    // decide whether or not to start based on start/end rules
    if (!hasStartRuleMet.current && !isStartRuleMet(evt, startSelectedOption.current)) return;
    hasStartRuleMet.current = true;
    if (hasEndRuleMet.current || isEndRuleMet(evt, endSelectedOption.current)) {
      hasEndRuleMet.current = true;
      return;
    }
    let mxDataLen = 1;
    for (const traceKey in graphData.current) {
      if (graphData.current[traceKey].x.length > 0)
        mxDataLen = graphData.current[traceKey].x.length;
    }
    maxDataLen.current = mxDataLen;

    if (graphData.current.hasOwnProperty(evt.type)) {
      graphData.current[evt.type].x.push(
        graphData.current[evt.type].x[
          graphData.current[evt.type].x.length - 1
        ] + 1
      );
      graphData.current[evt.type].y.push(evt.value);
    } else {
      graphData.current[evt.type] = {
        x: [mxDataLen],
        y: [evt.value],
      };
    }
    setRefreshGraphArea((old) => old + 1);
  };

  const stopHandler = () => {
    isTracking.current = false;
    for (const traceKey in graphData.current) {
      delete graphData.current[traceKey];
    }
    maxDataLen.current = 0;
    setRefreshGraphArea((old) => old + 1);
  };

  const setIsTracking = (value: boolean) => {
    isTracking.current = value;
    setRefreshGraphArea((old) => old + 1);
  };

  const onStartOptionChange = (selectedOption: string) => {
    if (isTracking.current) return; // changing rule won't affect graph if it's currently traking 
    startSelectedOption.current = selectedOption;
    setRefreshGraphArea((old) => old + 1);
  };

  const onEndOptionChange = (selectedOption: string) => {
    if (isTracking.current) return; // changing rule won't affect graph if it's currently traking 
    endSelectedOption.current = selectedOption;
    setRefreshGraphArea((old) => old + 1);
  };

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
        onStartOptionChange={onStartOptionChange}
        onEndOptionChange={onEndOptionChange}
        startSelectedOption={startSelectedOption.current}
        endSelectedOption={endSelectedOption.current}
        startOptions={startOptions.current}
        endOptions={endOptions.current}
      />
      <div className={styles.closeGraph} onClick={() => removeGraph(graphId)}>
        X
      </div>
    </div>
  );
}
