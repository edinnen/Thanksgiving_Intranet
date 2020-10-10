/*
  Thanksgiving Cabin Power System Monitor

  Functions for talking to an attached RPi
  Transfering files and live data!

  Modified to just simulate data output.
*/



void RPi_setup() {

  RPiSerial.begin(115200);
  RPiSerial.setTimeout(5000);
}

// Called when a full command has been parsed
void readCmd() {
  newData = false;
  // If the command is more than one char, it is hopefully a filename
  if (strlen(receivedChars) > 1) {
    RPiSerial.println("<1>");
    delay(100);
    printFile();
    return;
    // strcmp checks to see if the strings are equal
  } else if (strcmp(receivedChars, "0") == 0) {
    RPiSerial.println("<0>");
    // Just saying hi!
    return;
  } else if (strcmp(receivedChars, "2") == 0) {
    RPiSerial.println("<2>");
    delay(100);
    printRootDirectory();
    return;
  } else if (strcmp(receivedChars, "3") == 0) {
    RPiSerial.println("<3>");
    singleLiveData();
    return;
  } else if (strcmp(receivedChars, "4") == 0) {
    RPiSerial.println("<4>");
    // toggle the stream
    STREAM_DATA_PY = STREAM_DATA_PY ? false : true;
    STREAM_DATA_ELAPSED = 0;
    return;
  } else if (strcmp(receivedChars, "5") == 0) {
    RPiSerial.println("<5>");
    delay(100);
    RPiSerial.print('<');
    RPiSerial.print("1602129460");
    //RPiSerial.print(now());
    RPiSerial.println('>');
    return;
  } else if (strcmp(receivedChars, "6") == 0) {
    RPiSerial.println("<6>");
    // Dump settings TODO
    return;
  } else if (strcmp(receivedChars, "7") == 0) {
    RPiSerial.println("<7>");
    // delete all the files on the SD card
    // Danger!
    deleteAllFilesOnSD();
    //newFile();
    return;
  } else {
    RPiSerial.print("$$ uC Didn't read cmd properly: ");
    RPiSerial.print(receivedChars);
    RPiSerial.println(" $$");
    return;
  }
}

// reads data from the RPiSerial and parses out commands
// sets a flag when complete indicating we should do something
void readFromPy() {
  // static keeps these values between function calls
  static bool recvInProgress = false;
  static byte ndx = 0;
  char rc;
  while ( RPiSerial.available() && newData == false) {
    rc = RPiSerial.read();
    if (recvInProgress == true) {
      if (rc != '>') {
        receivedChars[ndx] = rc;
        ndx++;
        if (ndx >= numChars) {
          ndx = numChars - 1;
        }
      } else {
        receivedChars[ndx] = '\0'; // terminate the string
        recvInProgress = false;
        ndx = 0;
        newData = true;
      }
    } else if (rc == '<') recvInProgress = true;
  }
  return;
}

double randomFloat(double minf, double maxf)
{
  return minf + random(1UL << 31) * (maxf - minf) / (1UL << 31);  // use 1ULL<<63 for max double values)
}

// function called when a filename is parsed
// prints out the file line by line then sends a final
// I'm done signal to indicate a good write/read
void printFile() {

  int i;
  for (i = 0; i < 10; i++) {
      RPiSerial.print(1602129460 + i);
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(13.0, 15.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(10.0, 18.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(1.0, 5.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(1.0, 5.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(65.0, 67.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(5.0, 6.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(4.0, 5.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(18.0, 25.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(20.0, 22.0));
      RPiSerial.print(",");
      RPiSerial.print(randomFloat(10.0, 12.0));
      RPiSerial.print("\n");
  }

  RPiSerial.println("<>");


  /*File fileObj = SD.open(receivedChars);

    if (fileObj) {
      while (fileObj.available()) {
        RPiSerial.write(fileObj.read());
    }
    // I'm done
    RPiSerial.println("<>");
    fileObj.close();
    }else {
      RPiSerial.print("$$ bad file open: ");
      RPiSerial.print(receivedChars);
      RPiSerial.println("$$");
    }*/
}

// Prints out the root directory of the SD card
void printRootDirectory() {
  RPiSerial.println("<buttss.ONN>");
  RPiSerial.println("<buttst.OFF>");
  RPiSerial.println("<buttsu.ONN>");
  /*
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
  */
  // I'm done command
  RPiSerial.println("<>");
}

void singleLiveData() {
  char data[150];
  //generateDataString(data);
  RPiSerial.print('<');
  //RPiSerial.print(data);
  RPiSerial.print("1596509816,13.85,0.00,-0.12,0.02,-1.00,0.00,0.00,13.69,18.75,19.88");
  RPiSerial.println('>');
}

// Not implemented yet. Will just spit out system settings and stuff.
void dumpSettings() {
  char data[150];
  // debug flags, last gps fix,
  sprintf(data, "");
}

void deleteAllFilesOnSD() {
  /*File dir = SD.open("/");

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
  */
  // I'm done command
  RPiSerial.println("<>");
}
