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

const char NUM_SOURCES = 4; //number of voltage/current sources
// System Order: Batt, Solar, Hydro, Load
const char[] VOLT_PIN = [0, 1, 2, 3];
const char[] VOLT_MULTI = [4, 5, 6, 7]; //Voltage divider multiplier
const char[] AMP_PIN = [8, 9, 10, 11];
const char[] AMP_MULTI = [1, 4, 4, 3]; //Number of wire passes

//Address of temperature sensors
const int NUM_TEMPS = 3;
const int[] TEMP_ADDRESS[1234, 5678, 9101];

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

float readVoltage(char PIN){
    // TO DO
    return 13.8;
}

float readAmp(char PIN){
    // TO DO
    return 4.1;
}

float readTemp(int address){
    // TO DO
    return 22.1;
}

char[] readTime(int address){
    // TO DO
    return "2017-09-30:12:43:33";
}

int writeSD(float[] volt, float[] amp, float[] temp, char[] time, float power){
    // TO DO
    return 0;
}

char[] readSD(){
    // TO DO
    return "0.1, 13.8, 20.0, stuff";
}

void standby(){
    // TO DO
    float voltReadings[4];
    float ampReadings[4];
    float tempReadings[3];

    for(int i=0, i++, i<NUM_SORCES){
        voltReadings[i] = readVoltage(VOLT_PIN[i]);
        ampReadings[i] = readAmp(AMP_PIN[i]);
    }

    for(int i=0, i++, i<NUM_TEMPS){
        tempReadings[i] = readTemp(TEMP_ADDRESS[i]);
    }
    
}//standby

void setup() {
    //To-do

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
