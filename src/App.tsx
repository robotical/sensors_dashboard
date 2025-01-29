import LandingPage from "./screens/LandingPage";
import "./styles/typography.css";
import './index.css';
// import MockMarty from "./utils/mock-marty";

// new MockMarty(marty2Instance).init(); 

type Props = {
  isInModal?: boolean;
}

function App({ isInModal }: Props) {
  return (
    <LandingPage isInModal={isInModal}/>
  );
}

export default App;
