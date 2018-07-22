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
const unsigned int GPS_SYNC_INTERVAL = 60*3; // How frequenty to update time with GPS
const unsigned int RTC_SYNC_INTERVAL = 30; // How frequently to update time with RTC

// elapsedMillis creates a background timer that constantly counts up. Much better to use these
// timers than to use a delay. Does not work while asleep so make sure to reset after sleeping
// Energy measurments timer. Used to time measurments 
elapsedMillis ENERGY_TIME_ELAPSED;
// system interval timer. Used to time SD card writes
elapsedMillis SYSTEM_TIME_ELAPSED;

// Intervals used between readings/SD writes
int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode. One 'nap' is ~8sec long
// Used when in standby mode for long waits between writes
// use 37 naps for about 5min between SD writes, or 150 naps for ~20min. Note: not very accurate 
const int NUM_NAPS_BETWEEN_SD_WRITES = 2;
const int LOAD_INTERVAL = 2000; //milliseconds
const int ENERGY_INTERVAL = 500;

//************************** Analog Stuff **********************************

// Using an external voltage reference to increase accuracy. The reference is used to calculate the
// actual voltage supplied to the arduino (which is used in the ADC).
// Reference used is the LM4040 with a voltage of 4.096V +/- 1%
// This is the voltage of the input to the arduino. Nominally 5V (5000mV)
float VOLT_CALIBRATION = 5.0;
const byte REF_PWR_PIN = 9; // LM4040 is powered from a pin so it can be powered down when not in use
const byte REF_READ_PIN = A0;

const byte NUM_VOLT_SOURCES = 3; //number of voltage sources
const byte NUM_AMP_SOURCES = 4; // number of current sources

// System Order: Load, Batt, Solar, Hydro //TODO
const byte VOLT_PIN[] = {A12, A13, A14}; // Pin A12 == 66
const byte LOAD_DETECT_PIN = 0; // Pin 0
const byte AMP_PIN[] = {A8, A9, A10, A11}; // Pin A8 == 62

// System voltages are read using voltage dividers to bring them into the range readable by the arduino (0-5V)
// Batt:  R1=2670, R2=7680, multiplyer is  3.8764. Max voltage allowed on input is then: 19.4V
// Solar: R1=1400, R2=8870, multiplyer is  7.3367. Max voltage allowed on input is then: 36.7V
// Hydro: R1=820,  R2=9310, multiplyer is 12.3537. Max voltage allowed on input is then: 61.8V
const float VOLT_MULTI[] = {3.8764, 7.3357, 12.3537}; //Voltage divider multiplier

// System currents are read using non-invasive current sensors. 
// 0amps is at ~1/2*input voltage so a DC offset is applied
// DC offset is calculated as (512 - (2.5-[volt reading at 0amps])/(5/1024))
// AMP_MULTI is calculated as:
// (5/1024)*(1/[calibrated volt/10amp from data sheet]/10) / [number of physical wire turns in sensor]
// Actual Current = (reading - AMP_DC_OFFSET)*AMP_MULTI
// Current sensors are independently tested and have calibrations. 
// System Order: Load, Batt, Solar, Hydro
// S/N = {B1720096, B1720089, B1720090, B1720091} Need to be installed the the correct location!!!!
const int AMP_DC_OFFSET[] = {516, 514, 514, 517}; //TODO calibrate myself
//const unsigned long AMP_MULTI[] = {252839ul, 269474ul * 3, 248242ul * 3, 269474ul * 3}; 
const float AMP_MULTI[] = {(5.0/1024.0*(1/0.0152)),(5.0/1024.0*(1/0.0152))/ 3.0,(5.0/1024.0*(1/0.0152))/ 3.0,(5.0/1024.0*(1/0.0152))/ 3.0}; 

// Flags for indicating if the load is connected and if the state changed
bool LOAD_ON_FLAG = FALSE;
bool PREV_LOAD_STATE = FALSE;
//************************** SD Card Stuff **********************************

// chip select pin is 53 
const byte chipSelect = 53;
const byte SDmasterSelect = 48;
// Global variable containing the current filename
// I had to 'malloc' it to keep it from disapearing. Stupid shit
char *filename = (char *) malloc(15);
// the logging file
File LOG;

//************************** Other **********************************

// Flag is set by the watch dog timer (WDT)
byte WDT_FLAG = FALSE;

unsigned int ENERGY_LEVEL = 0;



//************************** Begin Functions **********************************

void setup() {
#ifdef DEBUG
    // Set the baud rate between the arduino and computer. 115200 is nice and fast!
    Serial.begin(115200);
#endif
   time_setup();
   analog_setup();
   SD_setup();
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

    NUM_NAPS_TAKEN++; // We took a nap so update the counter
} // sleep()

void loadConnected(){

    // If there is serial data waiting, goto function
    //if(Serial.available()) pythonTalk(); 

    // Update the energy state every interval
    if(ENERGY_TIME_ELAPSED > ENERGY_INTERVAL) energyUpdate(); 

    // Write to the SD card every 'LOAD_INTERVAL'
    if(SYSTEM_TIME_ELAPSED > LOAD_INTERVAL) writeReadings();

    // TODO add serial monitoring
}

void standby(){
    // This function is called each time the arduino wakes up from a nap during 'standby'
    // Standby is activated when the loads are disconected indicating that the cabin is shut down

    // Write to the SD card every 'STANDBY_INTERVAL'
    if(NUM_NAPS_TAKEN >= NUM_NAPS_BETWEEN_SD_WRITES){
        //energyUpdate();
        writeReadings();
        NUM_NAPS_TAKEN = 0;
    }else{
    sleep();
    }
}//standby

void test(){

    writeReadings(); // Write readings to SD card
    for(int i = 0;i<5;i++){
        //testVoltage();
        humanTime(); // Print the human readable time
        // Output if the GPS is sleeping or not.
        GPS_SLEEP_FLAG ? debug_println("GPS is asleep") : debug_println("GPS is awake and workin'");
        delay(1000);
    }

}

void areLoadsConnected(){
    // Check to see if the loads are connected. Low means they are connected.
    LOAD_ON_FLAG = digitalRead(LOAD_DETECT_PIN) ? 0 : 1;
}

void loop() {

    areLoadsConnected();

    if(LOAD_ON_FLAG == TRUE){ // If the load switch is 'on'
        if(PREV_LOAD_STATE == FALSE){ // If the loads were just attached
            newFile(); // Create a new file
            float volts[3];
            readVoltages(volts);
            if(volts[0] < 1300){
                // If the current battery voltage is less that 13volts then the starting level
                // is less than 0kJ. The following is an approximation of energy level based only
                // on the battery voltage. Its not super accurate
                ENERGY_LEVEL = ((3600*volts[0])/100 - 46800);
            }else{ENERGY_LEVEL = 0; // Otherwise assume it is fully charged
            }
            ENERGY_TIME_ELAPSED = 0; // Reset the clock used for energy measurments
            SYSTEM_TIME_ELAPSED = 0;
            PREV_LOAD_STATE = TRUE; // Reset the previous state flag
        } // if( Loads just attached )

        loadConnected();
    }else{ // if the load is not connected, system is in standby
        if(PREV_LOAD_STATE == TRUE){ // If the loads were just disconnected
            //TODO
            newFile(); // Create a new file
    // Set battery ENERGY_LEVEL to a undefined value to indicate it is not being tracked anymore
            ENERGY_LEVEL = 1; 
            PREV_LOAD_STATE = FALSE;
        }
        standby();
    }

    if(WDT_FLAG == TRUE){
        WDT_FLAG = FALSE;
    }
}
