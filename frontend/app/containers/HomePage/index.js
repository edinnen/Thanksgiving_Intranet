/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import { Helmet } from 'react-helmet';

import Header from 'components/Header';
import CenteredSection from './CenteredSection';
import Wrapper from './Wrapper';

export class HomePage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <article>
        <Header />
        <Helmet>
          <title>Home Page</title>
          <meta name="description" content="Thanksgiving Intranet" />
        </Helmet>
        <Wrapper>
          <CenteredSection>
            Suh
          </CenteredSection>
        </Wrapper>
      </article>
    );
  }
}

HomePage.propTypes = {
};

export default HomePage;
