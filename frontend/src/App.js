import React, { useState } from 'react';
import Plot from 'react-plotly.js';

const evtSource = new EventSource("http://10.0.0.173:3030");

function App() {
  const [readings, setReadings] = useState([]);
  const [solarVoltageData, setSolarVoltageData] = useState({
    type: "scatter",
    mode: "lines",
    x: [],
    y: [],
    line: { color: "#17BECF" }
  });

  evtSource.onmessage = function(evt) {
    const reading = JSON.parse(evt.data);
    reading.timestamp = new Date(reading.timestamp);
    console.log("Recieved value: ", reading)
    setReadings([...readings, reading]);
    const { timestamp, solar_voltage } = reading;
    const formatted_date = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1)}-${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
    setSolarVoltageData({
      ...solarVoltageData,
      x: [...solarVoltageData.x, formatted_date],
      y: [...solarVoltageData.y, solar_voltage]
    });
  }

  if (!readings.length) return "";

  const from = new Date(readings[readings.length-1].timestamp);
  from.setSeconds(from.getSeconds()-15);
  const to = new Date(readings[readings.length-1].timestamp);

  const layout = {
    title: "Solar Voltage",
    width: 1000,
    height: 400,
    xaxis: {
      type: "date",
      range: [from, to]
    },
    yaxis: {
      type: "linear",
      range: [10.0, 18.0]
    }
  };

  return (
    <div>
      <Plot
        data={[solarVoltageData]}
        layout={layout}
      />
      <br />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span>Last Timestamp: {readings[readings.length-1].timestamp.toUTCString()}</span>
        <span>Last Unix: {readings[readings.length-1].unix}</span>
        <span>Last Solar Voltage: {readings[readings.length-1].solar_voltage}</span>
        <span>Last Outside Temp: {readings[readings.length-1].outside_temp}</span>
        <span>Last Cabin Temp: {readings[readings.length-1].cabin_temp}</span>
        <span>Last Load Amperage: {readings[readings.length-1].load_amperage}</span>
        <span>Last Battery Voltage: {readings[readings.length-1].battery_voltage}</span>
        <span>Last Battery Temp: {readings[readings.length-1].battery_temp}</span>
        <span>Last Battery Percent: {readings[readings.length-1].battery_percent}</span>
        <span>Last Avg Load Power: {readings[readings.length-1].avg_load_power}</span>
        <span>Last Avg Battery Power: {readings[readings.length-1].avg_battery_power}</span>
      </div>
    </div>
  );
}

export default App;
