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
char filename[25] = "Poop.csv";

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

void readVoltage(float *voltages[]){
    #if TEST
    for(int i=0; i++; i<NUM_SOURCES){
        *voltages[i] = 13.8+i;
    }
        return;
    #endif

    for(int i=0; i++; i<NUM_SOURCES){
        *voltages[i] =  analogRead(VOLT_PIN[i]) * VOLT_MULTI[i];
    }
    return;
}//readVoltage

void readAmp(float *amps[]){
    #if TEST
    for(int i=0; i++; i<NUM_SOURCES){
        *amps[i] = 5.4+i;
    }
        return;
    #endif

    for(int i=0; i++; i<NUM_SOURCES){
        *amps[i] =  analogRead(AMP_PIN[i]) * AMP_MULTI[i];
    }
    return;
}//readAmp

void readTemp(float *temps[]){
    #if TEST
    for(int i=0; i++; i<NUM_SOURCES){
        *temps[i] = 20.3+i;
    }
        return;
    #endif

    for(int i=0; i++; i<NUM_TEMPS){
        //do something
    }
    return;
}//readTemp

char readTime(){
    // TO DO
    return "2017_09_30-12-43-33";
}

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

    char newName[] = "SHIT";
    strcat(newName, ".csv");
    
    TGC_logfile.close();
    TGC_logfile = SD.open(newName, FILE_WRITE);

    if(TGC_logfile){
        TGC_logfile.println("#TGC Power System");
        TGC_logfile.print("Created: ");
        TGC_logfile.println(newName);
    }
}

void standby(){
    // TO DO
    float voltReadings[4];
    float ampReadings[4];
    float tempReadings[3];

    readVoltage(voltReadings[]);

    
}//standby

void setup() {

    Serial.begin(9600);
    Serial.println();

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
    char filename[] = "LOGGER00.CSV";
    for (uint8_t i = 0; i < 100; i++) {
        filename[6] = i/10 + '0';
        filename[7] = i%10 + '0';
        if (! SD.exists(filename)) {
            // only open a new file if it doesn't exist
            logfile = SD.open(filename, FILE_WRITE); 
            break;  // leave the loop!
        }
    }

    if (! logfile) {
        error("couldnt create file");
    }

    Serial.print("Logging to: ");
    Serial.println(filename);

    // connect to RTC
    Wire.begin();  
    if (!RTC.begin()) {
        logfile.println("RTC failed");
    Serial.println("RTC failed");
    }

}//setup

void loop() {
    // TO DO
}
