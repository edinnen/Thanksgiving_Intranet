.DEFAULT_GOAL := compile-upload

compile-upload:
	arduino-cli compile --fqbn arduino:avr:mega TGC_monitor
	arduino-cli upload -p /dev/ttyACM0 --fqbn arduino:avr:mega TGC_monitor
