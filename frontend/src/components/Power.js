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
      data: {date: new Date(), solar: '', pelton: '', battery: ''},
      errors: [],
    };

  }

  componentWillMount() {
    axios.post(`${Urls.api}/fetch`)
      .then(() => {
        console.log("Running Python script")
      },
    )
      .catch(() => {
        this.setState({ errors: ['Error in power stats API post'] });
      },
    );
  }

  componentDidMount() {
    // setInterval(() => this.forceUpdate(), 3000);
    setInterval(() => this.doUpdate(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateData(callback) {
    axios.get(`${Urls.api}/powerData`)
      .then((res) => {
        var data = {
          date: new Date(),
          Solar: res.data[0]['solar'],
          Pelton: res.data[0]['pelton'],
          Battery: res.data[0]['battery']
        }
        this.setState({ data: data });
        callback(true);
      },
    )
      .catch(() => {
        this.setState({ errors: ['Error in backend power stats API get'] });
        callback(false);
      },
    );
  }

  doUpdate() {
    this.updateData(function(callback) {
      if (callback) {
        console.log("Data updated");
      } else {
        console.log("Error occured while updating data");
      }
    });
  }

  // getRandomValue() {
  //   return Math.floor(Math.random()*5);
  // }



  render() {
    const { windowWidth, data } = this.state;
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




    // var data = {
    //   date: new Date(),
    //   Solar: this.getRandomValue(),
    //   Pelton: this.getRandomValue(),
    //   Battery: this.getRandomValue()
    // };

    var flow = {
      duration: 200
    };

    const panelStyle = {
      width: '95vw',
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
            data={data}
            maxValues={30} />
        </Panel>
      </div>
    );
  }
}

export default Power;
