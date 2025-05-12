import { EthProvider } from "./contexts/EthContext";
import { Container, Nav, Tab } from "react-bootstrap";
import AccountComponent from "./components/MvtBank/AccountComponent";
import BankBlockchain from "./components/MvtBank/BankBlockchain";

function App() {
  return (
    <EthProvider>
      <div id="App">
          <Container className="mt-5">
              <h1 className="text-center mb-4">My Financial Management App</h1>
              <Tab.Container defaultActiveKey="traditional">
                  <Nav variant="tabs">
                      <Nav.Item>
                          <Nav.Link eventKey="traditional">Traditional Bank Account Management</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                          <Nav.Link eventKey="blockchain">Bank Blockchain Interaction</Nav.Link>
                      </Nav.Item>
                  </Nav>
                  <Tab.Content className="mt-4">
                      <Tab.Pane eventKey="traditional">
                          <AccountComponent />
                      </Tab.Pane>
                      <Tab.Pane eventKey="blockchain">
                          <BankBlockchain />
                      </Tab.Pane>
                  </Tab.Content>
              </Tab.Container>
          </Container>
      </div>
    </EthProvider>
  );
}

export default App;
