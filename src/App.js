import logo from './logo.svg';
import './App.css';
const isElectron = require('is-electron');

function App() {
  // Close the browser tab that's opened on launch in the actual browser and not in electron.
  if (!isElectron()) {
    window.close();
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.testjs</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
