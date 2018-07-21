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
const byte LOAD_DETECT = 0; // Pin 0
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
// Intervals used between readings/SD writes
int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode. One 'nap' is ~8sec long
// Used when in standby mode for long waits between writes
// use 37 naps for about 5min between SD writes, or 150 naps for ~20min. Note: not very accurate 
const int NUM_NAPS_BETWEEN_SD_WRITES = 2;

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

// see if the card is present and can be initialized:
    pinMode(SDmasterSelect, OUTPUT);
    digitalWrite(SDmasterSelect, LOW);
    //pinMode(52, OUTPUT); //slave select
    //if (!SD.begin(chipSelect, SPI_HALF_SPEED)) {
    if (!SD.begin(chipSelect)) {
        debug_println("Card failed, or not present");
    }else{
        debug_println("card initialized.");
    }

    //printRootDir();
#ifdef DEBUG
    //print out all files on the card
 //   LOG = SD.open("/");
 //   printDirectory(LOG, 0);
#endif

    // create a new file
    newFile();
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

void writeReadings(){
    // Take the various measurments and then write them to the SD card

    char dataBuff[150]; // Buffer used to output the sweet sweet data TODO set length to be reasonable
    char *data = dataBuff; // Pointer that points at the data buffer
    unsigned long time = now();

    // Create buffers to hold the data as a string and pass the variables to the function
    char BattV[10], SolarV[10], HydroV[10];
    readVoltages(BattV, SolarV, HydroV);

    // Create buffers to hold the data as a string and pass the variables to the function
    char LoadA[10], BattA[10], SolarA[10], HydroA[10];
    readAmps(LoadA, BattA, SolarA, HydroA);

    // For testing
    char outT[] = "10.1";
    char inT[]  = "21.5";
    char boxT[] = "23.3";
    int ENERGY_LEVEL = 121;

    // Merging and converting the data into one big string, 'data'
    sprintf(data, "%010lu,%s,%s,%s,%s,%s,%s,%s,%d,%s,%s,%s\n",
            time, BattV, SolarV, HydroV, LoadA, BattA, SolarA, HydroA, ENERGY_LEVEL, outT, inT, boxT);

    // Output the data to the serial port
    debug_print(filename);
    debug_print(": ");
    debug_println(data);

    // Open the current data file, ouput the data, and close it up again
    LOG = SD.open(filename, FILE_WRITE); 
    //if( !LOG.print(data) ) debug_println("Didn't print data");
    if( !LOG.print(data) ) debug_println("Didn't print data");
    LOG.flush();
    LOG.close();

    // reset the timmer used between SD card writes
    //SYSTEM_TIME_ELAPSED = 0;
    return;
}

void newFile(){
    // Create a new filename based on the time, close the old file, open a new one
    // and put a descriptive header at the top of the file

    // Filenames are created from the current UNIX time given in hexadecimal due to filename limitations
    // Fat32 limits file names to 8 characters plus a 3 character extension
    // Extensions are '.on' when the loads are connected. '.off' otherwise

    time_t t = now(); // Put the current unit time into variable t
    unsigned long unix = t;
    char buff[500]; // Create a buffer for the header text
    char *header = buff; // Pointer that points to the buffer

    // Create the header using the current time/date data TODO is the equation right?
    sprintf(header,
        "#Thanksgiving Cabin Power System\n"
        "#Time is in UNIX Time which is the number of seconds since 1970-Jan-01, "
        "filename is given in hexadecimal representation\n"
        "#To convert the date in cell 'A8' to an excel date serial number "
        "in Vancover time use:\n"
        "#=(A8/86400)+25569+(-7/24)\n"
        "#or Google it\n"
        "#Created: %04d-%02d-%02d at %02d:%02d:%02d or %010lu in UNIX time\n"
        "#Timestamp,Battery Voltage,Solar Voltage,Hydro Voltage,"
        "Battery Amps, Solar Amps,Hydro Amps,Load Amps,Battery Energy State,"
        "Outside Temp,Cabin Temp,Battery Temp\n", year(t), month(t), day(t), hour(t), minute(t), second(t), t);
    
    // Create the new filename including the system state
    if(LOAD_ON_FLAG == TRUE){
    sprintf(filename, "%8lx.ON", unix); // format option 'lx' is for a 'long hex' 
    }else{
    sprintf(filename, "%8lx.OFF", unix);
    debug_println(filename);
    }

    // Make sure any open files are closed
    LOG.close();

    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        LOG = SD.open(filename, FILE_WRITE); 
    }else{debug_println("filename already exists");}
    if (! LOG) {
        debug_println("couldnt create file");
    }

    if(LOG){
        debug_println("Opened LOG for writing...");
        // Put the header at the top of the file
        LOG.print(header);
        LOG.flush();

        //debug_println(filename);
        // Close the old file
        LOG.close();
    }else{
        debug_println("unable to open LOG");
    }

    debug_println("New filename created");
    debug_println(filename);

    return;

}//newFile

void loop() {

    writeReadings(); // Write readings to SD card
    for(int i = 0;i<5;i++){
        //testVoltage();
        humanTime(); // Print the human readable time
        // Output if the GPS is sleeping or not.
        GPS_SLEEP_FLAG ? debug_println("GPS is asleep") : debug_println("GPS is awake and workin'");
        delay(1000);
    }
}
