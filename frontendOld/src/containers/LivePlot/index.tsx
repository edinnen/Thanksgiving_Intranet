import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { Reading, SolarPlot } from 'types';

const evtSource = new EventSource("http://10.0.0.173:3030");

let from, to;
const readingsTemplate: SolarPlot = {
  raw: [],
  data: {
    type: "scatter",
    mode: "lines",
    x: [],
    y: [],
    line: { color: "#17BECF" },
  },
  layout: {
    width: 1000,
    height: 400,
    xaxis: {},
    yaxis: {
      type: "linear",
      autorange: true,
    }
  }
};

interface LivePlotConfig {
  title: string;
  keyToPlot: string;
}

function renderDebug(reading: Reading) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span>Last Timestamp: {reading.timestamp.toUTCString()}</span>
      <span>Last Unix: {reading.unix}</span>
      <span>Last Solar Voltage: {reading.solar_voltage}</span>
      <span>Last Outside Temp: {reading.outside_temp}</span>
      <span>Last Cabin Temp: {reading.cabin_temp}</span>
      <span>Last Load Amperage: {reading.load_amperage}</span>
      <span>Last Battery Voltage: {reading.battery_voltage}</span>
      <span>Last Battery Temp: {reading.battery_temp}</span>
      <span>Last Battery Percent: {reading.battery_percent}</span>
      <span>Last Avg Load Power: {reading.avg_load_power}</span>
      <span>Last Avg Battery Power: {reading.avg_battery_power}</span>
    </div>
  );
}

function LivePlot({ title, keyToPlot }: LivePlotConfig) {
  const [readings, setReadings] = useState(readingsTemplate);

  evtSource.onmessage = function (evt) {
    const reading = JSON.parse(evt.data);
    reading.timestamp = new Date(reading.timestamp);
    const { timestamp } = reading;

    const formatted_date = `${timestamp.getFullYear()}-${(timestamp.getMonth() + 1)}-${timestamp.getDate()} ${timestamp.getHours()}:${timestamp.getMinutes()}:${timestamp.getSeconds()}`;
    from = new Date(reading.timestamp);
    from.setSeconds(from.getSeconds() - 45);
    to = new Date(reading.timestamp);

    setReadings({
      ...readings,
      raw: [...readings.raw, reading],
      data: {
        ...readings.data,
        x: [...(readings.data.x as Plotly.Datum[]), formatted_date],
        y: [...(readings.data.y as Plotly.Datum[]), reading[keyToPlot]]
      },
      layout: {
        ...readings.layout,
        title,
        xaxis: {
          type: "date",
          range: [from, to]
        },
        yaxis: {
          type: "linear",
          autorange: true,
        }
      }
    });
  }

  if (!readings.raw.length) return <div />;

  return (
    <div>
      <Plot
        data={[readings.data]}
        layout={readings.layout}
      />
      <br />
      {renderDebug(readings.raw[readings.raw.length - 1])}
    </div>
  );
}

export default LivePlot;
