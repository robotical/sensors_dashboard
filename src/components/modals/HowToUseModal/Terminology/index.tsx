import styles from "./styles.module.css";

export default function Terminology() {
  return (
    <div className={styles.howToUseModalContainer}>
      <p className={styles.howToUseModalTextParagraph}>
        This section briefly details the definitions of the sensors and their properties. For a more detailed description of the sensors, please refer to the <a href="https://userguides.robotical.io/martyv2/userguides/sensorsandaddons" target="_blank" rel="noreferrer">sensor user guide</a>.
      </p>
      <p className={styles.howToUseModalTextTitle}>
        Obstacle (IR Foot) Sensor
      </p>
      <p className={styles.terminologyKey}><b>Obstacle Sensor </b> the analogue value of the obstacle sense IR receiver with its IR emitter turned on. It is calculated as ir_led - ir_ambient - ir_bleed</p>
      <p className={styles.terminologyKey}><b>Obstacle Detected? </b> a thresholded version of “Touch_IR” which gives a binary determination of whether an obstacle is present or not</p>
      <p className={styles.terminologyKey}><b>Ambient IR - Front </b> the analogue value of the obstacle sense IR receiver with its IR emitter turned off</p>
      <p className={styles.terminologyKey}><b>Ground Sensor </b> the analogue value of the ground sense IR receiver with its IR emitter turned on. It is calculated as ir_led - ir_ambient - ir_bleed</p>
      <p className={styles.terminologyKey}><b>Foot In Air? </b> a thresholded and flipped version of “Air_IR, which gives a binary determination of whether the foot is in the air</p>
      <p className={styles.terminologyKey}><b>Ambient IR - Bottom </b> the analogue value of the ground sense IR receiver with its IR emitter turned off</p>
      <p className={styles.howToUseModalTextTitle}>
        Colour Sensor
      </p>
      <p className={styles.terminologyKey}><b>Brightness </b> the [calibrated] reading from the clear channel</p>
      <p className={styles.terminologyKey}><b>Red Channel </b> the [calibrated] reading from the red channel</p>
      <p className={styles.terminologyKey}><b>Green Channel </b> the [calibrated] reading from the green channel</p>
      <p className={styles.terminologyKey}><b>Blue Channel </b> the [calibrated] reading from the blue channel</p>
      <p className={styles.terminologyKey}><b>Obstacle Sensor </b> the analogue value of the obstacle sense IR receiver with its IR emitter turned on. It is calculated as ir_led - ir_ambient - ir_bleed</p>
      <p className={styles.terminologyKey}><b>Obstacle Detected? </b> a thresholded version of “Touch_IR” which gives a binary determination of whether an obstacle is present or not</p>
      <p className={styles.terminologyKey}><b>Foot In Air? </b> a thresholded and flipped version of “Air_IR, which gives a binary determination of whether the foot is in the air</p>

      <p className={styles.howToUseModalTextTitle}>
        Noise Sensor
      </p>
      <p className={styles.terminologyKey}><b>Recent Noise Level </b> a moving-average low-pass filtered value of the noise intensity</p>
      <p className={styles.terminologyKey}><b>Noise level </b> the highest recorded value of the “smoothed” sensor since the last reported reading</p>
      <p className={styles.terminologyKey}><b>Instant Noise Level </b> the unfiltered, instantaneous reading</p>
      <p className={styles.howToUseModalTextTitle}>
        Light Sensor
      </p>
      <p className={styles.terminologyKey}><b>Light Level - Right </b> Intensity of light from sensor 1, to Marty’s right if the light sensor is facing forwards</p>
      <p className={styles.terminologyKey}><b>Light Level - Center </b> Intensity of light from sensor 2, in front of Marty if the light sensor is facing forwards</p>
      <p className={styles.terminologyKey}><b>Light Level - Left </b> Intensity of light from sensor 3, to Marty’s left if the light sensor is facing forwards</p>
    </div>
  );
}