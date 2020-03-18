/*
Thanksgiving Cabin Power System Monitor

Functions for talking to an attached RPi
Transfering files and live data!
*/

void RPi_setup(){
RPiSerial.begin(115200);
}

void readCmd(){
    //RPiSerial.println("readCmd");
    //RPiSerial.flush();
    if(!RPiSerial.available()) return;
    int cmd = 0;

    unsigned long start = millis();
    while(millis() - start < 1000){ // Try for some time
        RPiSerial.find('D');
        //cmd == RPiSerial.read();
        cmd = RPiSerial.parseInt();
        while(RPiSerial.available()) RPiSerial.read();
        //RPiSerial.flush();
        //RPiSerial.println(cmd);
        switch(cmd){
            case 1:
                RPiSerial.println("D1");
                RPiSerial.flush();
                break;
            case 2:
                RPiSerial.println("D2");
                RPiSerial.flush();
                printRootDirectory();
                break;
            case 3:
                RPiSerial.println("D3");
                RPiSerial.flush();
                printFile();
                break;
            default:
                RPiSerial.println("D0");
        }
    }

}


void printRootDirectory() {
  File dir = SD.open("/");

  while (true) {
    File entry =  dir.openNextFile();
    if (! entry) break; // no more files!
    Serial.println(entry.name());
    entry.close();
  }
}

void printFile(){
    byte ndx = 0;
    byte numChars = 13; // 12 for name, one for termination
    char rc;
    char dataFile[numChars] = "Bad read!!!!";

    unsigned long start = millis();
    // Wait until the filename starts coming in
    while(millis() - start < 1000 && !RPiSerial.available());

    while (RPiSerial.available()) {
    //while (ndx < numChars) {
        rc = RPiSerial.read();
        //if (rc != '\n') {
        if (rc != '\n' && ndx < (numChars-1)) {
            dataFile[ndx] = rc;
            ndx++;
        }else {
            dataFile[ndx] = '\0'; // terminate the string
            break;
        }
        delay(1);
    }
  File fileObj = SD.open(dataFile);

  if (fileObj) {
    while (fileObj.available()) {
      RPiSerial.write(fileObj.read());
    }
    RPiSerial.print("Sucessfully read: ");
    RPiSerial.print(dataFile);
    //RPiSerial.write(dataFile, numChars);
    fileObj.close();
  }else {
    RPiSerial.print("error opening file: ");
    //RPiSerial.write(dataFile, numChars);
    RPiSerial.print(dataFile);
    //RPiSerial.println(0);
  }
}
