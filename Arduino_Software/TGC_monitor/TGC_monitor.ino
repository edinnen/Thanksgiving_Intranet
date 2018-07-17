// Test code for Ultimate GPS Using Hardware Serial
//

// Used for communicating with GPS
#include "TinyGPS.h" //http://arduiniana.org/libraries/TinyGPS/
// Used for time keeping
#include "TimeLib.h" //https://github.com/PaulStoffregen/Time
#include <Wire.h> // Used to talk over I2C for RTC
#include "RTClib.h" //Used for RTC
#include <SPI.h> // SPI communication with SD card
#include <SD.h> // Used for the SD card (obviously you idiot)
//Used for monitoring the elapsed time. Downloaded manually. 
#include "elapsedMillis.h" //https://playground.arduino.cc/Code/ElapsedMillis#source
#include <avr/sleep.h> //for sleeping
#include <avr/power.h> //for sleeping deep
#include <avr/wdt.h> //for waking up

// what's the name of the hardware serial ports?
#define GPSSerial Serial1 // The serial port used for the GPS communication
#define RPiSerial Serial2 // Serial port 2 is wired to the RPi (if present)
//#define debug     Serial  // Serial port for communicating over USB


// Debug macro. If DEBUG is defined, debug functions will be replaced with
    //output to the USB serial. Otherwise they will be skipped.
#define DEBUG 1
#ifdef DEBUG
#define debug_print(x) (Serial.print(x))
#define debug_println(x) (Serial.println(x))
#else
#define debug_print(x)
#define debug_println(x)
#endif

#define FALSE 0
#define TRUE  1


//************************** Time keeping stuff**********************************
TinyGPS gps;
//Adafruit_GPS GPS(GPSSerial);
RTC_PCF8523 rtc;

unsigned long LAST_GPS_FIX = 0; // UNIX time of last GPS fix
bool GPS_SLEEP_FLAG = 1;
const unsigned int GPS_SYNC_INTERVAL = 30;
const unsigned int RTC_SYNC_INTERVAL = 10;
const unsigned int WRONG_SYNC_INT = 5;

// elapsedMillis creates a background timer that constantly counts up. Much better to use these
// timers than to use a delay. Does not work while asleep so make sure to reset after sleeping
// Energy measurments timer. Used to time measurments 
elapsedMillis ENERGY_TIME_ELAPSED;
// system interval timer. Used to time SD card writes
elapsedMillis SYSTEM_TIME_ELAPSED;

//************************** Analog Stuff **********************************

// The calculated reference voltage used in ADC. Determined with external reference
// This is the voltage of the input to the arduino. Nominally 5V (5000mV)
int VOLT_CALIBRATION = 5000;
const byte REF_PWR_PIN = 9;
const byte REF_READ_PIN = A0;

const byte NUM_VOLT_SOURCES = 3; //number of voltage sources
const byte NUM_AMP_SOURCES = 4; // number of current sources

// Arrays for holding the readings used in the moving average
//int VOLT_READINGS[NUM_VOLT_SOURCES][NUM_TO_AVERAGE];
//int AMP_READINGS[NUM_AMP_SOURCES][NUM_TO_AVERAGE];

// System Order: Load, Batt, Solar, Hydro //TODO
const byte VOLT_PIN[] = {A12, A13, A14}; // Pin A12 == 66
const byte LOAD_DETECT = 0; // Pin 0
const byte AMP_PIN[] = {A8, A9, A10, A11}; // Pin A8 == 62
// Voltages are read in mV and currents in mA to avoid floating point numbers
// 1 V = 1000 mV. 
// Voltage is calculated with this equation: reading * (4096mV/[reference voltage reading]) 
//                                              * [voltage divider multiplyer] = [actual voltage in mV]
// It's been simplified to avoid floats and interger overflow as: 
//      reading * [VOLT_MULTI] / [reference voltage reading] = [Actual Voltage]
//  Where VOLT_MULTI is just the voltage divider multiplier times the reference voltage in mV
//const unsigned long VOLT_MULTI[] = {50602ul, 30048ul, 15876ul, 15876ul}; //Voltage divider multiplier TODO
const unsigned long VOLT_MULTI[] = {15876ul, 30048ul, 50602ul}; //Voltage divider multiplier TODO
// Actual Current = (reading - AMP_DC_OFFSET)*MULTI
// AMP_MULTI = 1/([calibrated gain]/10)*4096 * [Number of physical wire turns in sensor]. 

// Current sensors are independently tested and have calibrations. 
// S/N = {B1720096, B1720089, B1720090, B1720091} Need to be installed the the correct location!!!!
const unsigned int AMP_DC_OFFSET[] = {508, 510, 510, 507}; //TODO calibrate myself
const unsigned long AMP_MULTI[] = {252839ul, 269474ul * 3, 248242ul * 3, 269474ul * 3}; 

// Flags for indicating if the load is connected and if the state changed
bool LOAD_ON_FLAG = FALSE;
bool PREV_LOAD_STATE = FALSE;

//************************** Other **********************************

// Flag is set by the watch dog timer (WDT)
byte WDT_FLAG = FALSE;
// Intervals used between readings/SD writes
int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode. One 'nap' is ~8sec long
// Used when in standby mode for long waits between writes
// use 37 naps for about 5min between SD writes, or 150 naps for ~20min. Note: not very accurate 
const int NUM_NAPS_BETWEEN_SD_WRITES = 2;

// chip select pin is 53 TODO
const byte chipSelect = 10;
// the logging file
File LOG;

//************************** Begin Functions **********************************

void setup() {
#ifdef DEBUG
    // Set the baud rate between the arduino and computer. 115200 is nice and fast!
    Serial.begin(115200);
#endif
   time_setup();
   analog_setup();
   //setWrongTime();
   
    // WDT setup
    cli(); //disable interrupts
    wdt_reset();
    // Enter 'Config mode'
    WDTCSR |= (1<<WDCE) | (1<<WDE);
    // Set interupts, reset on timeout, last 4 do time (1001 is 8sec)
    WDTCSR = (1<<WDIE) | (0<<WDE) | (1<<WDP3) | (0<<WDP2) | (0<<WDP1) | (1<<WDP0);
    sei(); //enable interupts
}// setup()

ISR(WDT_vect){
    // The system is woken up from sleep by the 'watch dog timer' WDT which is an interupt
    // After interupt, the script goes here
  //wdt_disable();  // disable watchdog
    WDT_FLAG = TRUE;
}

void SYSTEM_HAULT(){
    // If the system has an error I can't handle, just give up on everything.
    while(1){
     // **Contemplate Mistakes**
     continue;
    }
}

void sleep(){  
    debug_println("Starting my nap");
    delay(10);
    // This function puts the arduino in a deep sleep to save power. 
    // Each nap takes about 8 seconds but don't rely on this being accurate.

    // Setting the 'Sleep Mode Control Register' or SMCR
    // SMCR = ----010- is Power-Down mode
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    // Sleep enable: SMCR = -------1
    sleep_enable();

    // Power reduction register 0; shut down ADC PRR0 = -------1
    // Probably need to research more into power reduction...

    // Now enter sleep mode.
    sleep_mode();
    // The program will continue from here after the WDT timeout
    // Sleep disable: SMCR = -------0
    sleep_disable(); // First thing to do is disable sleep.
    // Re-enable the peripherals.
    power_all_enable();
    delay(10);
    debug_println("Finished my nap");
    //NUM_NAPS_TAKEN++; // We took a nap so update the counter
  } 

void loop() {
    int i=0;
    long beforeNap = 0;
    long afterNap = 0;

    for(i = 0;i<5;i++){
        testVoltage();

        debug_print("now(): ");
        debug_println(now());
        debug_print("GPS_SLEEP_FLAG: ");
        debug_println(GPS_SLEEP_FLAG);
        delay(1000);
    }
    beforeNap = now();
    for(i=0;i<5;i++){
        sleep();
    }
    setRTCtime();
    afterNap = now();
    debug_print("I slept for ");
    debug_print(afterNap - beforeNap);
    debug_print(" seconds. Wow!");
}
