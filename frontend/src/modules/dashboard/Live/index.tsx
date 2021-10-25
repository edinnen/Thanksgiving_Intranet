import React, { useState } from 'react';
import { teal, indigo, blue } from '@material-ui/core/colors';
import { Box } from '@material-ui/core';
import {createLineData} from '../../../utils';
import GridContainer from '../../../@crema/core/GridContainer';
import Grid from '@material-ui/core/Grid';
import TemperatureCard from '../../../@crema/core/TemperatureCard';
import PercentageCard from '../../../@crema/core/PercentageCard';
import LinePlot from '../../../shared/components/LinePlot';

export interface Reading {
    timestamp: Date
    unix: number
    battery_voltage: number
    solar_voltage: number
    battery_amperage: number
    load_amperage: number
    battery_percent: number
    avg_battery_power: number
    avg_load_power: number
    outside_temp: number
    cabin_temp: number
    battery_temp: number
}

const evtSource = new EventSource("http://thanksgiving.cabin:3030");
/* eslint-disable */
function mobileAndTabletCheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
  return check;
};
const isMobile = mobileAndTabletCheck();

interface LiveReadings {
  voltAmpData: any[];
  powerData: any[];
  lastReading?: any;
}

const initialState: LiveReadings = {
  voltAmpData: [],
  powerData: [],
}

function Live() {
  const [readings, setReadings] = useState(initialState);

  evtSource.onmessage = function (evt) {
    const reading: Reading = JSON.parse(evt.data);
    reading.timestamp = new Date(reading.timestamp);
    const { timestamp } = reading;

    const date = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1)}-${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
    const maxTimeInterval = isMobile ? 15 : 45;
    const voltAmpData = createLineData(date, reading, 'solar_voltage', 'battery_voltage', 'load_amperage');
    const powerData = createLineData(date, reading, 'avg_battery_power', 'avg_load_power');
    let newVoltAmpData = [...readings.voltAmpData, voltAmpData];
    let newPowerData = [...readings.powerData, powerData];

    if (readings.voltAmpData.length === maxTimeInterval) {
      newVoltAmpData = [...readings.voltAmpData.slice(1), voltAmpData];
    }
    if (readings.powerData.length === maxTimeInterval) {
      newPowerData = [...readings.powerData.slice(1), powerData]
    }

    setReadings({
      ...readings,
      voltAmpData: newVoltAmpData,
      powerData: newPowerData,
      lastReading: reading
    });
  }

  const { lastReading, voltAmpData, powerData } = readings;
  if (!lastReading) return <div />;

  return (
    <>
      <Box pt={{ xl: 4 }}>
        <GridContainer>
          <Grid item xs={12} md={3}>
            <PercentageCard percentage={lastReading.battery_percent} title="Battery Charge" />
          </Grid>
          <Grid item xs={6} md={3}>
            <TemperatureCard temperature={lastReading.cabin_temp} title="Cabin Temperature" color={teal[500]} />
          </Grid>
          <Grid item xs={6} md={3}>
            <TemperatureCard temperature={lastReading.outside_temp} title="Outside Temperature" color={indigo[600]} />
          </Grid>
          <Grid item xs={12} md={3}>
            <TemperatureCard temperature={lastReading.battery_temp} title="Battery Temperature" color={blue[600]} />
          </Grid>
          <Grid item xs={12}>
            <LinePlot title="Voltage and Amperage" data={voltAmpData} primaryKey="solar_voltage" secondaryKey="battery_voltage" tertiaryKey="load_amperage" primaryColor="#8884d8" secondaryColor="#82ca9d" tertiaryColor="#0698ec" />
          </Grid>
          <Grid item xs={12}>
            <LinePlot title="Average Power" data={powerData} primaryKey="avg_battery_power" secondaryKey="avg_load_power" primaryColor="#f44d50" secondaryColor="#0698ec" /> 
          </Grid>
        </GridContainer>
      </Box>
    </>
  );
}

export default Live;