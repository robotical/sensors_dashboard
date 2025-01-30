import { useEffect, useRef } from "react";
import { ReactComponent as BatterySVG } from "../../../assets/connect-button/battery.svg";
import { ReactComponent as PowerPlugSVG } from "../../../assets/connect-button/power-plug.svg";
import styles from "./styles.module.css";
import { SCREENFREE_GREEN, SCREENFREE_RED, SCREENFREE_YELLOW } from "../../../styles/colors";

type RaftBatteryProps = {
  batteryStrength: number;
};
const roundBatteryPerc = (battLevel: number) => {
  let roundedBattery = battLevel;
  if (battLevel <= 90 && battLevel >= 71) roundedBattery = 80;
  if (battLevel <= 70 && battLevel >= 51) roundedBattery = 60;
  if (battLevel <= 50 && battLevel >= 31) roundedBattery = 40;
  if (battLevel <= 30 && battLevel >= 11) roundedBattery = 20;
  return roundedBattery;
};

export default function RaftBattery({ batteryStrength }: RaftBatteryProps) {
  const batteryRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (batteryRef.current) {
      const batteryStrenghtRounded = roundBatteryPerc(batteryStrength);
      const batteryBars = Math.ceil(batteryStrenghtRounded / 20);
      const svgRects = batteryRef.current.getElementsByTagName("rect");
      let colour = SCREENFREE_GREEN;
      if (batteryStrength <= 10) {
        colour = SCREENFREE_RED;
      } else if (batteryStrength > 10 && batteryStrength <= 35) {
        colour = SCREENFREE_YELLOW;
      }
      for (let i = 0; i < 5; i++) {
        if (i < batteryBars) {
          svgRects[i].setAttribute(
            "fill",
            colour
          );
        } else {
          svgRects[i].setAttribute(
            "fill",
            "#d1d3d4"
          );
        }
      }
    }
  }, [batteryStrength]);

  return (
    <div className={styles.martyBattContainer}>
      {
        batteryStrength === 0 ? <> <p className={styles.martyBattPercentage}></p> <PowerPlugSVG /></> :
          <><BatterySVG ref={batteryRef} /><p className={styles.martyBattPercentage}>{batteryStrength}%</p></>
      }
    </div>
  );
}