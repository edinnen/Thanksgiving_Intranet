import LivePlot from 'containers/LivePlot';
import React from 'react';

function App() {
  return (
    <div className="App">
      <LivePlot title="Solar Voltage" keyToPlot="solar_voltage" />
    </div>
  );
}

export default App;
