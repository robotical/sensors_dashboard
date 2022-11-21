import { useEffect, useRef, useState } from "react";
import { EventType } from "../../app-bridge/EventDispatcher";
import mv2Dashboard from "../../app-bridge/mv2-rn";
import Addon from "../../models/addons/Addon";
import getAllAddonsList from "../../utils/get-addons-list";
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

export interface GraphDataType {
  [traceTitle: string]: TraceData;
}

export default function GraphArea({ graphId, removeGraph }: GraphAreaProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [refreshGraphArea, setRefreshGraphArea] = useState(0);
  const graphData = useRef<GraphDataType>({});

  useEffect(() => {
    const normalisedAddons = getAllAddonsList(
      mv2Dashboard.addons,
      mv2Dashboard.servos!,
      mv2Dashboard.accel!
    );
    addSelectedListener(normalisedAddons, setRefreshGraphArea);
    setAddons(normalisedAddons);
  }, []);

  useEffect(() => {
    console.log("adding listeners");
    removeAddonsListeners(addons);
    addAddonsListeners(addons);
    return () => {
      removeAddonsListeners(addons);
    };
  }, [refreshGraphArea]);

  const addSelectedListener = (
    addonsArr: Addon[],
    listener: React.Dispatch<React.SetStateAction<number>>
  ) => {
    for (const addon of addonsArr) {
      for (const addonInput of addon.addonInputs) {
        addonInput.setSelectedListener(listener);
      }
    }
  };

  const addAddonsListeners = (addns: Addon[]) => {
    for (const addon of addns) {
      for (const addonInput of addon.addonInputs) {
        if (addonInput.selected) {
          mv2Dashboard.addEventListener(
            `on${addonInput.name}Change`,
            graphId,
            onAddonChange
          );
        } else {
          mv2Dashboard.removeEventListener(
            `on${addonInput.name}Change`,
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
          `on${addonInput.name}Change`,
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
    let maxDataLen = 1;
    for(const traceKey in graphData.current) {
      if (graphData.current[traceKey].x.length > 0) maxDataLen = graphData.current[traceKey].x.length;
    }
    console.log(maxDataLen, 'index.tsx', 'line: ', '101');

    if (graphData.current.hasOwnProperty(evt.type)) {
      graphData.current[evt.type].x.push(graphData.current[evt.type].x[graphData.current[evt.type].x.length-1]+1);
      graphData.current[evt.type].y.push(evt.value);
    } else {
      graphData.current[evt.type] = {
        x: [maxDataLen],
        y: [evt.value],
      };
    }
    setRefreshGraphArea(old=> old+1);
  };

  return (
    <div className={styles.graphArea}>
      <AddonsList addons={addons} />
      <Graph data={graphData.current} />
      <GraphControls />
      <div onClick={() => removeGraph(graphId)}>X</div>
    </div>
  );
}
