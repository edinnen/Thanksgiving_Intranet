// Test code for Ultimate GPS Using Hardware Serial
//

#include "TinyGPS.h" //http://arduiniana.org/libraries/TinyGPS/
#include "TimeLib.h" //https://github.com/PaulStoffregen/Time

// Debug macro
#define DEBUG 1
#if DEBUG
#define debug(x) (Serial.println(x))
#else
#define debug(x)
#endif

// what's the name of the hardware serial ports?
#define GPSSerial Serial1 // The serial port used for the GPS communication

TinyGPS gps;

long LAST_GPS_FIX = 0; // UNIX time of last GPS fix
bool GPS_SLEEP_FLAG = 1;
const unsigned int GPS_SYNC_INTERVAL = 10;
const unsigned int WRONG_SYNC_INT = 5;

void setup() {
#if DEBUG
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
    setSyncProvider(setGPStime); // The function used to sync the arduino clock to the GPS RTC
    setSyncInterval(GPS_SYNC_INTERVAL); // Number of seconds between sync of arduino clock
}// setup()

int GPSdateTime(int &year, byte &month, byte &day, byte &hour, byte &minute, byte &second){
    // returns 0 for success and 1 otherwise
    unsigned long fix_age;
    if(GPS_SLEEP_FLAG == 1){
        GPSSerial.println("$PMTK101*32"); // Wake up the GPS 'Hot Start'
        GPS_SLEEP_FLAG = 0;
        delay(500);
    }
    debug("Checking the GPS time...");
    for(int i = 0; i < 210; i++){ //Try a few times then timeout and return
        while(GPSSerial.available()){
            if(gps.encode(GPSSerial.read())){
                debug("Got a read");
                gps.crack_datetime(&year, &month, &day,
                    &hour, &minute, &second, NULL, &fix_age);
               if(fix_age < 500){ // Make sure the time is accurate 
                   GPSSerial.println("$PMTK161,0*28"); // Enter standby mode
                   GPS_SLEEP_FLAG = 1;
                   return 0;  // Return sucess!
               }else{
                   debug("old data");
               }
            }
        }
        delay(10);
    }
    return 1; //return fail...
}

void setRTC(){
    return;
}

time_t setWrongTime(){
    debug("Setting wrong time:");
    setTime(1587356401);
    return now();
}

time_t setGPStime(){
    int year;
    byte month, day, hour, minute, second;
    //for(int i = 0; i<3; i++){
        if(GPSdateTime(year, month, day, hour, minute, second) != 0 ){
           debug("GPSdateTime didn't work!");
            setSyncInterval(10);
        }else{
           setTime(hour, minute, second, day, month, year);
           adjustTime(-7 * 3600); // Set the timezone to Vancouver Time
           debug(now());
           setRTC();
           setSyncProvider(setWrongTime);
           setSyncInterval(WRONG_SYNC_INT);
            //LAST_FIX = now();
            return now();
        }
    //}
    //return 0;
}

void loop() {
    if(now() - LAST_GPS_SYNC > 30){
        debug("Sync with GPS");
    }
    if(timeStatus() == timeNotSet){ // The time has never been set.
        debug("Time hasn't been set yet");
    }else if(timeStatus() == timeNeedsSync){ // Time has been set but a sync attempt failed
        debug("Failed a GPS time sync");
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
    debug(now());
    debug(GPS_SLEEP_FLAG);
    delay(1000);

}
