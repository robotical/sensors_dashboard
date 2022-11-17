import Header from "../../components/Header";
import MainContent from "../../components/MainContent";
import styles from "./styles.module.css";

export default function LandingPage() {
    return <main className={styles.mainContainer}>
        <Header />
        <MainContent />
    </main>
}