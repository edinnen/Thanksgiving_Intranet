
void analog_setup(){
    pinMode(REF_PWR_PIN, OUTPUT);
    digitalWrite(REF_PWR_PIN, LOW);
    pinMode(REF_READ_PIN, INPUT);
    readReference();
}

void readReference(){
    int readings = 0;

    digitalWrite(REF_PWR_PIN, HIGH);
    delay(500);
    analogRead(REF_READ_PIN);
    for(int i=0;i<10;i++){
        readings += analogRead(REF_READ_PIN);
        delay(5);
    }
    readings = readings/10;
    VOLT_CALIBRATION = (int)(4096.0/(float)readings*1024.0);
    //VOLT_CALIBRATION = VOLT_CALIBRATION/10;
    digitalWrite(REF_PWR_PIN, LOW);
    debug_println("readReference");
    debug_println(VOLT_CALIBRATION);
}

void readVoltages(int &Batt, int &Solar, int &Hydro){
    analogRead(A0);
    //Batt  = (analogRead(VOLT_PIN[0]) * VOLT_MULTI[0]) / VOLT_CALIBRATION;
    //Solar = (analogRead(VOLT_PIN[1]) * VOLT_MULTI[1]) / VOLT_CALIBRATION;
    //Hydro = (analogRead(VOLT_PIN[2]) * VOLT_MULTI[2]) / VOLT_CALIBRATION + Batt;
    Batt = (int)((float)VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[0])*3.876);
    Solar = (int)((float)VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[1])*7.336);
    Hydro = (int)((float)VOLT_CALIBRATION / 1024.0 * (float)analogRead(VOLT_PIN[2])*12.354);
    return;
}

void readAmp(int &Load, int &Batt, int &Solar, int &Hydro){

    Load  = (analogRead(AMP_PIN[0]) - AMP_DC_OFFSET[0]) * AMP_MULTI[0];
    Batt  = (analogRead(AMP_PIN[1]) - AMP_DC_OFFSET[1]) * AMP_MULTI[1];
    Solar = (analogRead(AMP_PIN[2]) - AMP_DC_OFFSET[2]) * AMP_MULTI[2];
    Hydro = (analogRead(AMP_PIN[3]) - AMP_DC_OFFSET[3]) * AMP_MULTI[3];
}

void testVoltage(){
    int batt, solar, hydro;
    readVoltages(batt, solar, hydro);
    debug_println("Battery, Solar, Hydro");
    debug_println(batt);
    debug_println(solar);
    debug_println(hydro);
    //debug_println(sprintf("%d, %d, %d", batt, solar, hydro));
}
