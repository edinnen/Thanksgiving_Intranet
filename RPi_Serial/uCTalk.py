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

ser = serial.Serial()
outputFolder = "output/"
uCport = "/dev/ttyACM0"

def search4uC():
    """ Used to search ports to find the uC. """

   # Only works for Linux (why would I use anything else though?
    temp_list = glob.glob ('/dev/tty[A-Za-z]*')

    # Find the arduino
    for a_port in temp_list:
        try:
            s = serial.Serial(a_port)
            s.close()
            return a_port
        except serial.SerialException:
            print("Connection failed, shit.")
            pass


def connectPi():
    """Connects to the Arduino via USB serial"""
    global ser

    print("Connecting to arduino...")
# Connect to discovered serial USB port
    ser = serial.Serial(uCport, 115200, timeout=5, exclusive=True)
    print("Connected to: " + ser.name)
    return

def disconnectPi():
    print("Goodbye, uC")
    ser.close()


def readLine():
    """ Reads in a newline terminated string from the serial port and converts
    it to the correct encoding and removes trailing whitespace characters"""

    line = ser.read_until()
    if line[0:2] == "$$":
        print(line)
        return -1
    else:
        try:
            return line.decode("utf-8").rstrip()
        except:
            print("Couldn't decode line")
            return ""

def readCmd():
    """ Parses out a single character contained in '<>'
    i.e. '<1>' returns int(1)
    returns the single character as an int, or
    returns -1 if it fails"""

    recvInProgress = False
    timeout = time.time() + 10
    while time.time() < timeout:
        try:
            rc = ser.read().decode("utf-8")
        except(UnicodeDecodeError):
            continue

        if recvInProgress == True:
            if rc != '>':
                cmd = rc
            else:
                #while(ser.in_waiting != 0):
                #    ser.read()
                try:
                    return int(cmd)
                except:
                    print("Bad command parse")
                    return -1
        elif rc == '<':
            recvInProgress = True
    print("Timeout on readCmd")
    return -1


def readuCOutput():

    recvInProgress = False
    timeout = time.time() + 10
    output = ""
    while time.time() < timeout:
        rc = ser.read().decode("utf-8")

        if recvInProgress == True:
            if rc != '>':
                output = output + rc
            else:
                return output.rstrip()
        elif rc == '<':
            recvInProgress = True
    print("Timeout on readCmd")
    return -1


def writeCmd(cmd):
    """Take in a single integer value (command), try sending it to the arduino
    command is wrapped in '<>'. Then wait for confirmation from the uC

    """
    # Needed? TODO
    while ser.in_waiting > 0:
        readLine()
    print("Write command: " + str(cmd))
    cmd = '<' + str(cmd) + '>'
    ser.write(cmd.encode("utf-8"))
    reply = readCmd()
    if reply == -1:
        print("CMD no worky :(")
    else:
        return reply
    return -1


def saveFile(outputFile):
    f = open(outputFolder + outputFile, "w")

    print()
    print("Save File:  " + outputFile)
    filename = '<' + outputFile + '>'
    ser.write(filename.encode("utf-8"))
    if readCmd() == 1:
        numlines = 0
        while True:
            line = readLine()
            if line == -1:
                print("bad line read")
                break
            elif line == "<>":
                print("End of File reached")
                print("Lines printed: " + str(numlines))
                f.close
                return 0
            else:
                f.write(line + '\n')
                numlines += 1

        # Error occured during read
        # Delete the incomplete file
        print("Lines printed: " + str(numlines))
        f.close
        if os.path.exists(outputFolder + outputFile):
            os.remove(outputFolder + outputFile)
        return -1
    else:
        print("Didn't print file")
        f.close
        return -1


def printRootDir():
    """ Requests the file list from the uC and saves it as a list
    """
    fileList = []
    if writeCmd(2) == 2:
        print("Fetching file names...")
        for i in range(1000):
            line = readLine()
            #print(line)
            if line.find(".ON") != -1 or line.find(".OFF") != -1:
                fileList.append(line)
            elif line == "<>":
                print("Files found: " + str(i))
                print("File List:")
                print(fileList)
                return(fileList)
            elif line == -1:
                break;
    else:
        print("print directory failed")
        return -1


def getuCDataOutput():
    print("Fetching a line of data from the uC...")

    if writeCmd(3) == 3:
        rawData = readuCOutput()
        print(rawData)
        dataList = rawData.split(',')
        print(dataList)
        floatDataList = []
        for cell in dataList:
            floatDataList.append(float(cell))
        print(floatDataList)
        print(time.ctime(int(floatDataList[0] + 7*3600)))


    else:
        print("Failed to get data :(")


def getuCTime():
    print("Fetching the time...")

    if writeCmd(5) == 5:
        try:
            unix = readuCOutput()
            unix = int(unix)
        except:
            print("failed to parse unix time: ")
            print(unix)
            return
        print("The time and date is: ")
        print(time.ctime(unix + 7*3600))
        return

def dosomething6():
    pass


def deleteAllFilesuC():
    """ Tells the uC to delete all files in the root directory of the SD card
    detects success and returns 0. Otherwise returns -1
    """
    if writeCmd(7) == 7:
        print("Fetching file names...")
        for i in range(1000):
            line = readLine()
            if line == "<>":
                print("Files deleted: " + str(i))
                return 0
            elif line == -1:
                break;
    else:
        print("Failed to delete all files from uC")
        return -1


def downloadAllFiles():
    fileList = printRootDir()
    naughtyList = []

    if fileList != -1:
        before = time.time()
        for filename in fileList:
            if( saveFile(filename) == -1):
                naughtyList.append(filename)
        print("Time Elapsed: " + str(time.time()-before))
        if len(naughtyList) > 0:
            print ("Didn't print all the files. Here is the naughty list:")
            print(naughtyList)


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
            df = pd.read_csv(outputFolder + f, sep=',', comment='#', header=None, dtype=float,
                    names = ["Unix", "BattV", "SolarV", "BattA", "LoadA", "BattPercent", "AveBattPower", "AveLoadPower", "OutsideTemp", "CabinTemp", "BattTemp"])
            if len(df.columns) == 11:
                listOfFrames.append(df)
        except (pd.errors.EmptyDataError):
            print("Bad file: " + f)
            pass

    combined_df = pd.concat(listOfFrames)
    indexNames = combined_df[ (combined_df["Unix"] < 1577903693) | (combined_df['Unix'] > 1893522893) ].index
    combined_df.drop(indexNames, inplace=True)
    combined_df.sort_values(by=['Unix'], inplace=True)

    firstTime = combined_df.iloc[0, combined_df.columns.get_loc('Unix')]
    #firstTime += 7*36000
    #print(firstTime)
    print(time.ctime(int(firstTime + 7*3600)))
    processedFilename = time.strftime("%Y%m%d_%H%M%S.csv", time.gmtime(firstTime))
    print(processedFilename)

    #export to csv
    combined_df.to_csv( processedFilename, index=False, encoding="utf-8")
