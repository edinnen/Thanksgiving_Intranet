/*
Thanksgiving Cabin Power System Monitor

A magical device that monitors important data produced at the Thanksgiving cabin
This software goes along with an Arduino based datalogging system which can
track power and temMperature data to an SD card. 

Developed by Stuart de Haas along with help from many great people. Specific 
thanks to Stuart Taylor. Hey Stuart!

Created: October, 2017
First kinda working version: 22 July, 2018
Last Modified: 27 March, 2020

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

// Comment out to use actual temperature sensors
//#define DEBUG_TEMPERATURE

// Comment out line to disable RPi Serial communication
#define RPI_ENABLE 

// Debug macro. If DEBUG is defined, debug functions will be replaced with
//output to the USB serial. Otherwise they will be skipped.

#define DEBUG 

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
RTC_PCF8523 rtc;

const unsigned int RTC_SYNC_INTERVAL = DEBUG_SPEEDUP_TIME ? 10 : 60; // How frequently to update time with RTC

// elapsedMillis creates a background timer that constantly counts up. Much better to use these
// timers than to use a delay. Does not work while asleep so make sure to reset after sleeping
// system interval timer. Used to time SD card writes
elapsedMillis SYSTEM_TIME_ELAPSED;
// Energy time is used to decide when to take measurments only used for energy
// tracking. Not logged to SD card
elapsedMillis ENERGY_TIME_ELAPSED;

// Intervals used between readings/SD writes when loads disconnected
// We put the arduino to sleep when loads are off so can't use timers.
// Could use the RTC but counting naps is fine. //TODO no it's not fine
int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode (loads disconnected). One 'nap' is ~8sec long
// use 37 naps for about 5min between SD writes, or 150 naps for ~20min. Note: not very accurate 
const int NUM_NAPS_BETWEEN_SD_WRITES = DEBUG_SPEEDUP_TIME ? 2 : (10*60)/8; 
// This interval is used when loads are connected. It is generally higher resolution
const int LOAD_INTERVAL = DEBUG_SPEEDUP_TIME ? 5*1000 : 10*1000; //milliseconds
// Number of seconds between readings used to track power and energy usage
const int ENERGY_TIME_INTERVAL = 1000;

//************************** Analog Stuff **********************************

// Information used to configure the INA219 power measurment ICs
// At the time of writing, both ICs will use an equivalent shunt with a resistance of 0.001 Ohms. The only difference is the max current rating but I'm pretty sure there is no actual difference.
// Additional configuration is done in the setup function
#define BATT_SHUNT_MAX_V  0.1
#define BATT_BUS_MAX_V    16
#define BATT_MAX_CURRENT  100
#define BATT_SHUNT_R      0.001
// Create a battery monitor object with the I2C address. No solder jumpers = 0x40
INA219 BATT_MONITOR(0x40);

#define LOAD_SHUNT_MAX_V  0.05
#define LOAD_BUS_MAX_V    16
#define LOAD_MAX_CURRENT  50
#define LOAD_SHUNT_R      0.001
// Create a load monitor object with the I2C address. Solder on A0 = 0x41
INA219 LOAD_MONITOR(0x41);

#define SOLAR_SHUNT_MAX_V  0.05
#define SOLAR_BUS_MAX_V    26
#define SOLAR_MAX_CURRENT  50
#define SOLAR_SHUNT_R      0.001
// Create a solar monitor object with the I2C address. Solder on A0 = 0x41
INA219 SOLAR_MONITOR(0x41);

// Keep track of energy (joules) used/produced
float ENERGY_GENERATED = 0.0;
float ENERGY_USED      = 0.0;
// Battery capacity is 2 batteries with 125Ahr @ 12V. Convert to J
// 2 * 12 * 125 * 3600
// 10,800,000 J
const unsigned long int BATT_TOTAL_CAPACITY =10800000;
// The approximate battery energy
unsigned long int BATT_ENERGY = 0;

// Flags for indicating if the load is connected and if the state changed
// Must both be the same value (true or false) otherwise opens a file twice (TODO)
bool LOAD_ON_FLAG = TRUE;
bool PREV_LOAD_STATE = TRUE;
//************************** SD Card Stuff **********************************

const byte chipSelect = 10;
// Global variable containing the current filename
// I had to 'malloc' it to keep it from disapearing. Stupid shit
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
byte WDT_FLAG = FALSE;

// Set up temperature sensors which are on a 'onewire' bus
#define ONE_WIRE_BUS 34
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

DeviceAddress OUT_TEMP_ADDR = {0x28, 0x1E, 0xBF, 0xDC, 0x06, 0x00, 0x00, 0xB4};
DeviceAddress IN_TEMP_ADDR  = {0x28, 0xFF, 0x06, 0xB2, 0x02, 0x17, 0x04, 0xEE};
// If we are debugging temperature (test bench) we can substitute our test sensor
// address for the box temperature.

#ifdef DEBUG_TEMPERATURE
// Test probe address
DeviceAddress BOX_TEMP_ADDR {0x28, 0x5F, 0x33, 0x92, 0x0B, 0x00, 0x00, 0xF9};
#else
// actual probe address
DeviceAddress BOX_TEMP_ADDR {0x28, 0xFF, 0x31, 0xAB, 0x31, 0x17, 0x03, 0x29};
#endif

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
   //setWrongTime();

   
    // Watch Dog Timer (WDT) setup
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

    // Setting the 'Sleep Mode Control Register' or SMCR
    // SMCR = ----010- is Power-Down mode
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    // Sleep enable: SMCR = -------1
    sleep_enable();

    // Power reduction register 0; shut down ADC PRR0 = -------1
    // Probably need to research more into power reduction...

    // Now enter sleep mode.
    sleep_mode();
    // Wakes up here then goes back to start and sleeps more
    }
}


    // This function puts the arduino in a deep sleep to save power. 
    // Each nap takes about 8 seconds but don't rely on this being accurate.
void sleep(){  
#ifdef DEBUG 
    debug_println("Starting my nap");
    delay(10); // need this delay because we power down right away
#endif

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

#ifdef DEBUG
    // need to let it warm up before writing 
    delay(10);
    debug_println("Finished my nap");
#endif

    NUM_NAPS_TAKEN++; // We took a nap so update the counter
} // sleep()

void loadConnected(){

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

    // Update the energy state every interval
    if(ENERGY_TIME_ELAPSED > ENERGY_TIME_INTERVAL) energyUpdate();

    // Write to the SD card every 'LOAD_INTERVAL'
    if(SYSTEM_TIME_ELAPSED > LOAD_INTERVAL) writeReadings();

}

void standby(){
    // This function is called each time the arduino wakes up from a nap during 'standby'
    // Standby is activated when the loads are disconected indicating that the cabin is shut down

    // Write to the SD card every 'STANDBY_INTERVAL'
    if(NUM_NAPS_TAKEN >= NUM_NAPS_BETWEEN_SD_WRITES){//TODO
        //energyUpdate();
        writeReadings();
        NUM_NAPS_TAKEN = 0;
    }else{
    sleep();
    }
}//standby


//TODO
void areLoadsConnected(){
    // Check to see if the loads are connected. Low means they are connected.
    LOAD_ON_FLAG = digitalRead(LOAD_DETECT_PIN) ? 0 : 1;
}

void loop() {

    areLoadsConnected();

    if(LOAD_ON_FLAG == TRUE){ // If the load switch is 'on'
        if(PREV_LOAD_STATE == FALSE){ // If the loads were just attached
            debug_println("Loads were just attached...");
            estimateBattState();
            newFile(); 
            ENERGY_TIME_ELAPSED = 0; // Reset the clock used for energy measurments
            SYSTEM_TIME_ELAPSED = 0;
            PREV_LOAD_STATE = TRUE; // Reset the previous state flag
        } // if( Loads just attached )

        loadConnected();
    }else{ // if the load is not connected, system is in standby
        if(PREV_LOAD_STATE == TRUE){ // If the loads were just disconnected
            debug_println("Loads just disconnected");
            newFile(); // Create a new file
    // Set battery ENERGY_LEVEL to a undefined value to indicate it is not being tracked anymore
            BATT_ENERGY = 1; 
            PREV_LOAD_STATE = FALSE;
        }
        standby();
    }

    if(WDT_FLAG == TRUE){
        WDT_FLAG = FALSE;
    }
}
