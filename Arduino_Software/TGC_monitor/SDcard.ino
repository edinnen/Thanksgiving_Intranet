/*
Thanksgiving Cabin Power System Monitor

SD setup and writing functions

*/

void SD_setup(){
// see if the card is present and can be initialized:
    if (!SD.begin(chipSelect)) {
        debug_println("Card failed, or not present");
        SYSTEM_HAULT();
    }else{
        debug_println("card initialized.");
        //newFile();
    }
}

void generateDataString(char data[]){
    // Take the various measurments and then write them to a char array

    unsigned long time = now();

    // Create buffers to hold the data as a string and pass the variables to the function
    char BattV[10], SolarV[10], BattA[10], LoadA[10], SolarA[10];
    strVoltAmps(BattV, SolarV, LoadA, BattA, SolarA);
    char outTemp[10], inTemp[10], boxTemp[10];
    strTemps(outTemp, inTemp, boxTemp);
    // The power being generated/used and the percentage of batt left
    char solarPWR[10], hydroPWR[10], loadPWR[10];
    strPower(solarPWR, hydroPWR, loadPWR);

    // Merging and converting the data into one big string, 'data'
    sprintf(data, "%010lu,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
            time, BattV, SolarV, LoadA, BattA, SolarA, loadPWR, solarPWR, hydroPWR, outTemp, inTemp, boxTemp);

#ifdef DEBUG
    // Output the data to the debug serial port
    Serial.print("----------------------------------------------------------\n");
    Serial.print("Current Filename: ");
    Serial.println(filename);
    humanTime();
    Serial.print("BattV: ");
    Serial.print( BattV);
    Serial.print("\t");
    Serial.print("SolarV: ");
    Serial.print( SolarV);
    Serial.print("\n");
    Serial.print("LoadA: ");
    Serial.print( LoadA);
    Serial.print("\t");
    Serial.print(" BattA: ");
    Serial.print( BattA);
    Serial.print("\t");
    Serial.print("SolarA: ");
    Serial.print( SolarA);
    Serial.print("\n");
    Serial.print("loadPWR: ");
    Serial.print( loadPWR);
    Serial.print("\t");
    Serial.print("solarPWR: ");
    Serial.print( solarPWR);
    Serial.print("\t");
    Serial.print("hydroPWR: ");
    Serial.print( hydroPWR);
    Serial.print("\n");
    Serial.print("outTemp: ");
    Serial.print( outTemp);
    Serial.print("\t");
    Serial.print("inTemp: ");
    Serial.print( inTemp);
    Serial.print("\t");
    Serial.print("boxTemp: ");
    Serial.print( boxTemp);
    Serial.print("\n----------------------------------------------------------");
    Serial.print("\n\n\n");
    LOG.flush();
    LOG.close();
#endif

}

void writeReadings(){

    static unsigned long int previousFileUnix = 0;

    setRTCtime();
    if( (unsigned long) (now() - previousFileUnix) > NEW_FILE_INTERVAL ){
        previousFileUnix = now();
        newFile();
    }

    char data[100];
    generateDataString(data);

    // Open the current data file, ouput the data, and close it up again
    LOG = SD.open(filename, FILE_WRITE); 
    if( !LOG.print(data) ){
        debug_println("Didn't print data");
    }

    /*
    // Output the data to the debug serial port
    debug_println(filename);
    humanTime();
    debug_println(data);
    LOG.flush();
    LOG.close();
    */

    return;
}

void newFile(){
    // Filenames are created from the current UNIX time given in hexadecimal due to filename limitations
    // Fat32 limits file names to 8 characters plus a 3 character extension

    debug_println("newFile()");
    time_t t = now(); 
    char buff[500]; // Create a buffer for the header text
    char *header = buff; // Pointer that points to the buffer

    sprintf(header,
        "#Thanksgiving Cabin Power System\n"
        "#Time is in UNIX Time"
        "#Created: %04d-%02d-%02d at %02d:%02d:%02d or %010lu in UNIX time\n"
        "#Timestamp,Battery Voltage (V),Solar Voltage (V),Load Amps (A),"
        "Battery Amps (A),Solar Amps (A),load Power (w),solar Power (w),hydro Power (w),"
        "Outside Temp (C),Cabin Temp (C),Battery Temp (C)\n", year(t), month(t), day(t), hour(t), minute(t), second(t), t);

    sprintf(filename, "%8lx.csv", t); // format option 'lx' is for a 'long hex'
    debug_println(filename);

    // Make sure any open files are closed
    LOG.close();

    if (! SD.exists(filename)) {
        // only open a new file if it doesn't exist
        LOG = SD.open(filename, FILE_WRITE); 
    }else{
        debug_println("filename already exists");
        delay(1100);
        newFile();
        return;
        }

    if(LOG){
        LOG.print(header);
        LOG.flush();
        LOG.close();
    }else{
        debug_println("unable to open LOG");
        return;
    }

    debug_println("New file sucessfully created");
    //debug_println(filename);
    debug_println();
    NEXT_FILE_UNIX = t + NEW_FILE_INTERVAL;
    //debug_println(NEW_FILE_INTERVAL);

    return;

}//newFile
