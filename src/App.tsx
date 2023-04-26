import marty2Instance, { Marty2 } from "./app-bridge/mv2-rn";
import LandingPage from "./screens/LandingPage";
import "./styles/typography.css";
import './index.css';
import MockMarty from "./utils/mock-marty";

// extending the existing window interface to tell it about our new property mv2
declare global {
  interface Window { mv2Dashboard: Marty2; }
}

window.mv2Dashboard = marty2Instance;
// new MockMarty(marty2Instance).init();
function App() {
  return (
    <LandingPage />
  );
}

export default App;
