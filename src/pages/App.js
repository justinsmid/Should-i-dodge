const isElectron = require('is-electron');
const {default: Homepage} = require('./Homepage');

function App() {
  // Close the browser tab that's opened on launch in the actual browser and not in electron.
  if (!isElectron()) {
    window.close();
  }
  
  return (
    <div>
      <Homepage />
    </div>
  );
}

export default App;
