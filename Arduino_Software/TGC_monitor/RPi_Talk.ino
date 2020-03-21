/*
Thanksgiving Cabin Power System Monitor

Functions for talking to an attached RPi
Transfering files and live data!
*/



void RPi_setup(){

RPiSerial.begin(57600);
RPiSerial.setTimeout(5000);
}

//void serialEvent(){
void readCmd(){
    //RPiSerial.println("readCmd");
    //RPiSerial.flush();
    //RPiSerial.println("Checking for Serial data...");
    //if(!RPiSerial.available()) return;
    //RPiSerial.print("readCmd! ");
    //RPiSerial.println(receivedChars);
    newData = false;
    if(strlen(receivedChars) > 1){
            RPiSerial.print("<1>");
            //RPiSerial.flush();
            printFile();
            return;
    }else if(strcmp(receivedChars, "2") == 0){
            RPiSerial.print("<2>");
            //RPiSerial.flush();
            printRootDirectory();
            return;
    }else if(strcmp(receivedChars, "3") == 0){
            RPiSerial.print("<3>");
            //RPiSerial.flush();
            return;
    }else{
        RPiSerial.println("$$ uC Didn't read cmd properly");
        return;
    }

    //int cmd = 0;

    //unsigned long start = millis();
    //while(millis() - start < 1000){ // Try for some time

        //if(RPiSerial.find('<')){
            //cmd = RPiSerial.parseInt();
            //while(RPiSerial.available()) RPiSerial.read();

            /*
            switch(receivedChars){
                case '1':
                    RPiSerial.println("<1>\n");
                    RPiSerial.flush();
                    return;
                case '2':
                    RPiSerial.println("<2>\n");
                    RPiSerial.flush();
                    printRootDirectory();
                    return;
                case '3':
                    RPiSerial.println("<3>\n");
                    RPiSerial.flush();
                    printFile();
                    return;
                default:
                    RPiSerial.println("<0>\n");
                    return;
            }
            */
        //}
    //}

}


void printRootDirectory() {
  File dir = SD.open("/");

  while (true) {
    File entry =  dir.openNextFile();
    if (! entry) break; // no more files!
    RPiSerial.println(entry.name());
    entry.close();
  }
  RPiSerial.println("<>");
}


//void readStrRPi(char output[]){
void readFromPy(){
    static bool recvInProgress = false;
    static byte ndx = 0;
    //byte numChars = 13; // 12 for name, one for termination
    char rc;
    //strcpy(output, "Bad read");

    //unsigned long start = millis();
    // Wait until the string starts coming in
    //while(millis() - start < 1000 && !RPiSerial.available());

    //while (RPiSerial.available()) {
    //while(millis() - start < 1000){
    while( RPiSerial.available() && newData == false){
        rc = RPiSerial.read();
        //RPiSerial.println(rc);

        if(recvInProgress == true){
            if (rc != '>'){
                receivedChars[ndx] = rc;
                ndx++;
                if(ndx >= numChars){
                    ndx = numChars -1;
                }
            }else {
                receivedChars[ndx] = '\0'; // terminate the string
                recvInProgress = false;
                ndx = 0;
                newData = true;
            }
        }else if (rc == '<') recvInProgress = true;

        //delay(1); // This goes too fast for python! Gotta slow it down
    }
    return;
}

void printFile(){
    //char dataFile[] = "5E7334CF.ONN";
    //readStrRPi(dataFile);

    File fileObj = SD.open(receivedChars);

    if (fileObj) {
        while (fileObj.available()) {
        RPiSerial.write(fileObj.read());
    }
    // tell python I am done
    //RPiSerial.print("Sucessfully read: ");
    //RPiSerial.print(dataFile);
    //RPiSerial.write(dataFile, numChars);
    RPiSerial.println("<>");
    fileObj.close();
  }else {
        RPiSerial.print("$$ bad file open: ");
        //RPiSerial.write(dataFile, numChars);
        RPiSerial.println(receivedChars);
        //RPiSerial.println(0);
  }
}
