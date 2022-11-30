import modalState from "../../../state-observables/modal/ModalState";
import styles from "./styles.module.css";

export default function HowToUseModal() {
  return (
    <div className={styles.howToUseModalContainer}>
      <p className={styles.howToUseModalTextTitle}>
        Introduction
      </p>
      <p className={styles.howToUseModalTextParagraph}>
        This is a tool to visualise data coming from your Marty's sensors.
      </p>

      <p className={styles.howToUseModalTextParagraph}>
        When you connect to your Marty an empty graph will come up. On the left,
        you will see a list of sensors each of which can be expanded and reveal
        the input streams this sensor has. For example, the colour sensor has 
        4 input streams: Red, Green, Blue, and Clear.
      </p>

      <p className={styles.howToUseModalTextTitle}>Data Recording</p>
      <p className={styles.howToUseModalTextParagraph}>
        To start recording data, you should first select at least one input stream,
        and then press the Play button on the bottom left of the graph. 
        Once the play button is pressed, a round, black shape will show up indicating
        that you are now recording data live. The data will start depicting on the plot
        as they come from Marty.
      </p>

      <p className={styles.howToUseModalTextTitle}>Conditional Start/End Events</p>
      <p className={styles.howToUseModalTextParagraph}>
        You can also start displaying data once a specific condition 
        has been met. To do so, you will need to first select an input stream.
        If that input stream supports conditional displaying, the 'Start/End when'
        list --on the bottom right of the graph-- will be populated with the 
        conditions this input stream supports. Once you select the condition of interest,
        you can press Play to start recording. Once the Start when condition has been met,
        the data will start showing up on the plot.
      </p>

      <p className={styles.howToUseModalTextTitle}>Export data/Capture graph</p>
      <p className={styles.howToUseModalTextParagraph}>
        You can export the graph data in .csv format by pressing the 'Export CVS' 
        link on the right-hand side of the plot. Also, you can capture a screenshot
        of the plot by hovering over the graph area, and then clicking on the 
        'Download plot as png' button which should now be visible on the top right 
        of the plot.
      </p>

      <button className={styles.closeButton} onClick={() => modalState.closeModal()}> Close </button>
    </div>
  );
}