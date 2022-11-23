import Connection from "../connection";
import styles from "./styles.module.css";

export default function Header() {
    return <div className={styles.header}>
         <Connection />
         <div className={styles.title}>Marty Sensors Dashboard</div>
    </div>
}