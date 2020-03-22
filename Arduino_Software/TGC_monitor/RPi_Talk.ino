/*
Thanksgiving Cabin Power System Monitor

Functions for talking to an attached RPi
Transfering files and live data!
*/



void RPi_setup(){

RPiSerial.begin(115200);
RPiSerial.setTimeout(5000);
}

// Called when a full command has been parsed
void readCmd(){
    newData = false;
    // If the command is more than one char, it is hopefully a filename
    if(strlen(receivedChars) > 1){
            RPiSerial.print("<1>");
            printFile();
            return;
        // strcmp checks to see if the strings are equal
    }else if(strcmp(receivedChars, "2") == 0){
            RPiSerial.print("<2>");
            printRootDirectory();
            return;
    }else if(strcmp(receivedChars, "3") == 0){
            RPiSerial.print("<3>");
            singleLiveData();
            return;
    }else if(strcmp(receivedChars, "4") == 0){
            RPiSerial.print("<4>");
            // toggle the stream
            STREAM_DATA_PY = STREAM_DATA_PY ? false : true;
            STREAM_DATA_ELAPSED = 0;
            return;
    }else if(strcmp(receivedChars, "5") == 0){
            RPiSerial.print("<5>");
            RPiSerial.print('<');
            RPiSerial.print(now());
            RPiSerial.println('>');
            return;
    }else if(strcmp(receivedChars, "6") == 0){
            RPiSerial.print("<6>");
            // Dump settings TODO
            return;
    }else{
        RPiSerial.print("$$ uC Didn't read cmd properly: ");
        RPiSerial.println(receivedChars);
        return;
    }
}

void singleLiveData(){
    char data[150];
    generateDataString(data);
    RPiSerial.print('<');
    RPiSerial.print(data);
    RPiSerial.print('>');
}

// Prints out the root directory of the SD card
void printRootDirectory() {
  File dir = SD.open("/");

  if( !dir ){
      RPiSerial.println("$$ Couldn't open SD card root");
      return;
  }

  while (true) {
    File entry =  dir.openNextFile();
    if (! entry) break; // no more files!
    RPiSerial.println(entry.name());
    entry.close();
  }
  // I'm done command
  RPiSerial.println("<>");
}


// reads data from the RPiSerial and parses out commands
// sets a flag when complete indicating we should do something
void readFromPy(){
    // static keeps these values between function calls
    static bool recvInProgress = false;
    static byte ndx = 0;
    char rc;
    while( RPiSerial.available() && newData == false){
        rc = RPiSerial.read();
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
    }
    return;
}

// function called when a filename is parsed
// prints out the file line by line then sends a final
// I'm done signal to indicate a good write/read
void printFile(){

    File fileObj = SD.open(receivedChars);

    if (fileObj) {
        while (fileObj.available()) {
        RPiSerial.write(fileObj.read());
    }
    // I'm done
    RPiSerial.println("<>");
    fileObj.close();
  }else {
        RPiSerial.print("$$ bad file open: ");
        RPiSerial.println(receivedChars);
  }
}
