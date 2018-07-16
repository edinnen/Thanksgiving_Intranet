void time_setup(){
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
                //hour -= 7; //Adjust for timezone to Vancouver time
                //adjustTime(-7);
               if(fix_age < 500){ // Make sure the time is accurate 
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
    rtc.adjust(1531710579);
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
       // Sorry for this dumb work around but time zones are hard...
       setTime(hour, minute, second, day, month, year); // Set the system time to GPS time (+0:00)
       rtc.adjust(now()-7*3600); // Set RTC to Vancouver time (-7:00)
       setRTCtime(); // Set system to Vancouver time.
       debug_print("setGPStime: ");
       debug_println(now());
       rtc.adjust(DateTime(year, month, day, hour, minute, second)); // Set the RTC time
       //setSyncProvider(setRTCtime);
       //setSyncInterval(RTC_SYNC_INTERVAL);
       LAST_GPS_FIX = now();
    }
    return now();
} // setGPStime
