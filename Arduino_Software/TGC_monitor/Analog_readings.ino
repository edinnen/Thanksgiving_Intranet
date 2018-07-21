
void analog_setup(){
    pinMode(REF_PWR_PIN, OUTPUT);
    digitalWrite(REF_PWR_PIN, LOW);
    pinMode(REF_READ_PIN, INPUT);
    readReference();
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
    debug_println("readReference");
    debug_println(VOLT_CALIBRATION);
}

void readVoltages(char Battstr[], char Solarstr[], char Hydrostr[]){
    // Take analog volatage readings, convert to voltage, conver to char array and store in provided variable

    analogRead(VOLT_PIN[0]); // Prep the ADC

    // Take the readings and convert to correct voltage
    float Batt  = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[0])*VOLT_MULTI[0];
    float Solar = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[1])*VOLT_MULTI[1];
    float Hydro = VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[2])*VOLT_MULTI[2]; //TODO

    // Convert the floating point number to a char array stored in the provided variable
    // sprintf doesn't work with floats on arduino. dumb. Have to use this functon by AVR
    dtostrf(Batt,  4, 2, Battstr);
    dtostrf(Solar, 4, 2, Solarstr);
    dtostrf(Hydro, 4, 2, Hydrostr);
    return;
}

void readAmps(char Loadstr[], char Battstr[], char Solarstr[], char Hydrostr[]){
    // Same as readVoltages()

    analogRead(A0);

    float Load  = (float)(analogRead(AMP_PIN[0]) - AMP_DC_OFFSET[0]) * AMP_MULTI[0];
    float Batt  = (float)(analogRead(AMP_PIN[1]) - AMP_DC_OFFSET[1]) * AMP_MULTI[1];
    float Solar = (float)(analogRead(AMP_PIN[2]) - AMP_DC_OFFSET[2]) * AMP_MULTI[2];
    float Hydro = (float)(analogRead(AMP_PIN[3]) - AMP_DC_OFFSET[3]) * AMP_MULTI[3];

    dtostrf(Load,  4, 2, Loadstr);
    dtostrf(Batt,  4, 2, Battstr);
    dtostrf(Solar, 4, 2, Solarstr);
    dtostrf(Hydro, 4, 2, Hydrostr);
    return;
}

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
