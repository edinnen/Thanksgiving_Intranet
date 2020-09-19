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

processedFilesFolder = "processedFiles/"

def findAllOutputFiles():
    print("Finding all local files...")

    files = []
    for filename in os.listdir(outputFolder):
        hexTime = int(filename.split('.')[0], 16)
        files.append((hexTime, filename))
    #print(files)
    #print(files.sort(key=lambda tup: tup[0]))
    files =  sorted(files, key=lambda tup: tup[0])
    print(files)
    return files


def concatFiles():
    print("concatFiles...")
    files = findAllOutputFiles()
    _ , test = files[0]
    #print(outputFolder + test)
    #print(pd.read_csv(outputFolder + test, sep=',', comment='#', header=None))

    listOfFrames = []
    for _ , f in files:
        try:
            df = pd.read_csv(outputFolder + f, sep=',', comment='#',
                    header=None, dtype=float,
                    names = ["Unix", "BattV", "SolarV", "BattA", "LoadA",
                        "BattPercent", "AveBattPower", "AveLoadPower",
                        "OutsideTemp", "CabinTemp", "BattTemp"])
        except (pd.errors.EmptyDataError):
            print("Bad file: " + f)
            pass

        # Add a column indicating if the loads are connected
        if f.find('.ON') != -1:
            df['LoadsConnected'] = 1
        else:
            df['LoadsConnected'] = 0

        listOfFrames.append(df)


    # Combine all the file dataframes into one big one
    combined_df = pd.concat(listOfFrames)

    # Remove any rows with timestamps before ~Jan 2020 or after ~ Jan 2030
    # If the clock is messed up on the uC it will sometimes output funny dates
    # This won't remove all the bad data but will help!
    indexNames = combined_df[ (combined_df["Unix"] < 1577903693) |
            (combined_df['Unix'] > 1893522893) ].index

    # Sort everything by the timestamp so it is in chronological order
    combined_df.drop(indexNames, inplace=True)
    combined_df.sort_values(by=['Unix'], inplace=True)

    # Elaborate way to get the first timestamp
    firstTime = combined_df.iloc[0, combined_df.columns.get_loc('Unix')]
    # Unix time used by uC is actually offset from true UNIX time
    # The Vancouver timezone is used, not UTC so we have to convert
    # Makes it kinda confusing here but easier for the uC
    #print(time.ctime(int(firstTime + 7*3600))) # outputs the correct time
    processedFilename = time.strftime("%Y%m%d_%H%M%S.csv", time.gmtime(firstTime))
    print("Processed file will be:")
    print(processedFilename)

    # Add a more readable datetime column (goes to far right column)
    combined_df['dateTime'] = pd.to_datetime(combined_df['Unix'], unit='s')
    # Move datetime column to the left
    cols = combined_df.columns.tolist()
    cols = cols[-1:] + cols[:-1]
    combined_df = combined_df[cols]

    #export to csv
    combined_df.to_csv(processedFilesFolder +  processedFilename, index=False, encoding="utf-8")

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
    concatFiles()

    while True:
        print(uC.readLine())

try:
    #main()
    concatFiles()
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
