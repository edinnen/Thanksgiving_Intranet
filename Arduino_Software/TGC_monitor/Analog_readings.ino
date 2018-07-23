
void analog_setup(){
    pinMode(LOAD_DETECT_PIN, INPUT);
    pinMode(REF_PWR_PIN, OUTPUT);
    digitalWrite(REF_PWR_PIN, LOW);
    pinMode(REF_READ_PIN, INPUT);
    readReference();
    sensors.begin();
}

void readReference(){
    float readings = 0;

    digitalWrite(REF_PWR_PIN, HIGH);
    delay(500);
    analogRead(REF_READ_PIN);
    for(int i=0;i<10;i++){
        readings += (float)analogRead(REF_READ_PIN);
        delay(5);
    }
    readings = readings/10;
    VOLT_CALIBRATION = 4.096/readings*1024.0;
    //VOLT_CALIBRATION = VOLT_CALIBRATION/10;
    digitalWrite(REF_PWR_PIN, LOW);
    debug_print("uC Supply Voltage: ");
    debug_print(VOLT_CALIBRATION);
    debug_println("V");
}

void strVoltages(char Battstr[], char Solarstr[], char Hydrostr[]){
    // Take analog volatage readings, convert to voltage, conver to char array and store in provided variable
    float volts[3];
    readVoltages(volts);
    // Convert the floating point number to a char array stored in the provided variable
    // sprintf doesn't work with floats on arduino. dumb. Have to use this functon by AVR
    dtostrf(volts[0],  4, 2, Battstr);
    dtostrf(volts[1], 4, 2, Solarstr);
    dtostrf(volts[2], 4, 2, Hydrostr);
    return;
}

void readVoltages(float volts[]){
    analogRead(VOLT_PIN[0]); // Prep the ADC

    // Take the readings and convert to correct voltage
   // float Batt  = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[0])*VOLT_MULTI[0];
   // float Solar = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[1])*VOLT_MULTI[1];
   // float Hydro = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[2])*VOLT_MULTI[2]; //TODO
   volts[0] = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[0])*VOLT_MULTI[0];
   volts[1] = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[1])*VOLT_MULTI[1];
   volts[2] = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[2])*VOLT_MULTI[2]; //TODO
   return;
}

void strAmps(char Loadstr[], char Battstr[], char Solarstr[], char Hydrostr[]){
    // Same as readVoltages()
    float amps[4];
    readAmps(amps);

    dtostrf(amps[0], 4, 2, Loadstr);
    dtostrf(amps[1], 4, 2, Battstr);
    dtostrf(amps[2], 4, 2, Solarstr);
    dtostrf(amps[3], 4, 2, Hydrostr);
    return;
}

void readAmps(float amps[]){
    analogRead(A0);
    amps[0]  = (float)(analogRead(AMP_PIN[0]) - AMP_DC_OFFSET[0]) * AMP_MULTI[0];
    amps[1]  = (float)(analogRead(AMP_PIN[1]) - AMP_DC_OFFSET[1]) * AMP_MULTI[1];
    amps[2]  = (float)(analogRead(AMP_PIN[2]) - AMP_DC_OFFSET[2]) * AMP_MULTI[2];
    amps[3]  = (float)(analogRead(AMP_PIN[3]) - AMP_DC_OFFSET[3]) * AMP_MULTI[3];
    return;
}

void strTemps(char outTemp[], char inTemp[], char boxTemp[]){
    float temps[3];
    readTemps(temps);

    dtostrf(temps[0], 4, 2, outTemp);
    dtostrf(temps[1], 4, 2, inTemp);
    dtostrf(temps[2], 4, 2, boxTemp);
    return;
}

void readTemps(float temps[]){
    
    sensors.requestTemperatures(); // Tell all sensors to begin a conversion
    temps[0] = sensors.getTempC(OUT_TEMP_ADDR);
    temps[1] = sensors.getTempC(IN_TEMP_ADDR);
    temps[2] = sensors.getTempC(BOX_TEMP_ADDR);
    return;
}

void energyUpdate(){
    // Update the current energy level of the battery by performing power tracking
    // Energy level in this context means the amount of energy that has been used from the 
    // full battery. i.e. ENERGY_LEVEL == 0 means the battery is full. The value will always
    // be ENERGY_LEVEL <= 0 since once the battery is full it will stop charging.
    // Energy level is kept in kilojoules (kJ)

    //int *voltages, *amps; //create pointers to point at data
    float volts[3];
    readVoltages(volts);
    float amps[4];
    readAmps(amps);

    // Collect power data
    //voltages = readVoltage();
    //amps = readAmp();

    // Change in energy level is change in: load power * batt power * solar power * hydro power * elapsed time
    // Make sure all the signs are correct (energy flowing the right way)
    ENERGY_LEVEL += (volts[0]*amps[0] + volts[0]*amps[1] + volts[1]*amps[2] + volts[2]*amps[3]) * ENERGY_TIME_ELAPSED;

    ENERGY_TIME_ELAPSED = 0; // Reset the timer between readings

    // We can never have the ENERGY_LEVEL be greater than 0 (battery full) 
    if(ENERGY_LEVEL > 0) ENERGY_LEVEL = 0;

}// energyUpdate()

// TODO remove
void testVoltage(){
    int batt, solar, hydro;
    //voltReadings(batt, solar, hydro);
    debug_println("Battery, Solar, Hydro");
    debug_println(batt);
    debug_println(solar);
    debug_println(hydro);
    //debug_println(sprintf("%d, %d, %d", batt, solar, hydro));
}
