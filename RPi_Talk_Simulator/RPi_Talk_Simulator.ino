/*
   Thanksgiving Cabin Power System Monitor Simulator (TGCPSMS)

   Created to help Ethan build a dope-ass RPi webserver to hand out that sweet sweet data

   Created: October 2020
*/

#include "elapsedMillis.h"  //https://playground.arduino.cc/Code/ElapsedMillis#source

#define RPiSerial Serial
#define RPI_ENABLE

#define DEBUG

#ifdef DEBUG
#define debug_print(x)   \
  Serial.print("DEBUG: "); \
  Serial.print(x);
#define debug_println(x) \
  Serial.print("DEBUG: "); \
  Serial.println(x);
#define humanTime()      \
  printhumanTime();
#else
#define debug_print(x)
#define debug_println(x)
#define humanTime()
#endif

//************************** RPi Py talk stuff **********************************
#ifdef RPI_ENABLE
// size of the command buffer
const byte numChars = 14;
// command buffer
char receivedChars[numChars];
// Flag to indicate a full command has been parsed
bool newData = false;
bool STREAM_DATA_PY = false;

// tracking when to send data to py when stream is requested
elapsedMillis STREAM_DATA_ELAPSED;
const int STREAM_DATA_INTERVAL = 3000;
#endif

void setup() {
#ifdef RPI_ENABLE
  RPi_setup();
  //    RPiSerial.println("******** Hello and welcome to the TGCPSMS ***********");
#else
#ifdef DEBUG
  // Set the baud rate between the arduino and computer. 115200 is nice and fast!
  Serial.begin(115200);
#endif
#endif
}// setup()

int i = 0;
void loadConnected() {

#ifdef RPI_ENABLE
  // Parse data from RPiSerial
  if (RPiSerial.available()) readFromPy();
  // We found a command! Rock and roll!
  if (newData == true) readCmd();

  if (STREAM_DATA_PY == true) {
    if (STREAM_DATA_ELAPSED > STREAM_DATA_INTERVAL) {
      RPiSerial.print("<");
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
      RPiSerial.print(randomFloat(98.0, 100.0));
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
      RPiSerial.println(">");
      i++;
      //singleLiveData();
      STREAM_DATA_ELAPSED = 0;
    }
  }

#endif

  /*
    // Update the energy state every interval
    if(ENERGY_TIME_ELAPSED > ENERGY_TIME_INTERVAL) energyUpdate();

    // Write to the SD card every 'LOAD_INTERVAL'
    if(SYSTEM_TIME_ELAPSED > LOAD_INTERVAL) writeReadings();
  */

}

void singleLiveData();

void loop() {

  loadConnected();

  randomSeed(analogRead(0));
  delay(random(5, 50)); // Adding in a random delay to simulate real life! probably not important...

}
