#!/usr/bin/env python3
# Created: 2020 March 15
# Stuart de Haas

# A program to talk to the TGC PSM Arduino

#import sys
#import glob
import serial
import time
from time import sleep
import os
import pandas as pd
import uCTalk as uC
from uCTalk import outputFolder

def main():
    uC.connectPi()
    connectTimeout = time.time() + 31
    while uC.writeCmd(0) != 0:
        if time.time() > connectTimeout:
            print("Timeout when trying to contact uC")
            return
    uC.getuCTime()
    uC.getuCDataOutput()
    uC.downloadAllFiles()
    #concatFiles()

    while True:
        print(uC.readLine())

try:
    main()
    #concatFiles()
except(KeyboardInterrupt, SystemExit):
    print()
    print("Keyboard Interrupt. Exiting")
    uC.disconnectPi()
except(serial.serialutil.SerialException):
    print()
    print("Arduino done fucked off I guess... Serial Exception")
    uC.disconnectPi()
except:
    uC.disconnectPi()
    raise
