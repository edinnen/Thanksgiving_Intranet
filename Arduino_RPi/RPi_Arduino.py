#!/usr/bin/env python3
# Created: 2020 March 15
# Stuart de Haas

# A program to talk to the TGC PSM Arduino

import sys
import glob
import serial
import time
from time import sleep

ser = "poop"
outputFolder = "output/"

def connectPi():
    """Connects to the Arduino via USB serial"""
    global ser

    print("Connecting to arduino...")
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
    ser = serial.Serial(result, 57600, timeout=5, exclusive=True)
    print("Connected to: " + ser.name)
    return


def readLine():
    """ Reads in a newline terminated string from the serial port and converts
    it to the correct encoding and removes trailing whitespace characters"""
    for i in range(11):
        line = ser.read_until()
        if len(line) != 0:
            break
        elif i > 9:
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

def readCmd():

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


#def readCmd():
#    """ Returns the character directly following the command character """
#    line = readLine()
#    # Clean out the buffer
#    #while ser.in_waiting != 0:
#        #ser.readline()
#    if line == -1:
#        return -1
#    else:
#        print(line)
#        index = line.find('<')
#        if(index == -1):
#            return -1
#        cmd = line[index+1]
#        try:
#            return int(cmd)
#        except:
#            print("readCmd failed to parse cmd: " + line)
#            return -1


def writeLine2file(filename, line):
    #line = readLine()
    #print(line)
    f = open(outputFolder + filename, "a")
    f.write(line + '\n')
    f.close

def writeCmd(cmd):
    """Take in a single integer value (command), try sending it to the arduino
    a few times and return the reply or -1 if it fails"""

    i = 0
    print("Write command: " + str(cmd))
    cmd = '<' + str(cmd) + '>'
    #for i in range(10):
    #while ser.in_waiting != 0:
    #    ser.readline()
        #sleep(0.01)
    #ser.reset_input_buffer()
    #ser.reset_output_buffer()
    ser.write(cmd.encode("utf-8"))
    #ser.flush()
    #sleep(1)
    reply = readCmd()
    if reply == -1:
        print("CMD no worky: " + str(i))
        #sleep(0.1)
    else:
        return reply
    return -1

def printRootDir():
    fileList = []
    if writeCmd(2) == 2:
        print("Fetching file names...")
        for i in range(1000):
            line = readLine()
            if line.find(".ON") != -1 or line.find(".OFF") != -1:
                fileList.append(line)
                #print(readLine())
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
    #if writeCmd(3) == 3:
        #sleep(0.1)
        #print("Bytes written: " + str(ser.write(filename.encode("utf-8"))))
    ser.write(filename.encode("utf-8"))
    if readCmd() == 1:
        #ser.write(bytes(b"5E7105B9.ONN\n"))
        #ser.flush()
        #sleep(0.1)
        #while ser.in_waiting == 0:
        #    pass

        #while time.time() < timeout:
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
                #print(line)
                #writeLine2file(outputFile, line)
                f.write(line + '\n')
                numlines += 1
    else:
        print("Didn't print file")
        f.close
        return

def main():

    connectPi()

    #printRootDir()
    #printFile("5E7105B9.ONN")
    #printFile("5E701307.ON")
    fileList = printRootDir()
    if fileList != -1:
        for filename in fileList[:10]:
           saveFile(filename)
    while True:
        print(readLine())

try:
    main()
except(KeyboardInterrupt, SystemExit):
    print()
    print("Keyboard Interrupt. Exiting")
except:
    ser.close()
    raise
