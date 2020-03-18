#!/usr/bin/env python3
# Created: 2020 March 15
# Stuart de Haas

# A program to talk to the TGC PSM Arduino

import sys
import glob
import serial
#import time
from time import sleep

ser = "poop"
outputFolder = "output/"

def connectPi():
    """Connects to the Arduino via USB serial"""
    global ser

    # Only works for Linux (why would I use anything else though?
    temp_list = glob.glob ('/dev/tty[A-Za-z]*')

    # Find the arduino
    for a_port in temp_list:
        try:
            s = serial.Serial(a_port)
            s.close()
            result = a_port
            break
        except serial.SerialException:
            print("Connection failed, shit.")
            pass

# Connect to discovered serial USB port
    ser = serial.Serial(result, 115200, timeout=5, exclusive=True)
    print("Connected to: " + ser.name)


def readLine():
    line = ser.readline()
    if len(line) == 0:
        return -1
    else:
        return line.decode("utf-8").rstrip()

def readCmd():
    line = readLine()
    if line == -1:
        return -1
    else:
        #print(line)
        index = line.find('D')
        if(index == -1):
            return -1
        return int(line[index+1])


def writeLine2file(filename, line):
    #line = readLine()
    #print(line)
    f = open(outputFolder + filename, "a")
    f.write(line + '\n')
    f.close

def writeCmd(cmd):
    """Take in a single integer value (command), try sending it to the arduino
    a few times and return the reply or -1 if it fails"""

    print("Write command: " + cmd)
    for i in range(10):
        while ser.in_waiting == 0:
            ser.readline()
        ser.reset_input_buffer()
        ser.reset_output_buffer()
        cmd = 'D' + str(cmd)
        ser.write(cmd.encode("utf-8"))
        ser.flush()
        #sleep(1)
        reply = readCmd()
        if reply == -1:
            print("CMD no worky: " + str(i))
        else:
            return reply
    return -1

def printRootDir():
    fileList = []
    if writeCmd(2) == 2:
        for i in range(1000):
            line = readLine()
            if line == -1:
                break;
            if line.find(".ON") != -1 or line.find(".OFF") != -1:
                fileList.append(line)
                print(readLine())
        print("File List:")
        print(fileList)
        return(fileList)
    else:
        print("print directory failed")

def printFile(outputFile):

    filename = outputFile + '\n'
    print("Python " + filename)
    if writeCmd(3) == 3:
        #sleep(0.1)
        #print("Bytes written: " + str(ser.write(filename.encode("utf-8"))))
        ser.write(filename.encode("utf-8"))
        #ser.write(bytes(b"5E7105B9.ONN\n"))
        ser.flush()
        sleep(0.1)
        while ser.in_waiting == 0:
            pass
        while ser.in_waiting > 0:
            line = readLine()
            if line == -1:
                print("bad line read")
            else:
                #print(line)
                writeLine2file(outputFile, line)
        #print("That's all folks!")
    else:
        print("Didn't print file")

def main():

    connectPi()

    #printRootDir()
    #printFile("5E7105B9.ONN")
    #printFile("5E701307.ON")
    fileList = printRootDir()
    for filename in fileList:
        printFile(filename)
    #for i in range(10):
        #writeLine2file(ser)
        #writeCmd('3')
        #print(readCmd())
        #print(readLine())
    ser.close()


main()
