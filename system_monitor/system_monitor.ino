/*
Thanksgiving Cabin Power System Monitor

Ardunio-based system to be used to monitor power generation and use at
the Thanksgiving Cabin.

Donated by the UVic Caving Club
Created: 2017-09-30
Stuart de Haas
stuartdehaas@gmail.com
*/

#include <SPI.h>
#include <SD.h>
#include <Wire.h>
#include "RTClib.h" //Must be downloaded manually
#include <avr/sleep.h> //for sleeping
#include <avr/power.h> //for sleeping deep
#include <avr/wdt.h> //for waking up

#define FALSE 0
#define TRUE 1
#define AREF_VOLT 4.096 //Using an external voltage reference (LM4040)
#define TEST 1 //Used during testing to enable/disable certain functionality
#define NAME_LENGTH 25 // Length of the filenames
#define SERIAL_DELAY 5 // Delay after each serial output

#define RED_LED_PIN 3
#define GREEN_LED_PIN 4

// Flag is set by the watch dog timer (WDT)
char WDT_FLAG = FALSE;


// Global variable containing the current filename
//char *filename = (char*)malloc(NAME_LENGTH);
char filename[33];

const char NUM_SOURCES = 4; //number of voltage/current sources
// System Order: Batt, Solar, Hydro, Load
const char VOLT_PIN[] = {0, 1, 2, 3};
const char VOLT_MULTI[] = {3.8764, 7.3357, 12.3537, 3.8764}; //Voltage divider multiplier
const char AMP_PIN[] = {8, 9, 10, 11};
const char AMP_MULTI[] = {1, 4, 4, 3}; //Number of wire passes

//Address of temperature sensors
const int NUM_TEMPS = 3;
const int TEMP_ADDRESS[] = {1234, 5678, 9101};

// Intervals used between readings/SD writes
float STANDBY_INTERVAL = 3;
float LOAD_INTERVAL = 2;
float POWER_INTERVAL = 0.5;
float STREAM_INTERVAL = 1;

// define the Real Time Clock object
RTC_PCF8523 RTC;

// for the data logging shield, we use digital pin 10 for the SD cs line
const int chipSelect = 0;
// the logging file
File TGC_logfile;

ISR(WDT_vect){
    // After interupt, the script goes here
  //wdt_disable();  // disable watchdog
    WDT_FLAG = TRUE;
}

void sleep(){  
    set_sleep_mode(SLEEP_MODE_PWR_DOWN);
    sleep_enable();
  
    /* Now enter sleep mode. */
    sleep_mode();
  
    /* The program will continue from here after the WDT timeout*/
    sleep_disable(); /* First thing to do is disable sleep. */
  
    /* Re-enable the peripherals. */
    power_all_enable();
  } 

float* readVoltage(){
    static float voltages[4] = {0, 0, 0, 0};
    serialOut("readVoltage");

    for(int i=0; i<NUM_SOURCES; i++){
        voltages[i] =  analogRead(VOLT_PIN[i]) * (AREF_VOLT/1024) * VOLT_MULTI[i];
    }
    return voltages;
}//readVoltage

float* readAmp(){
    static float amps[4] = {0,0,0,0};
    #if TEST
        serialOut("readAmp");
        for(int i=0; i<NUM_SOURCES; i++){
            amps[i] = 5.4+i;
        }
        //return amps;
    #endif

    for(int i=0; i<NUM_SOURCES; i++){
        amps[i] =  analogRead(AMP_PIN[i]) * (AREF_VOLT/1024) * AMP_MULTI[i];
    }
    return amps;
}//readAmp

float* readTemp(){
    static float temps[3] = {0,0,0};
    #if TEST
        serialOut("readTemp");
        for(int i=0; i<NUM_TEMPS; i++){
            temps[i] = 20.3+i;
        }
        return temps;
    #endif

    for(int i=0; i<NUM_TEMPS; i++){
        //do something
    }
    return temps;
}//readTemp

void readTime(char *time){
    #if TEST
        serialOut("readTime");
    #endif

    DateTime now = RTC.now();
    sprintf(time, "%010lu", now.unixtime());
    return time;
}//readTime

int writeSD(float volt[], float amp[], float temp[], char time[], float power){
    // TO DO
    return 0;
}

void readSD(char *data[]){
    // TO DO
    *data = "0.1, 13.8, 20.0, stuff";
    return;
}

void newFile(){

    // Fat32 limits file names to 8 characters plus a 3 character extension
    // UNIX time is 10 characters long so we truncate off the first two characters to 
    // form the file name. 

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
    sprintf(header,
        "#Thanksgiving Cabin Power System\n"
        "#Time is in UNIX Time which is the number of seconds since 1970-Jan-01\n"
        "#To convert the date in cell 'A7' to an excel date serial number "
        "in Vancover time use:\n"
        "#=(A7/86400)+25569+(-7/24)\n"
        "or Google it\n"
        "Created: %04d-%02d-%02d at %02d:%02d:%02d or %010lu in UNIX time"
        "#Timestamp,Battery Voltage,Solar Voltage,Hydro Voltage,Load Voltage,"
        "Battery Amps, Solar Amps,Hydro Amps,Load Amps,Battery Energy State,"
        "Outside Temp,Cabin Temp,Battery Temp\n", year, month, day, hour, minute, second, unix);

    sprintf(filename, "%08lu.csv", unix%100000000);

    TGC_logfile.close();

    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        TGC_logfile = SD.open(filename, FILE_WRITE); 
    }

    if (! TGC_logfile) {
        error("couldnt create file");
    }

    return;

}//newFile

void standby(){
    // TO DO
    float voltReadings[4];
    float ampReadings[4];
    float tempReadings[3];

    //readVoltage(voltReadings);

    
}//standby

void error(char mess[]){
    // TO DO
    serialOut(mess);
    digitalWrite(RED_LED_PIN, HIGH);
    delay(500);
    digitalWrite(GREEN_LED_PIN, HIGH);
    delay(500);
}//error

void printArray(float array[], int arraySize){
    for(int i=0; i<arraySize; i++){
        Serial.println(array[i]);
        Serial.flush();
        //delay(SERIAL_DELAY);
    }
}

void serialOut(char output[]){
#if TEST
    Serial.println(output);
    //delay(SERIAL_DELAY);
    Serial.flush();
#endif
    return;
}

void test(){

    char buff[25]; //Allocate memory for the 'time'
    char *time = buff; //Create pointer to the allocated memory
    float *voltages, *amps, *temps; //create pointers to point at data

    voltages = readVoltage();
    amps = readAmp();
    temps = readTemp();
    readTime(time);
    //printArray(voltages, 4);
    //printArray(amps, 4);
    //printArray(temps, 3);
    //serialOut(time);
    serialOut("Old filename:");
    serialOut(filename);
    newFile();
    serialOut("New filename:");
    serialOut(filename);
    delay(2000);
    //sleep();
    return;
}

void printDirectory(File dir, int numTabs){
    //reccursively print all files and directories inside 'dir'. Use "/" for root
while (true) {
    File entry =  dir.openNextFile();
    if (! entry) {
      // no more files
      break;
    }
    for (int i = 0; i < numTabs; i++) {
      Serial.print('\t');
    }
    Serial.print(entry.name());
    if (entry.isDirectory()) {
      Serial.println("/");
      printDirectory(entry, numTabs + 1);
    } else {
      // files have sizes, directories do not
      Serial.print("\t\t");
      Serial.println(entry.size(), DEC);
    }
    entry.close();
  }
}

void setup() {

    Serial.begin(9600);
    serialOut("");

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


    pinMode(RED_LED_PIN, OUTPUT);
    pinMode(GREEN_LED_PIN, OUTPUT);

    //Using an external voltage reference for increased accuracy
    analogReference(EXTERNAL);
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
    serialOut("Initializing SD card...");
    // make sure that the default chip select pin is set to
    // output, even if you don't use it:
    pinMode(10, OUTPUT);

    // see if the card is present and can be initialized:
    if (!SD.begin(chipSelect)) {
        error("Card failed, or not present");
    }
    serialOut("card initialized.");

#if TEST
    //print out all files on the card
    TGC_logfile = SD.open("/");
    printDirectory(TGC_logfile, 0);
#endif

    // create a new file
    newFile();

}//setup

void loop() {
    // TO DO
    test();

    if(WDT_FLAG == TRUE){
        WDT_FLAG = FALSE;
    }
}
