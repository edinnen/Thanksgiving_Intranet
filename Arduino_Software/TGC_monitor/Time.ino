/*
Thanksgiving Cabin Power System Monitor


I'm using a few different time libraries with very similar time object things
which are not compatible with each other. time_t and DateTime are not the same!
The function 'now()' returns the system time, in unix time, (which is synced
periodically with the RTC/GPS). This is what should be used to get the time 
elsewhere
rtc.now() returns a time object from the RTC. Not a unix time stamp. It is 
used in this file for RTC stuff
*/

void time_setup(){
   

    // Now lets setup the real time clock
    if( !rtc.begin()){
        // Check if we can talk to the RTC module
       debug_println("Couldn't find your dumb RTC. You suck");
       SYSTEM_HAULT(); // If no RTC, give up on life :(
    }
    if(rtc.lostPower()){
        // If the RTC has not been initialized time will be Jan 1, 1970. No good.
        // This happens if the battery runs out and power to the arduino is cut
        // RTC will still work fine once we set it with the GPS (todo)
        debug_println("RTC Lost power, using code compile time as current time");
        rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    }
    // TimeLib.h provides an automatic way to sync time.
    // The SyncProvider will be set automatically every INTERVAL
    //setSyncProvider(setRTCtime); // Handy library for keeping time.
    //setSyncInterval(60);
    setRTCtime();

}

time_t setRTCtime(){
    // Set system time to the time given by the RTC

    // Get the current RTC time
    DateTime dtime = rtc.now();
    setTime(dtime.unixtime()); // sets system clock from RTC
    return dtime.unixtime();
}

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
