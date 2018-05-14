/**
*
* OceanWiseNav
*
*/

import React from 'react';
// import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
require('./style.css');


class OceanWiseNav extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = {
      active: false,
    };
    this.setState = this.setState.bind(this);
  }

  toggleActive() {
    this.setState({ active: !this.state.active });
  }

  render() {
    return (
      <div className="hello-bar">

        <div className="hello-bar-text">
          <FormattedMessage {...messages.explore} /> <span className="hello-bar-hide-mobile"><FormattedMessage {...messages.moreAt} /></span><a href="https://ocean.org" target="_blank">ocean.org</a>
        </div>

        <div className="hello-bar-logo-toggle">
          <img alt="logo" className="hello-bar-logo" src="https://dev.ryanmurray.ca/ow/ow-logo.svg" />
          <button className={this.state.active ? 'hello-bar-btn hello-bar-btn-open' : 'hello-bar-btn hello-bar-btn-closed'} onClick={() => this.toggleActive()}>
            <img alt="chevron" className="hello-bar-icon" src="https://dev.ryanmurray.ca/ow/chevron.svg" />
          </button>
        </div>

        <div className={this.state.active ? 'hello-bar-menu hello-bar-menu-open' : 'hello-bar-menu hello-bar-menu-closed'}>
          <ul className="hello-bar-nav">
            {/* TODO: Translate these */}
            <li><a href="https://ocean.org" target="_blank">Ocean Wise</a></li>
            <li><a href="http://vanaqua.org" target="_blank">Vancouver Aquarium</a></li>
            <li><a href="https://ocean.org/seafood" className="disabled" target="_blank">Sustainable Seafood</a></li>
            <li><a href="https://shorelinecleanup.ca" target="_blank">Shoreline Cleanup</a></li>
            <li><a href="https://ocean.org/research" target="_blank">Ocean Research</a></li>
            <li><a href="https://ocean.org/education" target="_blank">Ocean Education</a></li>
            <li><a href="http://wildwhales.org" target="_blank">Whale Sightings</a></li>
            <li><a href="https://aquablog.ca/" target="_blank">Aquablog</a></li>
            <li><a href="https://ocean.org/donate" target="_blank">Donate</a></li>
          </ul>
        </div>

      </div>
    );
  }
}

OceanWiseNav.propTypes = {

};

export default OceanWiseNav;
