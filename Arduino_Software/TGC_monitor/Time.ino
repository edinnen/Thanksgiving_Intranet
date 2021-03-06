/*
Thanksgiving Cabin Power System Monitor

Time related functions. This system uses 3 different clocks to keep time.
The onboard clock is used for very short time periods, a real time clock is
used for longer time periods (a few days) and a GPS is used for long term time
keeping.

I'm using a few different time libraries with very similar time object things
which are not compatible with each other. time_t and DateTime are not the same!
The function 'now()' returns the system time, in unix time, (which is synced
periodically with the RTC/GPS). This is what should be used to get the time 
elsewhere
rtc.now() returns a time object from the RTC. Not a unix time stamp. It is 
used in this file for RTC stuff
*/

void time_setup(){
   
   // Setup the GPS first
   // Power up the GPS
    pinMode(GPS_EN_PIN, OUTPUT);
    digitalWrite(GPS_EN_PIN, HIGH);
    delay(100);
   // 9600 baud is the default rate for the Ultimate GPS
    GPSSerial.begin(9600);
    delay(50);
    // Warm restart the GPS
    GPSSerial.println("$PMTK101*32"); //TODO required?
    // Only output the RMC data
    GPSSerial.println("$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29");

    // Now lets setup the real time clock
    if( !rtc.begin()){// TODO doesn't catch it...
        // Check if we can talk to the RTC module
       debug_println("Couldn't find your dumb RTC. You suck");
       SYSTEM_HAULT(); // If no RTC, give up on life :(
    }
    if(!rtc.initialized()){
        // If the RTC has not been initialized time will be Jan 1, 1970. No good.
        // This happens if the battery runs out and power to the arduino is cut
        // RTC will still work fine once we set it with the GPS
       debug_println("RTC was not running. Switching to GPS");
       //TODO maybe instead just choose a random time?
       // Bad data is maybe better than no data?
       while(setGPStime() == 1) continue; // Wait until we get accurate time before continuing
    }
    // TimeLib.h provides an automatic way to sync time.
    // The SyncProvider will be set automatically every INTERVAL
    setSyncProvider(setRTCtime); // Handy library for keeping time.
    setSyncInterval(RTC_SYNC_INTERVAL);

    // Let's try to get a good GPS reading before continuing
    unsigned long start = millis();
    while(millis() - start < 10000){ // Try for some time
        if(!setGPStime()) break; 
    }
}

time_t setRTCtime(){
    // Set system time to the time given by the RTC

    // Get the current RTC time
    DateTime dtime = rtc.now();
    //setTime(dtime.hour(), dtime.minute(), dtime.second(), dtime.day(), dtime.month(), dtime.year());
    debug_println("setRTCtime: ");
    //debug_println(dtime.unixtime());
    humanTime();

    // Check to see if we need to sync with the GPS
    if(dtime.unixtime() > (LAST_GPS_ATTEMPT + GPS_SYNC_INTERVAL) ){
        // Should set the RTC time with the GPS
        if(!setGPStime()){
            dtime = rtc.now(); // Fetch the updated time on the RTC
        }else{
            debug_println("Couldn't get GPS time");
        }
    }
    setTime(dtime.unixtime()); // sets system clock from RTC
    return dtime.unixtime();
}

time_t setWrongTime(){
    // Set RTC time to an incorrect time for testing
    debug_println("Setting wrong time:");
    rtc.adjust(1531710579);
    return now();
}

byte setGPStime(){
    // This function talks to the GPS and tries to parse out the time.
    // She then updates the RTC time
    int year;
    byte month, day, hour, minute, second;
    unsigned long fix_age = 501; // Start with an unacceptable age

    DateTime now = rtc.now(); 

    if(GPS_SLEEP_FLAG == 1){
        // If the GPS was asleep, wake it up
        digitalWrite(GPS_EN_PIN, HIGH);
        delay(100);
        //GPSSerial.println("$PMTK101*32"); // Wake up the GPS 'Hot Start'
        GPS_SLEEP_FLAG = 0;
        // set the time the GPS woke up. Used to decide when to give up
        GPS_WOKE_UP_TIME = now.unixtime(); 
        //delay(100);
    }
    debug_println("Checking the GPS time...");

    // flush the buffer. This discards old data
    while( GPSSerial.available()){
        GPSSerial.read();
    }

    debug_println("Trying GPS for 1 sec");
    unsigned long start = millis();

    while(millis() - start < 1000){ // Try for some time
        while(GPSSerial.available()) gps.encode(GPSSerial.read());
    }

   // Either we timed out or we got some data! Lets check
   gps.crack_datetime(&year, &month, &day, &hour, &minute, &second, NULL, &fix_age);
   if(fix_age < 1100){ // Make sure the fix is recent
        debug_println("encoded");
        hour -= 7; //Adjust for timezone to Vancouver time
        debug_println(fix_age);
        //GPSSerial.println("$PMTK161,0*28"); // Enter standby mode
        //delay(100);
        digitalWrite(GPS_EN_PIN, LOW); // Good job GPS! Sleep now
        GPS_SLEEP_FLAG = 1;
        // Set RTC to the time provided by the GPS
        unsigned long old_unix = now.unixtime();
        rtc.adjust(DateTime(year, month, day, hour, minute, second)); // Set to new time
        now = rtc.now(); // update DateTime with new time
        LAST_GPS_FIX = now.unixtime();
        LAST_GPS_ATTEMPT = LAST_GPS_FIX;

       // Check to see if the time has changed substantially. 
       // Both numbers are unsigned so we need to see which one is larger so 
       // we know how to subtract them properly
       if( ((LAST_GPS_FIX > old_unix) ? LAST_GPS_FIX - old_unix : old_unix - LAST_GPS_FIX) > 60){
           debug_print("Big change to RTC from GPS: ");
           debug_println(now.unixtime() - old_unix);
           newFile();
       }
       debug_print("Set RTC to GPS time: ");
       debug_println(now.unixtime());
       humanTime();
       return 0;  // Return sucess!
   }else if(now.unixtime() > GPS_WOKE_UP_TIME + GPS_MAX_AWAKE_TIME ){
        digitalWrite(GPS_EN_PIN, LOW); // Bad job GPS! Sleep now
        GPS_SLEEP_FLAG = 1;
        LAST_GPS_ATTEMPT = now.unixtime(); 
        debug_println("Giving up on GPS");
       return 1;
   }else{
       debug_println("old or no data");
       debug_println(fix_age);
       return 1;
   }
} // GPSdateTime

// Prints out the time in a human readable format. Only used for debugging
#ifdef DEBUG
void printhumanTime(){
    char buff[100];
    char *output = buff;

    DateTime dtime = rtc.now();
    time_t t = dtime.unixtime();
    sprintf(output, "The time is: %02d:%02d.%02d on %s %02d, %04d", hour(t), minute(t), second(t), monthStr(month(t)), day(t), year(t));
    debug_println(output);

    return;
}
#endif
