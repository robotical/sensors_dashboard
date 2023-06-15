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
      <p className={styles.terminologyKey}><b>Obstacle Sensor </b> The intensity of IR light reflected back to the sensor from an obstacle</p>
      <p className={styles.terminologyKey}><b>Obstacle Detected? </b> The sensor’s best guess as to whether an obstacle is present. 1 = obstacle, 0 = no obstacle</p>
      <p className={styles.terminologyKey}><b>Ambient IR - Front </b> The intensity of IR light received by the obstacle sensor from elsewhere - this will be higher in sunlight!</p>
      <p className={styles.terminologyKey}><b>Ground Sensor </b> The intensity of IR light reflected back to the ground sensor from a surface. Will be higher on bright, reflective surfaces</p>
      <p className={styles.terminologyKey}><b>Foot In Air? </b> The sensor’s best guess as to whether the foot is in the air. 1 = foot in air, 0 = foot on ground</p>
      <p className={styles.terminologyKey}><b>Ambient IR - Bottom </b> The intensity of IR light received by the ground sensor from elsewhere</p>
      
      <p className={styles.howToUseModalTextTitle}>
        Colour Sensor
      </p>
      <p className={styles.terminologyKey}><b>Brightness </b> How much light is received by the sensor under the foot</p>
      <p className={styles.terminologyKey}><b>Red Channel </b> How much red light is received by the sensor under the foot</p>
      <p className={styles.terminologyKey}><b>Green Channel </b> How much green light is received by the sensor under the foot</p>
      <p className={styles.terminologyKey}><b>Blue Channel </b> How much blue light is received by the sensor under the foot</p>
      <p className={styles.terminologyKey}><b>Obstacle Sensor </b> The intensity of IR light reflected back to the sensor from an obstacle</p>
      <p className={styles.terminologyKey}><b>Obstacle Detected? </b> The sensor’s best guess as to whether an obstacle is present. 1 = obstacle, 0 = no obstacle</p>
      <p className={styles.terminologyKey}><b>Foot In Air? </b> The sensor’s best guess as to whether the foot is in the air. 1 = foot in air, 0 = foot on ground</p>

      <p className={styles.howToUseModalTextTitle}>
        Noise Sensor
      </p>
      <p className={styles.terminologyKey}><b>Recent Noise Level </b> The average noise level over the last fraction of a second</p>
      <p className={styles.terminologyKey}><b>Noise level </b> The average noise level over the last 100ms</p>
      <p className={styles.terminologyKey}><b>Instant Noise Level </b> The noise level this instant - will give higher values than the other options, but is also likely to miss some noises!</p>
      <p className={styles.howToUseModalTextTitle}>
        Light Sensor
      </p>
      <p className={styles.terminologyKey}><b>Light Level - Right </b> Intensity of light from sensor 1, to Marty’s right if the light sensor is facing forwards</p>
      <p className={styles.terminologyKey}><b>Light Level - Center </b> Intensity of light from sensor 2, in front of Marty if the light sensor is facing forwards</p>
      <p className={styles.terminologyKey}><b>Light Level - Left </b> Intensity of light from sensor 3, to Marty’s left if the light sensor is facing forwards</p>
    </div>
  );
}