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
#include "RTClib.h"

#define AREF_VOLT 4.096 //Using an external voltage reference (LM4040)
#define TEST 1 //Used during testing to enable/disable certain functionality
#define NAME_LENGTH 24 // Length of the filenames

#define RED_LED_PIN 3
#define GREEN_LED_PIN 4

// Global variable containing the current filename
char *filename = malloc(NAME_LENGTH);

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
RTC_DS1307 RTC; 

// for the data logging shield, we use digital pin 10 for the SD cs line
const int chipSelect = 0;

// the logging file
File TGC_logfile;

float* readVoltage(){
    static float voltages[4] = {0, 1, 0, 0};
    #if TEST
        Serial.println("readVoltage");
        for(int i=0; i<NUM_SOURCES; i++){
            voltages[i] = 13.8+i;
        }
        //return voltages;
    #endif

    for(int i=0; i<NUM_SOURCES; i++){
        voltages[i] =  analogRead(VOLT_PIN[i]) * VOLT_MULTI[i];
    }
    return voltages;
}//readVoltage

float* readAmp(){
    static float amps[4] = {0,0,0,0};
    #if TEST
        Serial.println("readAmp");
        for(int i=0; i<NUM_SOURCES; i++){
            amps[i] = 5.4+i;
        }
        //return amps;
    #endif

    for(int i=0; i<NUM_SOURCES; i++){
        amps[i] =  analogRead(AMP_PIN[i]) * AMP_MULTI[i];
    }
    return amps;
}//readAmp

float* readTemp(){
    static float temps[3] = {0,0,0};
    #if TEST
        Serial.println("readTemp");
        for(int i=0; i<NUM_SOURCES; i++){
            temps[i] = 20.3+i;
        }
        return temps;
    #endif

    for(int i=0; i<NUM_TEMPS; i++){
        //do something
    }
    return temps;
}//readTemp

char* readTime(){
    // TO DO
    static char *time;
    #if TEST
        Serial.println("readTime");
    #endif
        int randNumber = random(10);
        time = "2017_09_30-12-43-3";

        //strcat(time, str(randNumber));

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

    char *temp = (char*)malloc(sizeof(char)*NAME_LENGTH);

    memcpy(temp, readTime(), sizeof(char)*NAME_LENGTH);

    strcat(temp, ".csv");
    filename = temp;
#if TEST
    return;
#endif
    
    /*
    TGC_logfile.close();
    TGC_logfile = SD.open(newName, FILE_WRITE);

    if(TGC_logfile){
        TGC_logfile.println("#TGC Power System");
        TGC_logfile.print("Created: ");
        TGC_logfile.println(newName);
    }
    */
}

void standby(){
    // TO DO
    float voltReadings[4];
    float ampReadings[4];
    float tempReadings[3];

    //readVoltage(voltReadings);

    
}//standby

void error(char mess[]){
    // TO DO
    Serial.print("Shit");
}//error

void printArray(float array[], int arraySize){
    for(int i=0; i<arraySize; i++){
        Serial.println(array[i]);
    }
}

void test(){

    float *voltages, *amps, *temps;
    char *time;
    voltages = readVoltage();
    amps = readAmp();
    temps = readTemp();
    time = readTime();
    printArray(voltages, 4);
    printArray(amps, 4);
    printArray(temps, 3);
    Serial.println(time);
    int timeAdd = time;
    Serial.println(timeAdd);
    Serial.println(filename);
    int fileAdd = filename;
    Serial.println(fileAdd);
    newFile();
    Serial.println(filename);
    fileAdd = filename;
    Serial.println(fileAdd);
    delay(1000);

    return;
}

void setup() {

    Serial.begin(9600);
    Serial.println();

    pinMode(RED_LED_PIN, OUTPUT);
    pinMode(GREEN_LED_PIN, OUTPUT);

#if !(TEST)
    // initialize the SD card
    Serial.print("Initializing SD card...");
    // make sure that the default chip select pin is set to
    // output, even if you don't use it:
    pinMode(10, OUTPUT);

    // see if the card is present and can be initialized:
    if (!SD.begin(chipSelect)) {
        error("Card failed, or not present");
    }
    Serial.println("card initialized.");



    // create a new file
    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        TGC_logfile = SD.open(filename, FILE_WRITE); 
    }
    

    if (! TGC_logfile) {
        error("couldnt create file");
    }

    Serial.print("Logging to: ");
    Serial.println(filename);

    // connect to RTC
    Wire.begin();  
    if (!RTC.begin()) {
        TGC_logfile.println("RTC failed");
    Serial.println("RTC failed");
    }
#endif

}//setup

void loop() {
    // TO DO
    test();
}
