import modalState from "../../../state-observables/modal/ModalState";
import styles from "./styles.module.css";

export default function HowToUseModal() {
  return (
    <div className={styles.howToUseModalContainer}>
      <p className={styles.howToUseModalTextTitle}>
        Introduction
      </p>
      <p className={styles.howToUseModalTextParagraph}>
        Welcome to the dashboard – your go-to tool for visualizing data from Marty's sensors!
      </p>

      <p className={styles.howToUseModalTextParagraph}>
      Upon connecting to your Marty, you'll see an empty graph appear. On the left side, there's a list of sensors. Each sensor can be expanded to reveal its input streams. For instance, the color sensor has four input streams: Red, Green, Blue, and Clear. To add another graph, you will need to click on the button in the top right corner of the screen. This will create a new, empty graph for you to customize and configure with the input streams from the available sensors.      </p>

      <p className={styles.howToUseModalTextTitle}>Recording Data</p>
      <p className={styles.howToUseModalTextParagraph}>
        To start capturing data, simply select at least one input stream and hit the Play button on the bottom left of the graph. A round, black shape will pop up, signaling that you're now recording data live! The data will be plotted on the graph as it flows from Marty.
      </p>

      <p className={styles.howToUseModalTextTitle}>Conditional Start/End Events</p>
      <p className={styles.howToUseModalTextParagraph}>
        You can also choose to display data only when specific conditions are met. First, select an input stream. If it supports conditional display, the 'Start/End when' list (located at the bottom right of the graph) will show the available conditions for that stream. Select your desired condition and press Play to begin recording. Data will appear on the plot once the "Start when" condition is satisfied.
      </p>

      <p className={styles.howToUseModalTextTitle}>Export data/Capture graph</p>
      <p className={styles.howToUseModalTextParagraph}>
        To export the graph data in .csv format, click the 'Export CSV' link on the top left side of the plot. To capture a screenshot of the plot, hover over the graph area and then click the 'Download plot as PNG' button that appears on the top right of the plot. Happy data visualizing!
      </p>
      <button className={styles.closeButton} onClick={() => modalState.closeModal()}> Close </button>
    </div>
  );
}