/*
Thanksgiving Cabin Power System Monitor

Ardunio-based system to be used to monitor power generation and use at
the Thanksgiving Cabin.

Donated by the UVic Caving Club
Created: 2017-09-30
Stuart de Haas
stuartdehaas@gmail.com
*/

#include <SPI.h> // For SPI communication
#include <SD.h> // SD Card library
#include <Wire.h> // Used for serial communication
#include "RTClib.h" //Real Time Clock library. Must be downloaded manually
#include "elapsedMillis.h" //Used for monitoring the elapsed time. Downloaded manually
#include <avr/sleep.h> //for sleeping
#include <avr/power.h> //for sleeping deep
#include <avr/wdt.h> //for waking up

#define FALSE 0
#define TRUE 1
#define AREF_VOLT 4.096 //Using an external voltage reference (LM4040)
//#define TEST 1 //Used during testing to enable/disable certain functionality
//#define NAME_LENGTH 8 // Length of the filenames
#define SERIAL_DELAY 5 // Delay after each serial output
#define ANALOG_READ_DELAY 10 // Delay between analog reads. Lets the ADC settle down

// Battery voltage considered low. System behaviour will change below this value
#define BATT_VOLT_LOW 1200 

#define RED_LED_PIN 3
#define GREEN_LED_PIN 4

// Flag is set by the watch dog timer (WDT)
char WDT_FLAG = FALSE;

// Flags for indicating if the load is connected and if the state changed
char LOAD_ON_FLAG = FALSE;
char PREV_LOAD_STATE = FALSE;

// Flags used to determine types of output to produce
char DATA_STREAM = FALSE; // Stream data to RPi
char DEBUG_STREAM = TRUE; // Output debug info 


// Global variable containing the current filename
// I had to 'malloc' it to keep it from disapearing. Stuipd shit
char *filename = (char *) malloc(15);

const char NUM_SOURCES = 4; //number of voltage/current sources
// System Order: Batt, Solar, Hydro, Load
// Voltages are read in cV and currents in cA to avoid floating point numbers
// 1 V = 100 cV. Think meters and centimeters (1m = 100cm)
const char VOLT_PIN[] = {0, 1, 2, 3};
// voltage = (reading) * AREF/1024 * (voltage divider) * 1000(mV/V)
const int VOLT_MULTI[] = {4, 6, 8, 4}; //Voltage divider multiplier
const char AMP_PIN[] = {8, 9, 10, 11};
// current = (reading - 512) * (100amps)/(512) * 100(cA/A) / (num wire passes) 
// assuming sensors are powered from the same source as AREF
const char AMP_MULTI[] = {195, 195, 195, 195}; 

//Address of temperature sensors
// TODO
const int NUM_TEMPS = 3;
const int TEMP_ADDRESS[] = {1234, 5678, 9101};

// Intervals used between readings/SD writes
int NUM_NAPS_TAKEN = 0; // Number of naps taken during standby mode. One 'nap' is ~8sec long
// Used when in standby mode for long waits between writes
// use 37 naps for about 5min between SD writes, or 150 naps for ~20min. Note: not very accurate 
const int NUM_NAPS_BETWEEN_SD_WRITES = 1;
const int LOAD_INTERVAL = 2000;
const int ENERGY_INTERVAL = 500;

// Energy Level of the system in joules. Indicates the current system energy deficet.
// ENERGY_LEVEL == 0 indicates a full battery, -5400000 is empty. Never go there!
int ENERGY_LEVEL = 0;

// elapsedMillis creates a background timer that constantly counts up. Much better to use these
// timers than to use a delay. Does not work while asleep so make sure to reset after sleeping
// Energy measurments timer. Used to time measurments 
elapsedMillis ENERGY_TIME_ELAPSED;
// system interval timer. Used to time SD card writes
elapsedMillis SYSTEM_TIME_ELAPSED;

// define the Real Time Clock (RTC) object
RTC_PCF8523 RTC;

// for the data logging shield, we use digital pin 10 for the SD cs line
const int chipSelect = 10;
// the logging file
File TGC_logfile;

ISR(WDT_vect){
    // The system is woken up from sleep by the 'watch dog timer' WDT which is an interupt
    // After interupt, the script goes here
  //wdt_disable();  // disable watchdog
    WDT_FLAG = TRUE;
}

void sleep(){  
    debugOut("Starting my nap");
    // This function puts the arduino in a deep sleep to save power. 
    // Each nap takes about 8 seconds but don't rely on this being accurate.
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    sleep_enable();
    // Now enter sleep mode.
    sleep_mode();
    // The program will continue from here after the WDT timeout
    sleep_disable(); // First thing to do is disable sleep.
    // Re-enable the peripherals.
    power_all_enable();
    debugOut("Finished my nap");
    NUM_NAPS_TAKEN++; // We took a nap so update the counter
  } 

int* readVoltage(){
    // The voltages are read inside this function
    static int voltages[4] = {0, 0, 0, 0}; // Initiallize the array of values
    debugOut("readVoltage");
    debugOut(filename);

    for(int i=0; i<NUM_SOURCES; i++){
        voltages[i] =  analogRead(VOLT_PIN[i]) * VOLT_MULTI[i];
        delay(ANALOG_READ_DELAY);
    }

    // Set the load flag to the current load state (connected or not)
    // Load is connected with the big switch on the breaker panel.
    if(voltages[3] > BATT_VOLT_LOW){
        LOAD_ON_FLAG = TRUE;
    }else{ LOAD_ON_FLAG = FALSE;
    }

    // used for testing
    LOAD_ON_FLAG = TRUE;
    return voltages;
}//readVoltage

int* readAmp(){
    // The currents are read inside this function
    debugOut("readAmp");
    static int amps[4] = {0,0,0,0};
    for(int i=0; i<NUM_SOURCES; i++){
        amps[i] =  (analogRead(AMP_PIN[i]) - 512) *  AMP_MULTI[i];
        delay(ANALOG_READ_DELAY);
    }
    return amps;
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

char * intToString(int num){
    // Converts a 4 digit integer to a string representation of the floating point value after 
    // conversion. i.e. convert 1200 centiVolts to 12.00 Volts (as a string)
    static char buff[6];
    char *str = buff;
    sprintf(str, "%02d.%02d", (num/100), num%100);
    return str;
}

void writeReadings(){
    // Take the various measurments and then write them to the SD card

    char dataBuff[90]; // Buffer used to output the sweet sweet data
    char *data = dataBuff; // Pointer that points at the data buffer
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
    TGC_logfile = SD.open(filename, FILE_WRITE); 
    if( !TGC_logfile.print(data) ) debugOut("Didin't print data");
    TGC_logfile.close();

    // reset the timmer used between SD card writes
    SYSTEM_TIME_ELAPSED = 0;
    return;
}

void newFile(){
    // Create a new filename based on the time, close the old file, open a new one
    // and put a descriptive header at the top of the file

    // Fat32 limits file names to 8 characters plus a 3 character extension
    // UNIX time is 10 characters long so we truncate off the first two characters to 
    // form the file name. 
    // Extensions are '.on' when the loads are connected. '.off' otherwise

    DateTime now = RTC.now();
    unsigned long unix   = now.unixtime();
    int year   = now.year();
    int month  = now.month();
    int day    = now.day();
    int hour   = now.hour();
    int minute = now.minute();
    int second = now.second();

    char buff[580];
    char *header = buff;
    // Create the header using the current time/date data
    sprintf(header,
        "#Thanksgiving Cabin Power System\n"
        "#Time is in UNIX Time which is the number of seconds since 1970-Jan-01\n"
        "#To convert the date in cell 'A7' to an excel date serial number "
        "in Vancover time use:\n"
        "#=(A8/86400)+25569+(-7/24)\n"
        "#or Google it\n"
        "#Created: %04d-%02d-%02d at %02d:%02d:%02d or %010lu in UNIX time\n"
        "#Timestamp,Battery Voltage,Solar Voltage,Hydro Voltage,Load Voltage,"
        "Battery Amps, Solar Amps,Hydro Amps,Load Amps,Battery Energy State,"
        "Outside Temp,Cabin Temp,Battery Temp\n", year, month, day, hour, minute, second, unix);

    // Create the new filename including the system state
    if(LOAD_ON_FLAG == TRUE){
    sprintf(filename, "%08lu.ON\0", unix%100000000);
    }else{
    sprintf(filename, "%08lu.OFF\0", unix%100000000);
    }

    // Make sure any open files are closed
    //TGC_logfile.close();

    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        TGC_logfile = SD.open(filename, FILE_WRITE); 
    }else{debugOut("filename already exists");}
    if (! TGC_logfile) {
        debugOut("couldnt create file");
    }

    // Put the header at the top of the file
    TGC_logfile.print(header);

    //debugOut(filename);
    // Close the old file
    TGC_logfile.close();

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
    File dir = SD.open("/");
    dir.rewindDirectory(); // Go back to first file

    debugOut("List files in root directory:");
    while (true) {
        File entry =  dir.openNextFile();
        if (! entry) {
            // no more files
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
    //Serial.flush();
    char mess[25];
    char i = 0;

    while(Serial.available()){
        mess[i] = Serial.read();
        i++;
        if(i>=23) break;
    }
    mess[i] = '\0'; // NULL terminate the string

    //debugOut(mess);
    //delay(SERIAL_DELAY);
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

void setup() {

    Serial.begin(9600);
    debugOut("");

    // Real Time Clock (RTC) setup
    if (! RTC.begin()) {
        Serial.println("Couldn't find RTC");
        while (1);
    }
    if (! RTC.initialized()) {
        Serial.println("RTC is NOT running!");
        // following line sets the RTC to the date & time this sketch was compiled
        // RTC.adjust(DateTime(F(__DATE__), F(__TIME__)));
        // This line sets the RTC with an explicit date & time, 
        // for example to set it to the last time I banged your Mom
        // 2017/October/02 at 6:57pm use:
        // RTC.adjust(DateTime(2017, 10, 02, 18, 57, 0));
    }

    // Set file timestamps using a function pointer to call the function. Dumb shit
    SdFile::dateTimeCallback(dateTime);

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
    debugOut("Initializing SD card...");
    // make sure that the default chip select pin is set to
    // output, even if you don't use it:
    pinMode(chipSelect, OUTPUT);

    // see if the card is present and can be initialized:
    if (!SD.begin(chipSelect)) {
        error("Card failed, or not present");
    }
    debugOut("card initialized.");

    printRootDir();
#if TEST
    //print out all files on the card
 //   TGC_logfile = SD.open("/");
 //   printDirectory(TGC_logfile, 0);
#endif

    // create a new file
    newFile();

}//setup

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
