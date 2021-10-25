/*
Thanksgiving Cabin Power System Monitor

A magical device that monitors important data produced at the Thanksgiving cabin
This software goes along with an Arduino based datalogging system which can
track power and temMperature data to an SD card. 

Developed by Stuart de Haas along with help from many great people. Specific 
thanks to Stuart Taylor and Ethan Dinnen.

Created: October, 2017
First kinda working version: 22 July, 2018
Actually working version V1.0: 28 Dec 2020
Last Modified: Oct, 2021

Good things take time. Be patient.
*/

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
#include <OneWire.h> //Used for temperature sensors (BS18B20)
#include <DallasTemperature.h> // Used for making temp sensors easier
#include <INA219.h> // used to deal with power measurment ICs

// what's the name of the hardware serial ports?
#define RPiSerial Serial   
 
// set to 1 for faster write/read frequencies and clock updates.
// set to 0 for production numbers
#define DEBUG_SPEEDUP_TIME 0

// Comment out to use actual sensors
#define DEBUG_SENSORS

// Comment out line to disable RPi Serial communication
#define RPI_ENABLE 

// Debug macro. If DEBUG is defined, debug functions will be replaced with
//output to the USB serial. Otherwise they will be skipped.
//#define DEBUG 

#ifdef DEBUG
#define debug_print(x)   \
Serial.print("DEBUG: "); \
Serial.print(x);
#define debug_println(x) \
Serial.print("DEBUG: "); \
Serial.println(x);
#define humanTime()      \
printhumanTime();
#else
#define debug_print(x)
#define debug_println(x)
#define humanTime()
#endif


//************************** Time keeping stuff**********************************
// Real Time clock object
RTC_DS3231 rtc;


// elapsedMillis creates a background timer that constantly counts up.
// Tracks times between SD writes during hi res logging
elapsedMillis HIRES_LOG_ELAPSED_MILLIS;

// Tracks time between power readings to calculate energy
elapsedMillis ENERGY_TIME_ELAPSED;


// Intervals used between readings/SD writes when loads disconnected
//int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode (loads disconnected). One 'nap' is ~8sec long
//const int NUM_NAPS_BETWEEN_SD_WRITES = DEBUG_SPEEDUP_TIME ? 2 : (10*60)/8; 
// This interval is used when loads are connected. It is generally higher resolution
const unsigned int LOW_RES_LOGGING_INTERVAL   = DEBUG_SPEEDUP_TIME ?        20 : (30*60); //seconds
const unsigned int HI_RES_LOGGING_INTERVAL    = DEBUG_SPEEDUP_TIME ?         5 : (10*60); //seconds
const unsigned int LOAD_DEBOUNCE_INTERVAL_SEC = DEBUG_SPEEDUP_TIME ?  (3600*1) : (3600*6); // Seconds
const unsigned long int NEW_FILE_INTERVAL     = DEBUG_SPEEDUP_TIME ?  (36000) : (2419200); //Seconds between creating new files
const int ENERGY_TIME_INTERVAL = 1000; //milliseconds

unsigned long int NEXT_FILE_UNIX = 0; //TODO delete

//************************** Sensor Stuff **********************************

// Information used to configure the INA219 power measurment ICs
// Additional configuration is done in the setup function


//Address 0x40 = no jumpers
//Address 0x41 = jumper A0
//Address 0x44 = jumper A1
//Address 0x45 = jumper A0 & A1


#ifdef DEBUG_SENSORS

#define BATT_SHUNT_MAX_V  0.04
#define BATT_BUS_MAX_V    26
#define BATT_MAX_CURRENT  20
#define BATT_SHUNT_R      0.001
INA219 BATT_MONITOR(0x41);

#define LOAD_SHUNT_MAX_V  0.32
#define LOAD_BUS_MAX_V    16
#define LOAD_MAX_CURRENT  3.2
#define LOAD_SHUNT_R      0.1
INA219 LOAD_MONITOR(0x40); 

#define SOLAR_SHUNT_MAX_V  0.04
#define SOLAR_BUS_MAX_V    32
#define SOLAR_MAX_CURRENT  20
#define SOLAR_SHUNT_R      0.001
INA219 SOLAR_MONITOR(0x45); 

#else
// Values used for Cabin sensors

#define BATT_SHUNT_MAX_V  0.04
#define BATT_BUS_MAX_V    16
#define BATT_MAX_CURRENT  100
#define BATT_SHUNT_R      0.001
INA219 BATT_MONITOR(0x41); // Installed

#define LOAD_SHUNT_MAX_V  0.030 //30 amps * .001 ohms
#define LOAD_BUS_MAX_V    16
#define LOAD_MAX_CURRENT  30
#define LOAD_SHUNT_R      0.001
INA219 LOAD_MONITOR(0x40); // Installed

#define SOLAR_SHUNT_MAX_V  0.04 // ~8.9 amps * .001 ohms
#define SOLAR_BUS_MAX_V    32.0 // Solar panel maxV is 21.2V
#define SOLAR_MAX_CURRENT  20
#define SOLAR_SHUNT_R      0.001
INA219 SOLAR_MONITOR(0x45); // Installed
#endif

// Set up temperature sensors which are on a 'onewire' bus
OneWire oneWire(A8);
DallasTemperature sensors(&oneWire);

DeviceAddress OUT_TEMP_ADDR = {0x28, 0x1E, 0xBF, 0xDC, 0x06, 0x00, 0x00, 0xB4};
// If we are debugging temperature (test bench) we can substitute our test sensor
// address for the box temperature.

#ifdef DEBUG_SENSORS
// Test probe address
//DeviceAddress IN_TEMP_ADDR  = {0x28, 0x5F, 0x33, 0x92, 0x0B, 0x00, 0x00, 0xF9};
DeviceAddress IN_TEMP_ADDR  = {0x28, 0xF9, 0x57, 0x7B, 0x4F, 0x20, 0x01, 0xF3};
DeviceAddress BOX_TEMP_ADDR = {0x28, 0x8C, 0xCA, 0x68, 0x3A, 0x19, 0x01, 0x2E};
#else
// actual probe address
DeviceAddress IN_TEMP_ADDR  = {0x28, 0xFF, 0x06, 0xB2, 0x02, 0x17, 0x04, 0xEE};
DeviceAddress BOX_TEMP_ADDR = {0x28, 0xFF, 0x31, 0xAB, 0x31, 0x17, 0x03, 0x29};
#endif

// Keep track of energy (joules) used/produced
float ENERGY_SOLAR = 0.0;
float ENERGY_HYDRO = 0.0;
float ENERGY_USED      = 0.0;
//float ENERGY_GENERATED = 0.0;
// Battery capacity is 2 batteries with 125Ahr @ 12V. Convert to J
// 2 * 12 * 125 * 3600
// 10,800,000 J
//const unsigned long int BATT_TOTAL_CAPACITY = 10800000;
#ifdef DEBUG
#define BATT_TOTAL_CAPACITY 259200 //Test battery is smaller
#else
#define BATT_TOTAL_CAPACITY 10800000 
#endif
// The approximate battery energy
unsigned long int BATT_ENERGY = 0;

// Flags for indicating if the load is connected and if the state changed
// Must both be the same value (true or false) otherwise opens a file twice (TODO)
bool LOAD_ON_FLAG = true;
bool PREV_LOAD_STATE = true;
//************************** SD Card Stuff **********************************

const byte chipSelect = 53;
// Global variable containing the current filename
char *filename = (char *) malloc(15);
// the logging file
File LOG;


//************************** RPi Py talk stuff **********************************
#ifdef RPI_ENABLE
// size of the command buffer
const byte numChars = 14;
// command buffer
char receivedChars[numChars];
// Flag to indicate a full command has been parsed
bool newData = false;
bool STREAM_DATA_PY = false;

// tracking when to send data to py when stream is requested
elapsedMillis STREAM_DATA_ELAPSED;
const int STREAM_DATA_INTERVAL = 5000;
#endif


//************************** Other **********************************

// Flag is set by the watch dog timer (WDT)
bool WDT_FLAG = false;



//************************** Begin Functions **********************************

void setup() {

#ifdef RPI_ENABLE
    RPi_setup();
#else
#ifdef DEBUG
// Set the baud rate between the arduino and computer. 115200 is nice and fast!
    Serial.begin(115200);
#endif
#endif

   time_setup();
   analog_setup();
   SD_setup();
   
    // Watch Dog Timer (WDT) setup, used for sleeping
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
    WDT_FLAG = true;
}

void SYSTEM_HAULT(){
    // If the system has an error I can't handle, just give up on everything.
#ifdef DEBUG
     delay(10);
     debug_println("SYSTEM HAULT");
     delay(10);
#endif
    while(1){
     // **Contemplate Mistakes**
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    sleep_enable();
    sleep_mode();
    }
}


    // This function puts the arduino in a deep sleep to save power. 
    // Each nap takes about 8 seconds but don't rely on this being accurate.
void sleep(){  
#ifdef DEBUG 
    debug_println("Starting my nap");
    delay(10); // need this delay because we power down right away
#endif

    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    sleep_enable();
    sleep_mode(); // starts the nap
    sleep_disable(); 
    power_all_enable();

#ifdef DEBUG
    // need to let it warm up before writing 
    delay(10);
    debug_println("Finished my nap");
#endif

    setRTCtime();
} 

void loadsOnLoop(){

    // Evaluated first time this runs but then the variable is maintained between calls
    static unsigned long int previousHiResUnix = now() + HI_RES_LOGGING_INTERVAL;

    if( (unsigned long)(now() - previousHiResUnix) > HI_RES_LOGGING_INTERVAL ){
        previousHiResUnix = now();
        writeReadings();
    }

    if(ENERGY_TIME_ELAPSED > ENERGY_TIME_INTERVAL) energyUpdate();



#ifdef RPI_ENABLE
    // Parse data from RPiSerial
    if(RPiSerial.available()) readFromPy();
    // We found a command! Rock and roll!
    if(newData == true) readCmd();

    if(STREAM_DATA_PY == true){
        if(STREAM_DATA_ELAPSED > STREAM_DATA_INTERVAL){
            singleLiveData();
            STREAM_DATA_ELAPSED = 0;
        }
    }

#endif

}

void loadsOffLoop(){

    static unsigned long int previousLowResUnix = now();

    if( (unsigned long)(now() - previousLowResUnix) > LOW_RES_LOGGING_INTERVAL){
        previousLowResUnix = now();
        writeReadings();
    }else{
    sleep();
    }
}


void areLoadsConnected(){
    // Check to see if the loads are connected. Low means they are connected.

    // Static makes the value persist across multiple function calls
    static unsigned long int previousHiLowUnix = now();

    if(LOAD_MONITOR.shuntCurrent() > 0.5){
        previousHiLowUnix = now();
        LOAD_ON_FLAG = true;
    }else if( (unsigned long)(now() - previousHiLowUnix) >= LOAD_DEBOUNCE_INTERVAL_SEC ){
        LOAD_ON_FLAG = false;
    }
}

void loop() {

    areLoadsConnected();

    if(LOAD_ON_FLAG == true){ 
        if(PREV_LOAD_STATE == false){ 
            debug_println("Loads were just attached...");
            PREV_LOAD_STATE = true;
            ENERGY_TIME_ELAPSED = 0;
            HIRES_LOG_ELAPSED_MILLIS = 0;
            //estimateBattState();
        }

        loadsOnLoop();

    }else{ 
        if(PREV_LOAD_STATE == true){ // If the loads just stopped
            debug_println("Loads just disconnected");
            PREV_LOAD_STATE = false;
        }

        loadsOffLoop();

    }

    WDT_FLAG = false;
}
