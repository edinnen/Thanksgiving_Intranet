/*
 * Thanksgiving Cabin Power System Monitor Simulator (TGCPSMS)
 * 
 * Created to help Ethan build a dope-ass RPi webserver to hand out that sweet sweet data
 * 
 * Created: October 2020
 */

#include "elapsedMillis.h" //https://playground.arduino.cc/Code/ElapsedMillis#source

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
const int STREAM_DATA_INTERVAL = 5000;
#endif

void setup() {
#ifdef RPI_ENABLE
    RPi_setup();
    RPiSerial.println("******** Hello and welcome to the TGCPSMS ***********");
#else
#ifdef DEBUG
// Set the baud rate between the arduino and computer. 115200 is nice and fast!
    Serial.begin(115200);
#endif
#endif

}// setup()

void loadConnected(){

#ifdef RPI_ENABLE
    // Parse data from RPiSerial
    if(RPiSerial.available()) readFromPy();
    // We found a command! Rock and roll!
    if(newData == true) readCmd();

    if(STREAM_DATA_PY == true){
        if(STREAM_DATA_ELAPSED > STREAM_DATA_INTERVAL){
            RPiSerial.println("1596509816,13.85,0.00,-0.12,0.02,-1.00,0.00,0.00,13.69,18.75,19.88");
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
  delay(random(5,50)); // Adding in a random delay to simulate real life! probably not important...

}
