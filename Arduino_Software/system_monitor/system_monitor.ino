/*
Thanksgiving Cabin Power System Monitor

Ardunio-based system to be used to monitor power generation and use at
the Thanksgiving Cabin.

Donated by the UVic Caving Club
Created: 2017-09-30
Stuart de Haas
stuartdehaas@gmail.com
*/

#include <SPI.h> // For SPI communication /TODO do I need this?
#include <SD.h> // SD Card library
#include <Wire.h> // Used for serial communication TODO do I need this?
#include "RTClib.h" //Real Time Clock library. Must be downloaded manually. https://github.com/adafruit/RTClib
#include "elapsedMillis.h" //Used for monitoring the elapsed time. Downloaded manually. https://playground.arduino.cc/Code/ElapsedMillis#source
#include <avr/sleep.h> //for sleeping
#include <avr/power.h> //for sleeping deep
#include <avr/wdt.h> //for waking up

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
#define TRUE 1


//Using an external voltage reference (LM4040) 
#define AREF_VOLT 4.096 
#define SERIAL_DELAY 5 // Delay after each serial output
#define ANALOG_READ_DELAY 10 // Delay between analog reads. Lets the ADC settle down. Not needed?

// Battery voltage considered low. System behaviour will change below this value
#define BATT_VOLT_LOW 1200 

#define RED_LED_PIN 3
#define GREEN_LED_PIN 4

#define NUM_TO_AVERAGE 10 // Number of readings to use in the sensor moving average
byte ITTERATOR = 0; // Which reading is being updated this round on the moving average

// Flag is set by the watch dog timer (WDT)
byte WDT_FLAG = FALSE;

// Flags for indicating if the load is connected and if the state changed
bool LOAD_ON_FLAG = FALSE;
bool PREV_LOAD_STATE = FALSE;

// Flags used to determine types of output to produce
//byte DATA_STREAM = FALSE; // Stream data to RPi


// Global variable containing the current filename
// I had to 'malloc' it to keep it from disapearing. Stupid shit
char *filename = (char *) malloc(15);

// The calculated reference voltage used in ADC. Determined with external reference
// This is the voltage of the input to the arduino. Nominally 5V (5000mV)
int VOLT_CALIBRATION = 5000;

const byte NUM_VOLT_SOURCES = 3; //number of voltage sources
const byte NUM_AMP_SOURCES = 4; // number of current sources

// Arrays for holding the readings used in the moving average
int VOLT_READINGS[NUM_VOLT_SOURCES][NUM_TO_AVERAGE];
int AMP_READINGS[NUM_AMP_SOURCES][NUM_TO_AVERAGE];

// System Order: Load, Batt, Solar, Hydro //TODO
const byte VOLT_PIN[] = {A12, A13, A14}; // Pin A12 == 66
const byte LOAD_DETECT = 0; // Pin 0
const byte AMP_PIN[] = {A8, A9, A10, A11}; // Pin A8 == 62
// Voltages are read in cV and currents in cA to avoid floating point numbers
// 1 V = 100 cV. Think meters and centimeters (1m = 100cm) //TODO confirm I need to use cV (not mV)
// Voltage is calculated with this equation: reading * (4096mV/[reference voltage reading]) 
//                                              * [voltage divider multiplyer] = [actual voltage in mV]
// It's been simplified to avoid floats and interger overflow as: 
//      reading * [VOLT_MULTI] / [reference voltage reading] = [Actual Voltage]
//  Where VOLT_MULTI is just the voltage divider multiplier times the reference voltage in mV
const unsigned long VOLT_MULTI[] = {50602ul, 30048ul, 15876ul, 15876ul}; //Voltage divider multiplier
// Actual Current = (reading - AMP_DC_OFFSET)*MULTI
// AMP_MULTI = 1/([calibrated gain]/10)*4096 * [Number of physical wire turns in sensor]. 

// Current sensors are independently tested and have calibrations. 
// S/N = {B1720096, B1720089, B1720090, B1720091} Need to be installed the the correct location!!!!
const unsigned int AMP_DC_OFFSET[] = {508, 510, 510, 507}; //TODO calibrate myself
const unsigned long AMP_MULTI[] = {252839ul, 269474ul * 3, 248242ul * 3, 269474ul * 3}; 

//Address of temperature sensors
// TODO
const unsigned byte NUM_TEMPS = 3;
const unsigned int TEMP_ADDRESS[] = {1234, 5678, 9101};

// Intervals used between readings/SD writes
int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode. One 'nap' is ~8sec long
// Used when in standby mode for long waits between writes
// use 37 naps for about 5min between SD writes, or 150 naps for ~20min. Note: not very accurate 
const int NUM_NAPS_BETWEEN_SD_WRITES = 2;
const int LOAD_INTERVAL = 2000; //milliseconds
const int ENERGY_INTERVAL = 500;

// Energy Level of the system in joules. Indicates the current system energy deficet.
// ENERGY_LEVEL == 0 indicates a full battery, 5400000 is empty. Never go there!
unsigned int ENERGY_LEVEL = 0;

// elapsedMillis creates a background timer that constantly counts up. Much better to use these
// timers than to use a delay. Does not work while asleep so make sure to reset after sleeping
// Energy measurments timer. Used to time measurments 
elapsedMillis ENERGY_TIME_ELAPSED;
// system interval timer. Used to time SD card writes
elapsedMillis SYSTEM_TIME_ELAPSED;


// chip select pin is 53 TODO
const byte chipSelect = 10;
// the logging file
File LOG;

void setup() {

#ifdef DEBUG
    // Set the baud rate between the arduino and computer. 115200 is nice and fast!
    // This is the debug serial output
    Serial.begin(115200);
#endif
    time_setup(); // Setup time keeping



    // Set file timestamps using a function pointer to call the function. Dumb shit
    SdFile::dateTimeCallback(dateTime); //TODO what?

    pinMode(RED_LED_PIN, OUTPUT);
    pinMode(GREEN_LED_PIN, OUTPUT);

    //Using an external voltage reference for increased accuracy
    //analogReference(EXTERNAL);
    analogRead(0); //To help settle the ADC before taking readings

    // WDT setup
    cli(); //disable interrupts
    wdt_reset();
    // Enter 'Config mode'
    WDTCSR |= (1<<WDCE) | (1<<WDE);
    // Set interupts, reset on timeout, last 4 do time (1001 is 8sec)
    WDTCSR = (1<<WDIE) | (0<<WDE) | (1<<WDP3) | (0<<WDP2) | (0<<WDP1) | (1<<WDP0);
    sei(); //enable interupts

    // initialize the SD card
    debug_println("Initializing SD card...");
    // make sure that the default chip select pin is set to
    // output, even if you don't use it:
    pinMode(chipSelect, OUTPUT);

    // see if the card is present and can be initialized:
    if (!SD.begin(chipSelect)) {
        debug_println("Card failed, or not present");
    }
    debug_println("card initialized.");

    printRootDir();
#ifdef DEBUG
    //print out all files on the card
 //   LOG = SD.open("/");
 //   printDirectory(LOG, 0);
#endif

    // create a new file
    newFile();

}//setup

ISR(WDT_vect){
    // The system is woken up from sleep by the 'watch dog timer' WDT which is an interupt
    // After interupt, the script goes here
  //wdt_disable();  // disable watchdog
    WDT_FLAG = TRUE;
}

void sleep(){  
    debug_println("Starting my nap");
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
    debug_println("Finished my nap");
    NUM_NAPS_TAKEN++; // We took a nap so update the counter
  } 

int* readVoltage(){ // TODO
    // The voltages are read inside this function
    int voltReadings[NUM_VOLT_SOURCES][NUM_TO_AVERAGE];
    static int voltOutput[NUM_VOLT_SOURCES]; // Static so I can share it externally
    calibrate();

    for(int i=0; i<NUM_TO_AVERAGE; i++){
        for(int j=0; j<NUM_VOLT_SOURCES; j++){
            voltReadings[j][i] = analogueRead(VOLT_PIN[j]);
        }
    }
    for(int i=0; i<NUM_VOLT_SOURCES; i++){
        voltOutput[i] = voltReadings[i][0];
        for(int j=1; j<NUM_TO_AVERAGE; j++){
            voltOutput[i] += voltReadings[i][j];
        }
        voltOutput[i] = voltOutput[i]/NUM_TO_AVERAGE;
    }
    return voltOutput;
}// readVoltage

int* readAmp(){ //TODO
    // The currents are read inside this function
    int ampReadings[NUM_AMP_SOURCES][NUM_TO_AVERAGE];
    static int ampOutput[NUM_AMP_SOURCES]; // Static so I can share it externally
    calibrate();

    for(int i=0; i<NUM_TO_AVERAGE; i++){
        for(int j=0; j<NUM_AMP_SOURCES; j++){
            ampReadings[j][i] = analogueRead(AMP_PIN[j]);
        }
    }
    for(int i=0; i<NUM_AMP_SOURCES; i++){
        ampOutput[i] = ampReadings[i][0];
        for(int j=1; j<NUM_TO_AVERAGE; j++){
            ampOutput[i] += ampReadings[i][j];
        }
        ampOutput[i] = ampOutput[i]/NUM_TO_AVERAGE;
    }
    return ampOutput;
}//readAmp

int* readTemp(){
    //TODO
    // Reads the temperature from the three temperature sensors
    debugOut("readTemp");
    static int temps[3] = {0,0,0};
    #if TEST
        for(int i=0; i<NUM_TEMPS; i++){
            temps[i] = 2030+i;
        }
        return temps;
    #endif

    for(int i=0; i<NUM_TEMPS; i++){
        //do something
    }
    return temps;
}//readTemp

unsigned long readTime(){
    // Reads the time off the RTC and returns
    debugOut("readTime");
    DateTime now = RTC.now();
    return now.unixtime();
}//readTime

byte * intToString(int num){
    // Converts a 4 digit integer to a string representation of the floating point value after 
    // conversion. i.e. convert 1200 centiVolts to 12.00 Volts (as a string)
    static byte buff[6];
    byte *str = buff;
    sprintf(str, "%02d.%02d", (num/100), num%100);
    return str;
}

void writeReadings(){
    // Take the various measurments and then write them to the SD card

    byte dataBuff[90]; // Buffer used to output the sweet sweet data
    byte *data = dataBuff; // Pointer that points at the data buffer
    int *voltages, *amps, *temps; //create pointers to point at arrays of data
    unsigned long time;

    voltages = readVoltage();
    amps = readAmp();
    temps = readTemp();
    time = readTime();
    //printArray(voltages, 4);
    //printArray(amps, 4);
    //printArray(temps, 3);
    //debugOut(time);

    // Merging and converting the data into one big string
    sprintf(data, "%010lu,%s,%s,%s,%s,%s,%s,%s,%s,%d,%s,%s,%s\n",
            time, intToString(voltages[0]), intToString(voltages[1]), intToString(voltages[2]), intToString(voltages[3]), intToString(amps[0]), intToString(amps[1]), intToString(amps[2]), intToString(amps[3]), ENERGY_LEVEL, intToString(temps[0]), intToString(temps[1]), intToString(temps[2]));

    // Output the data to the serial port
    debugOut(filename);
    debugOut(data);

    // Open the current data file, ouput the data, and close it up again
    LOG = SD.open(filename, FILE_WRITE); 
    if( !LOG.print(data) ) debugOut("Didin't print data");
    LOG.close();

    // reset the timmer used between SD card writes
    SYSTEM_TIME_ELAPSED = 0;
    return;
}

void newFile(){
    // Create a new filename based on the time, close the old file, open a new one
    // and put a descriptive header at the top of the file

    // Filenames are created from the current UNIX time given in hexadecimal due to filename limitations
    // Fat32 limits file names to 8 characters plus a 3 character extension
    // Extensions are '.on' when the loads are connected. '.off' otherwise

    DateTime now = RTC.now();
    unsigned long unix   = now.unixtime();
    int year   = now.year();
    int month  = now.month();
    int day    = now.day();
    int hour   = now.hour();
    int minute = now.minute();
    int second = now.second();

    char buff[500];
    char *header = buff;
    // Create the header using the current time/date data
    sprintf(header,
        "#Thanksgiving Cabin Power System\n"
        "#Time is in UNIX Time which is the number of seconds since 1970-Jan-01, "
        "filename is given in hexadecimal representation\n"
        "#To convert the date in cell 'A8' to an excel date serial number "
        "in Vancover time use:\n"
        "#=(A8/86400)+25569+(-7/24)\n"
        "#or Google it\n"
        "#Created: %04d-%02d-%02d at %02d:%02d:%02d or %010lu in UNIX time\n"
        "#Timestamp,Battery Voltage,Solar Voltage,Hydro Voltage,Load Voltage,"
        "Battery Amps, Solar Amps,Hydro Amps,Load Amps,Battery Energy State,"
        "Outside Temp,Cabin Temp,Battery Temp\n", year, month, day, hour, minute, second, unix);
    
    // Create the new filename including the system state
    if(LOAD_ON_FLAG == TRUE){
    sprintf(filename, "%8lx.ON", unix); // format option 'lx' is for a 'long hex' 
    }else{
    sprintf(filename, "%8lx.OFF", unix);
    }

    // Make sure any open files are closed
    LOG.close();

    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        LOG = SD.open(filename, FILE_WRITE); 
    }else{debugOut("filename already exists");}
    if (! LOG) {
        debugOut("couldnt create file");
    }

    // Put the header at the top of the file
    LOG.print(header);

    //debugOut(filename);
    // Close the old file
    LOG.close();

    debugOut("New filename created");
    debugOut(filename);

    return;

}//newFile

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
     //   delay(1000);
    }
}//standby

void loadConnected(){

    // If there is serial data waiting, goto function
    if(Serial.available()) pythonTalk(); 

    // Update the energy state every interval
    if(ENERGY_TIME_ELAPSED > ENERGY_INTERVAL) energyUpdate(); 

    // Write to the SD card every 'LOAD_INTERVAL'
    if(SYSTEM_TIME_ELAPSED > LOAD_INTERVAL) writeReadings();

    // TODO add serial monitoring
}

void error(char mess[]){
    // TO DO
    debugOut(mess);
    digitalWrite(RED_LED_PIN, HIGH);
    delay(500);
    digitalWrite(GREEN_LED_PIN, HIGH);
    delay(500);
}//error

void printArray(float array[], int arraySize){
    // Probably not needed anymore
    for(int i=0; i<arraySize; i++){
        Serial.println(array[i]);
        Serial.flush();
        //delay(SERIAL_DELAY);
    }
}

void debugOut(char output[]){
    // Only output debug info if the DEBUG_STREAM flag is set
    if(DEBUG_STREAM == TRUE){
        Serial.print("DEBUG: ");
        Serial.println(output);
        Serial.flush();
    }
    return;
}

void energyUpdate(){
    // Update the current energy level of the battery by performing power tracking
    // Energy level in this context means the amount of energy that has been used from the 
    // full battery. i.e. ENERGY_LEVEL == 0 means the battery is full. The value will always
    // be ENERGY_LEVEL <= 0 since once the battery is full it will stop charging.
    // Energy level is kept in kilojoules (kJ)

    int *voltages, *amps; //create pointers to point at data

    // Collect power data
    voltages = readVoltage();
    amps = readAmp();

    for(int i=0; i<NUM_SOURCES; i++){
        // Energy (Joules) = Power (watts) * time (seconds) = volts * amps * seconds
        // Number is calculated in a dumb way to avoid interger overflow and the use 
        // of floating point numbers
        ENERGY_LEVEL += ((long)(((unsigned long)voltages[i] * (unsigned long)ENERGY_TIME_ELAPSED)/10000) * (long)amps[i] ) / 1000;

    }
    ENERGY_TIME_ELAPSED = 0; // Reset the timer between readings

    // We can never have the ENERGY_LEVEL be greater than 0 (battery full) 
    if(ENERGY_LEVEL > 0) ENERGY_LEVEL = 0;

}// energyUpdate()

void test(){
    // Obsolite

    int *voltages, *amps, *temps; //create pointers to point at data
    int time;

    voltages = readVoltage();
    amps = readAmp();
    temps = readTemp();
    time = readTime();
    //printArray(voltages, 4);
    //printArray(amps, 4);
    //printArray(temps, 3);
    //debugOut(time);
    debugOut("Old filename:");
    debugOut(filename);
    newFile();
    debugOut("New filename:");
    debugOut(filename);
    delay(2000);
    //sleep();
    return;
}

void printRootDir(){
    File root = SD.open("/");

    debugOut("List files in root directory:");
    while (true) {
        File entry = root.openNextFile();
        if(! entry){
            // No more files
            break;
        }
        Serial.println(entry.name());
        Serial.flush();
        //debugOut(entry.name());
        //Serial.println(entry.name());
        //Serial.print("\t\t");
        //Serial.println(entry.size(), DEC);
        entry.close();
    }
    debugOut("Thats all of them!");
}

void dateTime(uint16_t* date, uint16_t* time) {
    // A callback function used to set the time for files created on the SD card
    DateTime now = RTC.now();
    // return date using FAT_DATE macro to format fields
    *date = FAT_DATE(now.year(), now.month(), now.day());
    // return time using FAT_TIME macro to format fields
    // 5 hours are added to adjust to Vancouver timezone
    *time = FAT_TIME((now.hour() + 5), now.minute(), now.second());
}

void dumpFile(){
    debugOut("dumpFile");
    Serial.println("poopy butt holes"); // Helps make it work for some reason
    Serial.flush();

    char mess[17];
    int i = 0;

    //delay(SERIAL_DELAY);
    while(Serial.available()){
        mess[i] = Serial.read();
        i++;
        if(i>=15) break;
    }
    mess[i] = '\0'; // NULL terminate the string

    //debugOut(mess);
    //Serial.println(mess);
    //Serial.flush();
    //delay(SERIAL_DELAY);
    if(!SD.exists(mess)){
        Serial.println("mess Doesn't exist");
        Serial.flush();
        return;
    }
    File dataFile = SD.open(mess);
    if(dataFile){
        while(dataFile.available()){
            Serial.write(dataFile.read());
        }
    dataFile.close();
    }else{
        debugOut("Error opening file");
    }
    return;
}

void pythonTalk(){
    // Used to talk to the python script
    debugOut("pythonTalk");
    Serial.flush();
    char mess[2];
    mess[0] = Serial.read(); // Read in the first byte of data. This indicates the command

    switch(mess[0]){
        case '0':
            dumpFile();
            Serial.flush();
            break;
        case '1':
            debugOut("data stream toggled");
            DATA_STREAM = !DATA_STREAM; // toggle if we stream data or not
            Serial.flush();
            break;
        case '2':
            debugOut("debug stream toggled");
            DEBUG_STREAM = !DEBUG_STREAM; // toggle the debug serial output
            Serial.flush();
            break;
        case '3':
            printRootDir();
            Serial.flush();
            break;
        default:
            debugOut("Undefined control byte");
            break;
    }

}


void loop() {

    //test();

    if(LOAD_ON_FLAG == TRUE){ // If the load switch is 'on'
        if(PREV_LOAD_STATE == FALSE){ // If the loads were just attached
            newFile(); // Create a new file
            int *voltages = readVoltage();
            if(voltages[0] < 1300){
                // If the current battery voltage is less that 13volts then the starting level
                // is less than 0kJ. The following is an approximation of energy level based only
                // on the battery voltage. Its not super accurate
                ENERGY_LEVEL = ((3600*voltages[0])/100 - 46800);
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
