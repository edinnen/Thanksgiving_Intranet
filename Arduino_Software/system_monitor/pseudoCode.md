Finite state machine

States:
1) Standby operation
2) Load Connected operation
3) RPi data dump
4) RPi data stream

==Standby Operation==
Read voltages, currents and temperatures
Read time from RTC
Write data to SD card
Sleep

==Load Connected Operation==
Read voltages and currents at fast rate
Compute power state of battery
Read temperature
Read Time
Write data, including power state, to SD card

==RPi data dump==
Recieve data dump request over serial.
halt sensor readings and start streaming requested data
once complete, return to previous state

==RPi data stream==
Recieve request for data stream over serial
continue to take power readings at high rate
stream current state to RPi at low baud (3 sec?)

==File Structure==
Files are named based on the time
New files:
    On startup
    When load connected (big switch turned)
    When load disconnected
    When file size reaches some number

