const Gpio = require('pigpio').Gpio;
const red = new Gpio(11, { mode: Gpio.OUTPUT, alert: true });
const green = new Gpio(13, { mode: Gpio.OUTPUT });
const blue = new Gpio(15, { mode: Gpio.OUTPUT });
let dutyCycle = 0;

(function() {
  red.on('alert', () => {
    console.log(`GPIO output: ${dutyCycle}`);
  });
}());


function handleLED(req, res) {
	const leds = setInterval(() => {
		red.pwmWrite(dutyCycle);
		green.pwmWrite(dutyCycle);
		blue.pwmWrite(dutyCycle);
		dutyCycle += 5;
		if (dutyCycle > 255) {
			dutyCycle = 0;
		}
	}, 20);

	res.status(200).send('Successfully ran LEDs');
}

module.exports = {
  LED: handleLED,
};
