/*
Thanksgiving Cabin Power System Monitor

Analog Readings setup and measurment functions

*/

void analog_setup(){

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

    SOLAR_MONITOR.begin(); //TODO verify I set this up right
    SOLAR_MONITOR.configure(INA219::RANGE_16V, INA219::GAIN_1_40MV, INA219::ADC_64SAMP, INA219::ADC_64SAMP, INA219::CONT_SH_BUS);
    // calibrate with our values
    SOLAR_MONITOR.calibrate(SOLAR_SHUNT_R, SOLAR_SHUNT_MAX_V, SOLAR_BUS_MAX_V, SOLAR_MAX_CURRENT);

    // Now that our sensors are fired up lets check the battery
    estimateBattState();
}


// Fetches the voltages and currents from the INA219s and solar voltage divider
// and outputs to a set of strings
void strVoltAmps(char BattVstr[], char SolarVstr[], char BattAstr[], char LoadAstr[], char SolarAstr[]){
    float Powers[6];

    readVoltAmp(Powers);

    // Convert the floating point number to a char array stored in the provided variable
    // sprintf doesn't work with floats on arduino. dumb. Have to use this function by AVR
    // The load voltage should always match the battery voltage so lets skip it for this
    dtostrf(Powers[0], 4, 2, BattVstr);
    dtostrf(Powers[1], 4, 2, BattAstr);
    dtostrf(Powers[3], 4, 2, LoadAstr);
    dtostrf(Powers[4], 4, 2, SolarVstr);
    dtostrf(Powers[5], 4, 2, SolarAstr);
    return;
}

// Reads the voltage and current from the sensors
// Current is with respect to the battery. 
// Leaving the battery is negative, charging the battery is positive.
void readVoltAmp(float Power[]){
    if(BATT_MONITOR.shuntVoltageRaw() == -1){
        // This means we can't talk to the IC. 
        // Put in some placeholder data
        Power[0] = 0;
        Power[1] = 0;
        //debug_println("Battery INA219 not responding");
    }else{
        Power[0] = BATT_MONITOR.busVoltage();
        Power[1] = BATT_MONITOR.shuntCurrent();
    }

    if(LOAD_MONITOR.shuntVoltageRaw() == -1){
        Power[2] = 0;
        Power[3] = 0;
        //debug_println("Load INA219 not responding");
    }else{
        Power[2] = LOAD_MONITOR.busVoltage();
        Power[3] = LOAD_MONITOR.shuntCurrent();
    }
    
    if(SOLAR_MONITOR.shuntVoltageRaw() == -1){
        Power[4] = 0;
        Power[5] = 0;
        //debug_println("Solar INA219 not responding");
    }else{
        Power[4] = SOLAR_MONITOR.busVoltage();
        Power[5] = SOLAR_MONITOR.shuntCurrent();
    }

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


// Read temperatures from digital temperature sensors on a oneWire bus
// If they are not present or can't be contacted it will output -127
// I just don't even look at the errors. Who cares?
void readTemps(float temps[]){
    
    sensors.requestTemperatures(); // Tell all sensors to begin a conversion
    temps[0] = sensors.getTempC(OUT_TEMP_ADDR);
    temps[1] = sensors.getTempC(IN_TEMP_ADDR);
    temps[2] = sensors.getTempC(BOX_TEMP_ADDR);
    return;
}


// Calacualte the power 
void strPower(char generated[], char used[], char battPercent[]){

    if(LOAD_ON_FLAG == false){
    // During low res logging we can't accurately calculate these so
    // set them to zero
        dtostrf( 0.0, 4, 2, used);
        dtostrf( 0.0, 4, 2, generated);
        dtostrf(-1.0, 4, 2, battPercent);
        ENERGY_USED = 0.0;
        ENERGY_GENERATED = 0.0;
        return;
    }

    energyUpdate();

    // Check to see if the battery energy doesn't make sense
    // Either it is way too low or has wrapped around and is way too big
    if(BATT_ENERGY < BATT_TOTAL_CAPACITY/3 || BATT_ENERGY > BATT_TOTAL_CAPACITY*2){
        BATT_ENERGY = 0;
    // If it is just a bit too big then it is (hopefully) fully charged!
    }else if(BATT_ENERGY > BATT_TOTAL_CAPACITY){
        BATT_ENERGY = BATT_TOTAL_CAPACITY;
    }

    float timeElapsed = float(HIRES_LOG_ELAPSED_MILLIS)/1000;
    float fbattPer = float(BATT_ENERGY)/float(BATT_TOTAL_CAPACITY)*100.0;

    dtostrf( (ENERGY_USED/timeElapsed)      , 4, 2, used);
    dtostrf( (ENERGY_GENERATED/timeElapsed) , 4, 2, generated);
    dtostrf( fbattPer                       , 4, 2, battPercent);

    // Reset the energy variables 
    ENERGY_USED = 0.0;
    ENERGY_GENERATED = 0.0;
    HIRES_LOG_ELAPSED_MILLIS = 0;
}


// Track the power and time elapsed to determine the average power usage 
void energyUpdate(){
    float Powers[6];
    // battV, battA, LoadV, LoadA, SolarV, SolarA
    readVoltAmp(Powers);
    // Energy used is the power to the loads times time
    ENERGY_USED += Powers[2]*((-1.0)*Powers[3])*(float(ENERGY_TIME_ELAPSED)/1000.0);
    // Energy generated is the power going into the battery plus the power used times time
    ENERGY_GENERATED += ( (Powers[0]*Powers[1]) + (Powers[2]*((-1.0)*Powers[3])) )*(float(ENERGY_TIME_ELAPSED)/1000.0);
    // Battery Energy is the long term sum of energy entering (or leaving) the battery
    BATT_ENERGY += Powers[0]*Powers[1]*(float(ENERGY_TIME_ELAPSED)/1000.0); // BATT_ENERGY is just the long term sum
    // Reset the timer
    ENERGY_TIME_ELAPSED = 0;

}// energyUpdate()


// If the current battery voltage is less than 13volts then the starting level
// is less than 0kJ. The following is an approximation of energy level based only
// on the battery voltage. Its not super accurate
// I tried to estimate the voltage/capacity relationship from the spec sheet.
// This equation is my best guess at the linear fit. Don't trust it
void estimateBattState(){ //TODO make this function better

    float battery_voltage[6];
    readVoltAmp(battery_voltage);
    if(battery_voltage[0] < 11.76){
        BATT_ENERGY = 0;
    }else if(battery_voltage[0] < 13.00){
        BATT_ENERGY = (unsigned long)(((battery_voltage[0] - 11.75)/1.35) * float(BATT_TOTAL_CAPACITY));
    }else{
        BATT_ENERGY = BATT_TOTAL_CAPACITY; // Otherwise assume it is fully charged
    }
    //debug_println("Estimate battery state, BATT_ENERGY");
    //debug_println(BATT_ENERGY);
}
