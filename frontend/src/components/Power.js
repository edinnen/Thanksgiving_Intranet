import React, { Component } from 'react';
import { Panel } from 'react-bootstrap/lib';
import Style from '../util/Style.js';
import TopNavbar from './TopNavbar.js';

class Power extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      errors: [],
    };
  }
  render() {
    const { windowWidth } = this.state;
    let width;
    if (windowWidth < Style.xsCutoff) {
      width = '100%';
    } else if (windowWidth < Style.smCutoff) {
      width = '723px';
    } else if (windowWidth < Style.mdCutoff) {
      width = '933px';
    } else {
      width = '1127px';
    }

    const panelStyle = {
      width,
      margin: 'auto',
      marginTop: '65px',
    };

    return (
      <div>
        <TopNavbar />
        <Panel style={panelStyle} bsStyle="primary">
          <h2>Thanksgiving Cabin Power Statistics</h2>
        </Panel>
      </div>
    );
  }
}

export default Power;
