import styles from "./styles.module.css";

const steps = [
  {
    title: "Connect a robot",
    description: "Select Connect device and pair Marty or Cog. The header will show its name, battery and signal.",
  },
  {
    title: "Add a graph",
    description: "Use Add graph in the Graphs toolbar, then choose which connected robot the graph belongs to.",
  },
  {
    title: "Choose signals and record",
    description: "Expand a sensor, select one or more signals, then start recording when the graph says Ready.",
  },
];

export default function GeneralInfo() {
  return (
    <div className={styles.guide}>
      <section aria-labelledby="quick-start-heading">
        <p className={styles.eyebrow}>Three steps</p>
        <h3 id="quick-start-heading">Create your first live graph</h3>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
              <div>
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.tipGrid} aria-label="Graph controls">
        <article>
          <h3>Recording controls</h3>
          <p>
            Record begins a live capture. Pause keeps the data already captured. Reset clears the graph so you can begin again.
          </p>
        </article>
        <article>
          <h3>Advanced settings</h3>
          <p>
            Open Advanced settings when you need trigger conditions or automatic scrolling. Set triggers before recording.
          </p>
        </article>
        <article>
          <h3>Exporting data</h3>
          <p>
            CSV becomes available after the graph has captured data. Plotly’s chart toolbar can also download an image of the plot.
          </p>
        </article>
      </section>
    </div>
  );
}
