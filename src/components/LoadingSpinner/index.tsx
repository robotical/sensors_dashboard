import { useEffect, useRef } from "react";
import styles from "./styles.module.css";

type LoadingSpinnerProps = {
  colourA?: string;
  colourB?: string;
};

export default function LoadingSpinner({
  colourA,
  colourB,
}: LoadingSpinnerProps) {
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spinnerRef.current) {
      if (colourA) {
        spinnerRef.current.style.setProperty("--border-colour", colourA);
      }
      if (colourB) {
        spinnerRef.current.style.setProperty("--border-colour", colourB);
      }
    }
  }, []);
  return (
    <div className={styles.loadingSpinnerContainer}>
      <div className={styles.loadingSpinner} ref={spinnerRef}></div>
    </div>
  );
}
