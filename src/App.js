import { AllRoutes } from "./routes/AllRoutes";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <AllRoutes/>
      </div>
    </ErrorBoundary>
  );
}

export default App;
