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
            RPiSerial.println("<1>");
            printFile();
            return;
        // strcmp checks to see if the strings are equal
    }else if(strcmp(receivedChars, "0") == 0){
            RPiSerial.println("<0>");
            // Just saying hi!
            return;
    }else if(strcmp(receivedChars, "2") == 0){
            RPiSerial.println("<2>");
            // Ensure we don't print command response on the same line as filenames
            delay(100);
            printRootDirectory();
            return;
    }else if(strcmp(receivedChars, "3") == 0){
            RPiSerial.println("<3>");
            singleLiveData();
            return;
    }else if(strcmp(receivedChars, "4") == 0){
            RPiSerial.println("<4>");
            // toggle the stream
            STREAM_DATA_PY = STREAM_DATA_PY ? false : true;
            STREAM_DATA_ELAPSED = 0;
            return;
    }else if(strcmp(receivedChars, "5") == 0){
            RPiSerial.println("<5>");
            delay(100);
            RPiSerial.print('<');
            RPiSerial.print(now());
            RPiSerial.println('>');
            return;
    }else if(strcmp(receivedChars, "6") == 0){
            RPiSerial.println("<6>");
            // Dump settings TODO
            return;
    }else if(strcmp(receivedChars, "7") == 0){
            RPiSerial.println("<7>");
            // delete all the files on the SD card
            // Danger!
            deleteAllFilesOnSD();
            newFile();
            return;
    }else{
        RPiSerial.print("$$ uC Didn't read cmd properly: ");
        RPiSerial.print(receivedChars);
        RPiSerial.println(" $$");
        return;
    }
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
          RPiSerial.print(fileObj.read());
    }
    // I'm done
    RPiSerial.println("<>");
    fileObj.close();
  }else {
        RPiSerial.print("$$ bad file open: ");
        RPiSerial.print(receivedChars);
        RPiSerial.println("$$");
  }
}

// Prints out the root directory of the SD card
void printRootDirectory() {
  File dir = SD.open("/");

  if( !dir ){
      RPiSerial.println("$$ Couldn't open SD card root $$");
      return;
  }

  while (true) {
    File entry =  dir.openNextFile();
    if (! entry) break; // no more files!
    RPiSerial.print("<");
    RPiSerial.print(entry.name());
    RPiSerial.println(">");
    entry.close();
  }
  // I'm done command
  RPiSerial.println("<>");
}

void singleLiveData(){
    char data[150];
    generateDataString(data);
    RPiSerial.print('<');
    RPiSerial.print(data);
    RPiSerial.println('>');
}

void dumpSettings(){
    char data[150];
    // debug flags, last gps fix,
    sprintf(data, "");
}

void deleteAllFilesOnSD() {
  File dir = SD.open("/");

  if( !dir ){
      RPiSerial.println("$$ Couldn't open SD card root");
      return;
  }

  char filename[14];

  while (true) {
    File entry =  dir.openNextFile();
    if (! entry) break; // no more files!
    strcpy(filename, entry.name());
    entry.close();
    RPiSerial.print("Removing file: ");
    RPiSerial.println(filename);
    SD.remove(filename);
  }
  // I'm done command
  RPiSerial.println("<>");
}
