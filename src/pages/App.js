import {Route, BrowserRouter as Router, Switch} from 'react-router-dom';
import routes from './routes';

const isElectron = require('is-electron');

function App() {
  // Close the browser tab that's opened on launch in the actual browser and not in electron.
  if (!isElectron()) {
    window.close();
  }
  
  return (
    <div>
      <Router>
        <Switch>
          {routes.map(route => (
            <Route key={route.title} exact path={route.path} component={route.component} />
          ))}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
