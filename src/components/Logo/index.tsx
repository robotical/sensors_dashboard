import styles from "./styles.module.css";
import LogoImage from "../../assets/logoBlue.png";

export default function Logo() {
  return <img src={LogoImage} alt="marty-logo" className={styles.logo} />
}
