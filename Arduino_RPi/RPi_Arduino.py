#!/usr/bin/env python3
# Created: 2020 March 15
# Stuart de Haas

# A program to talk to the TGC PSM Arduino

import sys
import glob
import serial
import time
from time import sleep

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


def OLDreadLine():
    """ Reads in a newline terminated string from the serial port and converts
    it to the correct encoding and removes trailing whitespace characters"""
    # TODO make better?
    for i in range(4):
        line = ser.read_until()
        if len(line) != 0: # if we got a line then break
            break
        elif i > 2:
            return -1
    if line[0:2] == "$$":
        print(line)
        return -1
    else:
        try:
            return line.decode("utf-8").rstrip()
        except:
            print("Couldn't decode line")
            return ""

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
        rc = ser.read().decode("utf-8")

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


def writeLine2file(filename, line):
    #line = readLine()
    #print(line)
    f = open(outputFolder + filename, "a")
    f.write(line + '\n')
    f.close

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
                print("Lines printed: " + str(numlines))
                f.close
                return
            elif line == "<>":
                print("End of File reached")
                print("Lines printed: " + str(numlines))
                f.close
                return
            elif line.find("$$") != -1:
                print("Bad filename read by arduino")
                print(line)
                f.close
                return

            else:
                f.write(line + '\n')
                numlines += 1
    else:
        print("Didn't print file")
        f.close
        return

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



def main():

    connectPi()
    writeCmd(6)
    getuCTime()
    getuCDataOutput()

    fileList = printRootDir()
    if fileList != -1:
        before = time.time()
        for filename in fileList[:9]:
           saveFile(filename)
        print("Time Elapsed: " + str(time.time()-before))
    while True:
        print(readLine())

try:
    main()
except(KeyboardInterrupt, SystemExit):
    print()
    print("Keyboard Interrupt. Exiting")
    ser.close()
except(serial.serialutil.SerialException):
    print()
    print("Arduino done fucked off I guess... Serial Exception")
    ser.close()
except:
    ser.close()
    raise
