import marty2Instance, {Marty2} from "./app-bridge/mv2-rn";
import './App.css';
import LandingPage from "./screens/LandingPage";

// extending the existing window interface to tell it about our new property mv2
declare global {
  interface Window { mv2Dashboard: Marty2; }
}

window.mv2Dashboard = marty2Instance;

function App() {
  return (
    <LandingPage />
  );
}

export default App;
