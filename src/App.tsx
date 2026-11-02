import LandingPage from "./screens/LandingPage";
import "./styles/typography.css";
import './index.css';
// import MockMarty from "./utils/mock-marty";

// new MockMarty(marty2Instance).init(); 

type Props = {
  isInModal?: boolean;
  onReturnToHost?: () => void;
}

function App({ isInModal, onReturnToHost }: Props) {
  return (
    <LandingPage isInModal={isInModal} onReturnToHost={onReturnToHost}/>
  );
}

export default App;
