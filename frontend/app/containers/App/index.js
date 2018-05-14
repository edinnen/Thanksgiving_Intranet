/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import Stats from 'containers/Stats';
import Lights from 'containers/Lights';
import LogBook from 'containers/LogBook';
import Footer from 'components/Footer';

const AppWrapper = styled.div`
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  min-height: 100%;
  flex-direction: column;
`;


export default function App() {
  return (
    <MuiThemeProvider>
      <AppWrapper>
        <Helmet
          titleTemplate="%s - React.js Boilerplate"
          defaultTitle="React.js Boilerplate"
        >
          <meta name="description" content="A React.js Boilerplate application" />
        </Helmet>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/log" component={LogBook} />
          <Route path="/stats" component={Stats} />
          <Route path="/lights" component={Lights} />
          <Route path="" component={NotFoundPage} />
        </Switch>
      </AppWrapper>
    </MuiThemeProvider>
  );
}
