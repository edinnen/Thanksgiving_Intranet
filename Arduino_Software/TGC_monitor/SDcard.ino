/*
Thanksgiving Cabin Power System Monitor

SD setup and writing functions

*/

void SD_setup(){
// see if the card is present and can be initialized:
    if (!SD.begin(chipSelect)) {
        debug_println("Card failed, or not present");
        // TODO something else here
    }else{
        debug_println("card initialized.");
    }

    //printRootDir();
#ifdef DEBUG
    //print out all files on the card
 //   LOG = SD.open("/");
 //   printDirectory(LOG, 0);
#endif

    // create a new file
    newFile();
}

void generateDataString(char data[]){
    // Take the various measurments and then write them to a char array
    debug_println("writeReadings");

    //char dataBuff[150]; // Buffer used to output the sweet sweet data TODO set length to be reasonable
    //char *data = dataBuff; // Pointer that points at the data buffer
    unsigned long time = now();

    readReference(); // Calibrate the ADC

    // Create buffers to hold the data as a string and pass the variables to the function
    char BattV[10], SolarV[10], BattA[10], LoadA[10];
    strVoltAmps(BattV, SolarV, BattA, LoadA);
    char outTemp[10], inTemp[10], boxTemp[10];
    strTemps(outTemp, inTemp, boxTemp);
    // The power being generated/used and the percentage of batt left
    char generated[10], used[10], battPercent[10];
    strPower(generated, used, battPercent);

    // Merging and converting the data into one big string, 'data'
    sprintf(data, "%010lu,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
            time, BattV, SolarV, LoadA, BattA, battPercent, generated, used, outTemp, inTemp, boxTemp);

}

void writeReadings(){
    //char dataBuff[150]; // Buffer used to output the sweet sweet data TODO set length to be reasonable
    //char *data = dataBuff; // Pointer that points at the data buffer

    char data[150];
    generateDataString(data);

    // Open the current data file, ouput the data, and close it up again
    LOG = SD.open(filename, FILE_WRITE); 
    if( !LOG.print(data) ){
        debug_println("Didn't print data");
        //TODO something else
    }

    // Output the data to the debug serial port
    debug_print(filename);
    debug_print(": ");
    debug_println(data);
#ifdef RPI_ENABLE
    //RPiSerial.print("Live data: ");
    //RPiSerial.print(data);
#endif
    LOG.flush();
    LOG.close();

    // reset the timer used between SD card writes
    SYSTEM_TIME_ELAPSED = 0;
    return;
}

void newFile(){
    // Create a new filename based on the time, close the old file, open a new one
    // and put a descriptive header at the top of the file

    // Filenames are created from the current UNIX time given in hexadecimal due to filename limitations
    // Fat32 limits file names to 8 characters plus a 3 character extension
    // Extensions are '.on' when the loads are connected. '.off' otherwise

    time_t t = now(); // Put the current unix time into variable t
    unsigned long unix = t;
    debug_println(unix);
    char buff[500]; // Create a buffer for the header text
    char *header = buff; // Pointer that points to the buffer

    // Create the header using the current time/date data TODO is the equation right?
    sprintf(header,
        "#Thanksgiving Cabin Power System\n"
        "#Time is in UNIX Time which is the number of seconds since 1970-Jan-01, "
        "filename is given in hexadecimal representation\n"
        "#Created: %04d-%02d-%02d at %02d:%02d:%02d or %010lu in UNIX time\n"
        "#Timestamp,Battery Voltage (V),Solar Voltage (V),Battery Amps (A),"
        "Load Amps (A),Battery percentage, Power into Battery (w), Power to loads (w),"
        "Outside Temp (C),Cabin Temp (C),Battery Temp (C)\n", year(t), month(t), day(t), hour(t), minute(t), second(t), unix);
    
    // Create the new filename including the system state
    if(LOAD_ON_FLAG == TRUE){
    sprintf(filename, "%8lx.ONN", unix); // format option 'lx' is for a 'long hex'
    debug_println(filename);
    }else{
    sprintf(filename, "%8lx.OFF", unix);
    debug_println(filename);
    }

    // Make sure any open files are closed
    LOG.close();

    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        LOG = SD.open(filename, FILE_WRITE); 
    }else{
        debug_println("filename already exists");
        // TODO something here
        }
    if (! LOG) {
        debug_println("couldnt create file");
    }

    if(LOG){
        debug_println("Opened LOG for writing...");
        // Put the header at the top of the file
        LOG.print(header);
        LOG.flush();

        //debug_println(filename);
        // Close the old file
        LOG.close();
    }else{
        debug_println("unable to open LOG");
    }

    debug_println("New filename created");
    debug_println(filename);

    return;

}//newFile
