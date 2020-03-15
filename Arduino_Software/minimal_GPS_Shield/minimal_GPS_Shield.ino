// Test code for Ultimate GPS Using Hardware Serial
//

// Used for communicating with GPS
#include "TinyGPS.h" //http://arduiniana.org/libraries/TinyGPS/
//#include <Adafruit_GPS.h>
// Used for time keeping
#include "TimeLib.h" //https://github.com/PaulStoffregen/Time
// Used to talk over I2C for RTC
#include <Wire.h>
//Used for RTC
#include "RTClib.h"

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

// what's the name of the hardware serial ports?
#define GPSSerial Serial2 // The serial port used for the GPS communication
//#define debug     Serial  // Serial port for communicating over USB

TinyGPS gps;
//Adafruit_GPS GPS(GPSSerial);
RTC_PCF8523 rtc;

unsigned long LAST_GPS_FIX = 0; // UNIX time of last GPS fix
bool GPS_SLEEP_FLAG = 1;
const unsigned int GPS_SYNC_INTERVAL = 30;
const unsigned int RTC_SYNC_INTERVAL = 10;
const unsigned int WRONG_SYNC_INT = 5;

void setup() {
#ifdef DEBUG
    // Set the baud rate between the arduino and computer. 115200 is nice and fast!
    Serial.begin(115200);
#endif
    // 9600 baud is the default rate for the Ultimate GPS
    GPSSerial.begin(9600);
    delay(50);
    // Warm restart the GPS
    GPSSerial.println("$PMTK101*32");
    // Only output the RMC data
    GPSSerial.println("$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29");
    delay(50);
    if( !rtc.begin()){
        // Check if we can talk to the RTC module
       debug_println("Couldn't find your dumb RTC. You suck");
       SYSTEM_HAULT(); // If no RTC, give up on life :(
    }
    if(!rtc.initialized()){
        // If the RTC has not been initialized time will be Jan 1, 1970. No good.
       debug_println("RTC was not running. Switching to GPS");
       while(setGPStime() == 1) continue; // Wait until we get accurate time before continuing
    }
    setSyncProvider(setRTCtime); // Handy library for keeping time.
    setSyncInterval(RTC_SYNC_INTERVAL);
    setRTCtime(); // Set system time based on RTC
}// setup()

void SYSTEM_HAULT(){
    // If the system has an error I can't handle, just give up on everything.
    while(1){
     // **Contemplate Mistakes**
     continue;
    }
}

int GPSdateTime(int &year, byte &month, byte &day, byte &hour, byte &minute, byte &second){
    // returns 0 for success and 1 otherwise
    unsigned long fix_age;
    if(GPS_SLEEP_FLAG == 1){
        // If the GPS was asleep, wake it up
        GPSSerial.println("$PMTK101*32"); // Wake up the GPS 'Hot Start'
        GPS_SLEEP_FLAG = 0;
        delay(1000);
    }
    debug_println("Checking the GPS time...");
    for(unsigned long start = millis(); millis() - start < 1000;){ //Try for one second
        while(GPSSerial.available()){
            // read a char into the NMEA encoder buffer. Test if it is a complete reading yet
            if(gps.encode(GPSSerial.read())){
                debug_println("encoded");
                gps.crack_datetime(&year, &month, &day,
                    &hour, &minute, &second, NULL, &fix_age);
                hour -= 7; //Adjust for timezone to Vancouver time
               if(fix_age < 5000){ // Make sure the time is accurate 
                   GPSSerial.println("$PMTK161,0*28"); // Enter standby mode
                   GPS_SLEEP_FLAG = 1;
                   return 0;  // Return sucess!
               }else{
                   debug_println("old data");
                   debug_println(fix_age);
                    //return 1; //return fail...
               }
            }
        }
    }
    return 1; // failed :(
} // GPSdateTime

time_t setRTCtime(){
    // Set system time to the time given by the RTC
    DateTime dtime = rtc.now();
    setTime(dtime.hour(), dtime.minute(), dtime.second(), dtime.day(), dtime.month(), dtime.year());
    //setTime(now.unixtime());
    debug_print("setRTCtime: ");
    debug_println(now());
    if(now() > (LAST_GPS_FIX + GPS_SYNC_INTERVAL) ){
        setGPStime(); 
    }
    return now();
}

time_t setWrongTime(){
    // Set system time to an incorrect time for testing
    debug_println("Setting wrong time:");
    setTime(1587356401);
    return now();
}

time_t setGPStime(){
    // Set system time to the time given by the GPS (if available)
    int year;
    byte month, day, hour, minute, second;

    if(GPSdateTime(year, month, day, hour, minute, second) != 0 ){
        debug_println("GPSdateTime didn't work!");
        return 1;
        //setSyncInterval(10);
    }else{
       setTime(hour, minute, second, day, month, year); // Set the system time
       debug_print("setGPStime: ");
       debug_println(now());
       rtc.adjust(DateTime(year, month, day, hour, minute, second)); // Set the RTC time
       //setSyncProvider(setRTCtime);
       //setSyncInterval(RTC_SYNC_INTERVAL);
       LAST_GPS_FIX = now();
    }
    return now();
} // setGPStime

void loop() {
    if(timeStatus() == timeNotSet){ // The time has never been set.
        debug_println("Time hasn't been set yet");
    }else if(timeStatus() == timeNeedsSync){ // Time has been set but a sync attempt failed
        debug_println("Failed a time sync");
    }else if(timeStatus() == timeSet){
        //continue;
    }
    while (Serial.available()) {
        char c = Serial.read();
        //GPSSerial.write(c);
        if(c=='s') GPSSerial.println("$PMTK161,0*28"); // Enter standby mode
        if(c=='w') GPSSerial.println("$PMTK101*32"); // 'Hot Start' use all available data in the NV Store
        if(c=='f'){ // Factory Reset and set RMC NMEA sequence
            GPSSerial.println("$PMTK104*37");
            GPSSerial.println("$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29");
        }
    }
    //Serial.println(setGPStime());
    debug_print("now(): ");
    debug_println(now());
    debug_print("GPS_SLEEP_FLAG: ");
    debug_println(GPS_SLEEP_FLAG);
    delay(1000);

}
