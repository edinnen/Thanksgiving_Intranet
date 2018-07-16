// Test code for Ultimate GPS Using Hardware Serial
//

// Used for communicating with GPS
#include "TinyGPS.h" //http://arduiniana.org/libraries/TinyGPS/
//#include <Adafruit_GPS.h>
// Used for time keeping
#include "TimeLib.h" //https://github.com/PaulStoffregen/Time
// Used to talk over I2C for RTC
//Used for RTC
#include "RTClib.h"
#include <Wire.h>

// what's the name of the hardware serial ports?
#define GPSSerial Serial1 // The serial port used for the GPS communication
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

TinyGPS gps;
//Adafruit_GPS GPS(GPSSerial);
RTC_PCF8523 rtc;

unsigned long LAST_GPS_FIX = 0; // UNIX time of last GPS fix
bool GPS_SLEEP_FLAG = 1;
const unsigned int GPS_SYNC_INTERVAL = 30;
const unsigned int RTC_SYNC_INTERVAL = 10;
const unsigned int WRONG_SYNC_INT = 5;

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

void setup() {
#ifdef DEBUG
    // Set the baud rate between the arduino and computer. 115200 is nice and fast!
    Serial.begin(115200);
#endif
   time_setup();
   analog_setup();
   setWrongTime();
   
}// setup()

void SYSTEM_HAULT(){
    // If the system has an error I can't handle, just give up on everything.
    while(1){
     // **Contemplate Mistakes**
     continue;
    }
}
void loop() {

    testVoltage();

    debug_print("now(): ");
    debug_println(now());
    debug_print("GPS_SLEEP_FLAG: ");
    debug_println(GPS_SLEEP_FLAG);
    delay(1000);

}
