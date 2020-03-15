/*
Thanksgiving Cabin Power System Monitor

Time related functions. This system uses 3 different clocks to keep time.
The onboard clock is used for very short time periods, a real time clock is
used for longer time periods (a few days) and a GPS is used for long term time
keeping.

I'm using a few different time libraries with very similar time object things
which are not compatible with each other. time_t and DateTime are not the same!
TODO I should be able to make this a lot less shitty
*/

void time_setup(){
   
   // Setup the GPS first
   // Power up the GPS
    digitalWrite(GPS_EN_PIN, HIGH);
    delay(50);
   // 9600 baud is the default rate for the Ultimate GPS
    GPSSerial.begin(9600);
    delay(50);
    // Warm restart the GPS
    GPSSerial.println("$PMTK101*32");
    // Only output the RMC data
    GPSSerial.println("$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29");
    delay(50);

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
    // The setRTCtime function has its own system to decide if we need the GPS
    setSyncProvider(setRTCtime); // Handy library for keeping time.
    setSyncInterval(RTC_SYNC_INTERVAL);
    //now();
    //setRTCtime(); // Set system time based on RTC
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
    if(dtime.unixtime() > (LAST_GPS_FIX + GPS_SYNC_INTERVAL) ){
        // Should set the RTC time with the GPS
        if(!setGPStime()){
            dtime = rtc.now(); // Fetch the updated time on the RTC
        }else{
            debug_println("Couldn't get GPS time");
        }
    }
    setTime(dtime.unixtime());
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
    // TODO should do this with a time object of some sort
    byte month, day, hour, minute, second;
    unsigned long fix_age = 501; // Start with an unacceptable age

    if(GPS_SLEEP_FLAG == 1){
        // If the GPS was asleep, wake it up
        digitalWrite(GPS_EN_PIN, HIGH);
        delay(100);
        //GPSSerial.println("$PMTK101*32"); // Wake up the GPS 'Hot Start'
        GPS_SLEEP_FLAG = 0;
        //delay(100);
    }
    debug_println("Checking the GPS time...");
    //for(unsigned long start = millis(); millis() - start < 1000;){ //Try for one second
    //if(!GPSSerial.available()) return 1; // If nothing available, peace out

    // flush the buffer. This discards old data
    while( GPSSerial.available()){
        GPSSerial.read();
    }

    debug_println("Trying GPS for 1 sec");
    unsigned long start = millis();

    while(millis() - start < 1000){ // Try for some time
        while(GPSSerial.available()) gps.encode(GPSSerial.read());
    }
    /*while(millis() - start < 5000){ // Try for some time
        // read a char into the NMEA encoder buffer. Test if it is a complete reading yet
        if(GPSSerial.available()){
            if(gps.encode(GPSSerial.read())){
                debug_println("encoded");
                gps.crack_datetime(&year, &month, &day, &hour, &minute, &second, NULL, &fix_age);
                hour -= 7; //Adjust for timezone to Vancouver time
                break; // Got it so break the while loop
            }
        }
    }*/

   // Either we timed out or we got some data! Lets check
   gps.crack_datetime(&year, &month, &day, &hour, &minute, &second, NULL, &fix_age);
   if(fix_age < 1000){ // Make sure the time is accurate 
        debug_println("encoded");
        //gps.crack_datetime(&year, &month, &day, &hour, &minute, &second, NULL, &fix_age);
        hour -= 7; //Adjust for timezone to Vancouver time
        debug_println(fix_age);
        //GPSSerial.println("$PMTK161,0*28"); // Enter standby mode
        //delay(100);
        digitalWrite(GPS_EN_PIN, LOW); // Good job GPS! Sleep now
        GPS_SLEEP_FLAG = 1;
        // Set RTC to the time provided by the GPS
        DateTime now = rtc.now(); // Old time
        unsigned long old_unix = now.unixtime();
        rtc.adjust(DateTime(year, month, day, hour, minute, second)); // Set to new time
        now = rtc.now(); // update DateTime with new time
        LAST_GPS_FIX = now.unixtime();

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
   }else{
       debug_println("old or no data");
       debug_println(fix_age);
       return 1;
   }
    // TODO we never put the GPS to sleep if it never gets the time.
    // We need to give up eventually. Need a counter or something
    return 1; // failed :(
} // GPSdateTime

void humanTime(){
    char buff[100];
    char *output = buff;

    DateTime dtime = rtc.now();
    time_t t = dtime.unixtime();
    sprintf(output, "The time is: %02d:%02d.%02d on %s %02d, %04d", hour(t), minute(t), second(t), monthStr(month(t)), day(t), year(t));
    debug_println(output);

    return;
}
