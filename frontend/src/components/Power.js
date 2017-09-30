import React, { Component } from 'react';
import { Panel } from 'react-bootstrap/lib';
import Style from '../util/Style.js';
import TopNavbar from './TopNavbar.js';
import axios from 'axios';
import Urls from '../util/Urls.js';
import RTChart from 'react-rt-chart';

class Power extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      data: [], // The power stats data
      errors: [],
    };
  }

  componentDidMount() {
    setInterval(() => this.forceUpdate(), 1000);
  }

  updateData() {
    axios.post(`${Urls.api}/power`)
      .then((res) => {
      },
    )
      .catch(() => {
        this.setState({ errors: ['Error in power stats API post'] });
      },
    );

    axios.get(`${Urls.api}/power`)
      .then((res) => {
        this.setState({ data: res.data });
      },
    )
      .catch(() => {
        this.setState({ errors: ['Error in backend power stats API get'] });
      },
    );
  }

  getRandomValue() {
    return Math.floor(Math.random()*5);
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

    var data = {
      date: new Date(),
      Solar: this.getRandomValue(),
      Pelton: this.getRandomValue(),
      Battery: this.getRandomValue()
    };

    var flow = {
      duration: 200
    };

    const panelStyle = {
      width,
      margin: 'auto',
      marginTop: '65px',
    };

    return (
      <div>
        <TopNavbar />
        <Panel style={panelStyle} bsStyle="primary">
        <RTChart
            flow={flow}
            fields={['Solar','Pelton','Battery']}
            data={data} />
        </Panel>
      </div>
    );
  }
}

export default Power;
