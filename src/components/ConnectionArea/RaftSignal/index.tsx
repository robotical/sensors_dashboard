import { useEffect, useRef } from "react";
import { ReactComponent as EmptySignalSVG } from "../../../assets/connect-button/empty-signal.svg";
import rescale from "../../../utils/rescale-range";
import { SCREENFREE_GREEN, SCREENFREE_YELLOW } from "../../../styles/colors";
import RAFT from "@robotical/webapp-types/dist-types/src/application/RAFTs/RAFT";

type RaftSignalProps = {
  signalStrength: number;
  connectedRaft?: RAFT;
};

export default function RaftSignal({ signalStrength, connectedRaft }: RaftSignalProps) {
  const signalRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (signalRef.current) {
      const signalRaw = (-50 / signalStrength) * 100;
      const signalScaled = rescale(signalRaw, 50, 100, 0, 100);
      const signalBars = signalScaled / 20;
      const colour = signalBars <= 3 ? SCREENFREE_YELLOW : SCREENFREE_GREEN;
      const svgStartPath = 9;
      for (let i = 0; i < 5; i++) {
        if (i < signalBars) {
          signalRef.current.children[svgStartPath - i].setAttribute(
            "fill",
            colour
          );
        } else {
          signalRef.current.children[svgStartPath - i].setAttribute(
            "fill",
            "white"
          );
        }
      }
    }
  }, [signalStrength]);

  return <EmptySignalSVG ref={signalRef} width={"100%"} />

}
