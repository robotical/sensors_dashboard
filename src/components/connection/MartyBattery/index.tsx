import { useEffect, useRef } from "react";
import { ReactComponent as BatterySVG } from "../../../assets/connect-button/battery.svg";
import {
  SCREENFREE_GREEN,
  SCREENFREE_RED,
  SCREENFREE_YELLOW,
} from "../../../styles/colors";
import styles from "./styles.module.css";

type MartyBatteryProps = {
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

export default function MartyBattery({ batteryStrength }: MartyBatteryProps) {
  const batteryRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (batteryRef.current) {
      const svgStartPath = 3;
      const batteryStrenghtRounded = roundBatteryPerc(batteryStrength);
      const batteryBars = Math.ceil(batteryStrenghtRounded / 20);
      let colour = SCREENFREE_GREEN;
      if (batteryStrenghtRounded <= 10) {
        colour = SCREENFREE_RED;
      } else if (batteryStrenghtRounded > 10 && batteryStrenghtRounded <= 30) {
        colour = SCREENFREE_YELLOW;
      }
      for (let i = 0; i < 5; i++) {
        if (i < batteryBars) {
          batteryRef.current.children[i + svgStartPath].setAttribute(
            "fill",
            colour
          );
        } else {
          batteryRef.current.children[i + svgStartPath].setAttribute(
            "fill",
            "white"
          );
        }
      }
    }
  }, [batteryStrength]);

  return (
    <div className={styles.martyBattContainer}>
      <BatterySVG ref={batteryRef} /> <p className={styles.martyBattPercentage}>{batteryStrength}%</p>
    </div>
  );
}
