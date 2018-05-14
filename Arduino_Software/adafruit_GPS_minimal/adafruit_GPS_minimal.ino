// Test code for Ultimate GPS Using Hardware Serial
//

//#include "RTClib.h"
#include <Adafruit_GPS.h>

// what's the name of the hardware serial port?
#define GPSSerial Serial1

Adafruit_GPS GPS(&GPSSerial);


void setup() {
    // wait for hardware serial to appear
    while (!Serial);

    // make this baud rate fast enough so we aren't waiting on it
    Serial.begin(115200);

    // 9600 baud is the default rate for the Ultimate GPS
    GPS.begin(9600);

    delay(50);
    // Warm restart the GPS
    //GPSSerial.println("$PMTK101*32");
    // Only output the RMC data
    //GPSSerial.println("$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29");
    GPS.sendCommand(PMTK_SET_NMEA_OUTPUT_RMCGGA); // Set RMC only
    GPS.sendCommand(PMTK_SET_NMEA_UPDATE_1HZ); // 1 Hz update rate
    //DateTime dt(2018,04,21,12,34,1);
    //Serial.print("The time is: ");
    //Serial.println(dt.unixtime());
    delay(1000);
}

int unixTime(){
    while(1){
        char c = GPS.read();
        if (GPS.newNMEAreceived()) {
            //Serial.println(GPS.lastNMEA()); // this also sets the newNMEAreceived() flag to false
            //Serial.println(GPS.minute, DEC); 
            if (GPS.parse(GPS.lastNMEA())){ // this also sets the newNMEAreceived() flag to false
                //Serial.println("FAIL");
                return;
            }// we can fail to parse a sentence in which case we should just wait for another
        }else{
            //Serial.println("narp");
        }
    }
}


void loop() {


    while (Serial.available()) {
        char c = Serial.read();
        //GPSSerial.write(c);
        if(c=='s') GPSSerial.println("$PMTK161,0*28");
        if(c=='w') GPSSerial.println("$PMTK101*32");
        if(c=='f'){
            GPSSerial.println("$PMTK104*37");
            GPSSerial.println("$PMTK314,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0*29");
        }
    }

}
