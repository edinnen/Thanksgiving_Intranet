/*
Thanksgiving Cabin Power System Monitor

Analog Readings setup and measurment functions

*/

void analog_setup(){
// Attaches internal ~20kOhm pullup to input. When the 'Big Red Switch'
// is turned on, this pin is pulled low. No external circuitry is required.
    pinMode(LOAD_DETECT_PIN, INPUT_PULLUP); 
    // This pin is used to power the precision voltage source.
    pinMode(REF_PWR_PIN, OUTPUT);
    digitalWrite(REF_PWR_PIN, LOW);
    // the pin used to take calibration reading.
    pinMode(REF_READ_PIN, INPUT);
    readReference();
    // Onewire bus with temperature sensors
    sensors.begin();

    // Setting up our INA219 ICs
    BATT_MONITOR.begin();
    BATT_MONITOR.configure(INA219::RANGE_16V, INA219::GAIN_1_40MV, INA219::ADC_64SAMP, INA219::ADC_64SAMP, INA219::CONT_SH_BUS);
    BATT_MONITOR.calibrate(BATT_SHUNT_R, BATT_SHUNT_MAX_V, BATT_BUS_MAX_V, BATT_MAX_CURRENT);

    LOAD_MONITOR.begin();
    LOAD_MONITOR.configure(INA219::RANGE_16V, INA219::GAIN_1_40MV, INA219::ADC_64SAMP, INA219::ADC_64SAMP, INA219::CONT_SH_BUS);
    // calibrate with our values
    LOAD_MONITOR.calibrate(LOAD_SHUNT_R, LOAD_SHUNT_MAX_V, LOAD_BUS_MAX_V, LOAD_MAX_CURRENT);

    // Now that our sensors are fired up lets check the battery
    estimateBattState();
}

// Takes a reading off the precision voltage source wired to the arduino
// Gives a known voltage reference to base anolog reads off.
void readReference(){
    float readings = 0;

    digitalWrite(REF_PWR_PIN, HIGH); // Power up the voltage source
    delay(500); // Let her get warmed up. ;)
    analogRead(REF_READ_PIN);
    // Take a few readings and average them 
    for(int i=0;i<10;i++){
        readings += (float)analogRead(REF_READ_PIN);
        delay(5);
    }
    readings = readings/10;
    // voltage reference is at 4.096V. ADC is 10bit so 1024 values
    VOLT_CALIBRATION = 4.096/readings*1024.0;
    //VOLT_CALIBRATION = VOLT_CALIBRATION/10;
    digitalWrite(REF_PWR_PIN, LOW); // turn off the reference to save power
    /*
    debug_print("uC Supply Voltage: ");
    debug_print(VOLT_CALIBRATION);
    debug_println("V");
    */

}

// Fetches the voltages and currents from the INA219s and solar voltage divider
// and outputs to a set of strings
void strVoltAmps(char BattVstr[], char SolarVstr[], char BattAstr[], char LoadAstr[]){
    float Powers[4];
    float SolarVolt;

    readVoltAmp(Powers);
    readSolarVoltage(&SolarVolt);

    // Convert the floating point number to a char array stored in the provided variable
    // sprintf doesn't work with floats on arduino. dumb. Have to use this function by AVR
    // The load voltage should always match the battery voltage so lets skip it for this
    dtostrf(Powers[0], 4, 2, BattVstr);
    dtostrf(Powers[1], 4, 2, BattAstr);
    dtostrf(Powers[3], 4, 2, LoadAstr);
    dtostrf(SolarVolt, 4, 2, SolarVstr);
    return;
}

// Reads the voltage and current on both INA219s
void readVoltAmp(float Power[]){
    if(BATT_MONITOR.shuntVoltageRaw() == -1){
        // This means we can't talk to the IC. 
        // Put in some placeholder data
        Power[0] = 0;
        Power[1] = 0;
        //debug_println("Battery INA219 not responding");
    }else{
        // Shit should be good so fetch that data!
        Power[0] = BATT_MONITOR.busVoltage();
        Power[1] = BATT_MONITOR.shuntCurrent();
    }
    if(LOAD_MONITOR.shuntVoltageRaw() == -1){
        // This means we can't talk to the IC. 
        // Put in some placeholder data
        Power[2] = 0;
        Power[3] = 0;
        //debug_println("Load INA219 not responding");
    }else{
        // Shit should be good so fetch that data!
        Power[2] = LOAD_MONITOR.busVoltage();
        Power[3] = LOAD_MONITOR.shuntCurrent();
    }
    return;
}

void readSolarVoltage(float* volts){
    analogRead(SOLAR_VOLATGE_PIN); // Prep the ADC
    delay(1);

    // Take the reading and convert to correct voltage
   *volts = VOLT_CALIBRATION / 1024.0 * (float)analogRead(SOLAR_VOLATGE_PIN)*SOLAR_VOLT_MULTI;
   //*volts = 13.6;
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

void strPower(char generated[], char used[], char battPercent[]){
    energyUpdate();
    BATT_ENERGY += ENERGY_GENERATED; // BATT_ENERGY is just the long term sum
    if(BATT_ENERGY > BATT_TOTAL_CAPACITY){
        BATT_ENERGY = BATT_TOTAL_CAPACITY;
        debug_println("Battery Full!");
    }

    float timeElapsed = float(SYSTEM_TIME_ELAPSED)/1000;
    float fbattPer = float(BATT_ENERGY)/float(BATT_TOTAL_CAPACITY)*100;

    dtostrf( (ENERGY_USED/timeElapsed)      , 4, 2, used);
    dtostrf( (ENERGY_GENERATED/timeElapsed) , 4, 2, generated);
    dtostrf( fbattPer                       , 4, 2, battPercent);

    // Reset the energy variables 
    ENERGY_USED = 0.0;
    ENERGY_GENERATED = 0.0;
}

void energyUpdate(){
    // Update the current energy level of the battery by performing power tracking
    // Energy level in this context means the amount of energy that has been used from the 
    // full battery. i.e. ENERGY_LEVEL == 0 means the battery is full. The value will always
    // be ENERGY_LEVEL <= 0 since once the battery is full it will stop charging.
    // Energy level is kept in kilojoules (kJ)

    float Powers[4];
    // battV, battA, LoadV, LoadA
    readVoltAmp(Powers);
    // Energy used is just the power to the loads times time
    ENERGY_USED += Powers[2]*Powers[3]*float(ENERGY_TIME_ELAPSED)/1000.0;
    // Energy generated is the power going into the battery plus the power used times time
    ENERGY_GENERATED += Powers[0]*((-1.0)*Powers[1]+Powers[3])*float(ENERGY_TIME_ELAPSED)/1000.0;
    ENERGY_TIME_ELAPSED = 0; // Reset the timer between readings

}// energyUpdate()

// If the current battery voltage is less than 13volts then the starting level
// is less than 0kJ. The following is an approximation of energy level based only
// on the battery voltage. Its not super accurate
// I tried to estimate the voltage/capacity relationship from the spec sheet.
// This equation is my best guess at the linear fit. Don't trust it
void estimateBattState(){

    float battery_voltage[4];
    readVoltAmp(battery_voltage);
    if(battery_voltage[0] < 13.00){
        BATT_ENERGY = (unsigned long)(((battery_voltage[0] - 11.75)/1.35) * float(BATT_TOTAL_CAPACITY));
    }else{
        BATT_ENERGY = BATT_TOTAL_CAPACITY; // Otherwise assume it is fully charged
    }
}
