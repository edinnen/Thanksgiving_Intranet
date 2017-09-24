import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Home from './components/Home';
import Logbook from './components/Logbook';
import Power from './components/Power';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={Home} />
    <Route path="/logbook" component={Logbook} />
    <Route path="/power" component={Power} />
  </Router>
  ), document.getElementById('root'),
);
