import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import Logbook from './components/Logbook';
import Home from './components/Home';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/logbook" component={Logbook} />
    <Route path="/" component={Home} />
  </Router>
  ), document.getElementById('root'),
);
