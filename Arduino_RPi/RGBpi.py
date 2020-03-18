#!/usr/bin/env python
# Filename: RGBpi.py
# Created: Feb 16, 2016
# Author: Stuart de Haas
# Last edit: Feb 19, 2016
#
# Feb 26, 2016
#   Command line arguments added
#
# A program used to communicate with an Arduino over serial
# to power an RGB light strip

from __future__ import print_function
import sys
import getopt
import glob
import serial
import time
import binascii

# Dictionary of commands used to control the arduino
COMMANDS = {'HEY':5, 'SHARE_SETTINGS':6, 'CHANGE_SETTINGS':7,
        'SLEEP':8, 'CHILL':9, 'SET_COL':10, 'DEFINE_COL':11, 'PLAY_SEQ':12}

COLOURS = {'red':0, 'green':1, 'blue':2, 'white':3, 'turquoise':4, 'purple':5, 'yellow':6, 'orange':7, 'pink':8, 'lime':9, 'off':10}

SEQUENCES = {'rgb':0, 'sea':1, 'sun':2, 'forrest':3, 'rainbow':4, 'all':5, 'wStrobe':6, 'rStrobe':7, 'gStrobe':8, 'bStrobe':9}

SEQTYPES = {'none':0, 'partial':1, 'smooth':2}

SETTING_NAMES = {'fade time':(0, 10, "0-2500"),
                 'wait time':(1, 10, "0-2500"),
                 'time multi':(2, 1, "0-250"),
                 'seq num':(3, 1, "skip"),
                 'seq style':(4, 1, "skip"),
                 'set colour':(5, 1, "skip"),
                 'red':(6, 1, "skip"), 'green':(7, 1, "skip"),
                 'blue':(8, 1, "skip"), 'dimmer':(9, 1, "0-100"),
                 'state':(10, 1, "skip")}


SETTING_VALUES = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

def connectPi():
    """Connects to the Arduino via USB serial"""

    # Only works for Linux (why would I use anything else though?
    temp_list = glob.glob ('/dev/tty[A-Za-z]*')

    for a_port in temp_list:

        try:
            s = serial.Serial(a_port)
            s.close()
            result = a_port
            break
        except serial.SerialException:
            return "poop"
            pass

# Connect to discovered serial USB port at 9600 baud and 1 sec timeout
    ser = serial.Serial(result, 9600, timeout=1)

# First write just resets it.
    writeArd(ser, COMMANDS['HEY'])
    writeArd(ser, COMMANDS['HEY'])
    test = readArd(ser)
    if test != COMMANDS['HEY']:
        print("no 'Hey'")
        return "poop"

    return ser

def int2bytes(i):
    hex_string = '%x' % i
    n = len(hex_string)
    return binascii.unhexlify(hex_string.zfill(n + (n & 1)))

def writeArd(ser, num):
    flushSer(ser)

    try:
        ser.inWaiting()
    except:
        print ("Failed to write to Arduino")
        return

    #ser.write(num.to_bytes(1, 'big'))
    ser.write(int2bytes(num))
    #print("I wrote %s" % num )

def flushSer(ser):
    try:
        ser.flushInput()
        ser.flushOutput()
        while True:
# I really need this delay to be here
            time.sleep(0.01)
            if ser.inWaiting() > 0:
                ser.read()
            else:
                break
    except:
        print ("Failed to flush Arduino")


def readArd(ser):
    """ Reads from the Arduino."""
    val = "Fuck you"

    try:
        for i in range(1000):
            if ser.inWaiting() > 0:
                val = ord( ser.read() )
                break;
            time.sleep(0.01)
        else:
            print("Read Timeout")
            return -1
    except:
        print ("Failed to read from Arduino")

    # print( "I read: %s" %val )
    return val

def defineCol(ser):
    RGB = [ 'red', 'green', 'blue' ]
    colourVal = []

    for colour in RGB:
        while True:
            try:
                val = int(raw_input("How much %s? (0-255): " %colour))
            except ValueError:
                print("Invalid input")
                val = 300
            if val > 255 or val < 0:
                print("NOPE!! Not within the range")
                print("Try again")
            else:
                colourVal.append(val)
                break
    changeSettings(ser,
    [-1, -1, -1, -1, -1, -1, colourVal[0], colourVal[1], colourVal[2], -1, COMMANDS['DEFINE_COL']])

def changeSeqType(ser):

    while True:
        print("Choose a type of fade from this list")
        for i in SEQTYPES:
            print(i, end="")
            print(", ", end="")
        seq = raw_input("\n")
        if seq not in SEQTYPES:
            print("Not a vaild selection")
        else:
            break
    changeSettings(ser,
    [-1, -1, -1, -1, SEQTYPES[seq], -1, -1, -1, -1, -1, COMMANDS['PLAY_SEQ']])


def changeSeq(ser, seq = "null"):
    if seq == "null":
        while True:
            print("Choose a sequence from this list")
            for i in SEQUENCES:
                print(i, end="")
                print(", ", end="")
            seq = raw_input("\n")
            if seq not in SEQUENCES:
                print("Not a vaild sequence")
            else:
                break
    else:
        if seq not in SEQUENCES:
            print("Not a vaild sequence")

    changeSettings(ser,
    [-1, -1, -1, SEQUENCES[seq], -1, -1, -1, -1, -1, -1, COMMANDS['PLAY_SEQ']])


def changeCol(ser, colour = "null"):
    if colour == "null":
        while True:
            print("Choose a colour from this list")
            for i in COLOURS:
                print(i, end="")
                print(", ", end="")
            colour = raw_input("\n")
            if colour not in COLOURS:
                print("Not a vaild colour")
            else:
                break
    else:
        if colour not in COLOURS:
            print("Not a vaild colour")
            return
    changeSettings(ser,
    [-1, -1, -1, -1, -1, COLOURS[colour], -1, -1, -1, -1, COMMANDS['SET_COL']])


def confirm(ser, cmd):
    val = readArd(ser)
    # return True
    if val != COMMANDS[cmd]:
        print(val)
        print("Confirmation failed")
        return False
    else:
        return True


def sleepArd(ser):
    changeSettings(ser,
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, COMMANDS['SLEEP']])

def manualControl(ser):

    while True:
        try:
            cmd = int(raw_input("Command (one byte): "))
            if cmd > 255 or cmd < 0:
                print("Not a valid number")
            else:
                writeArd(ser, cmd)
        except ValueError:
            print("That wasn't valid")
            break

def isAlive(ser):

    writeArd(ser, COMMANDS['HEY'])

    for i in range(3):
        writeArd(ser, COMMANDS['HEY'])
        reply = readArd(ser)
        if reply != COMMANDS['HEY']:
            print("try %d failed" %i)
        else:
            break
    else:
        return False

    flushSer(ser)
    return True

def readSettings(ser):

    writeArd(ser, COMMANDS['SHARE_SETTINGS'])
    if not confirm(ser, 'SHARE_SETTINGS'):
        return "One poop"
    flushSer(ser)
    writeArd(ser, COMMANDS['SHARE_SETTINGS'])

    settingValues = []

    for i in range(len(SETTING_VALUES)):
        val = readArd(ser)
        if val < 0:
            print("Shit got fucked while reading settings")
            flushSer(ser)
            return "Poop"
        else:
            settingValues.append( val )

    if not confirm(ser, 'SHARE_SETTINGS'):
        return "Poop two"
    writeArd(ser, COMMANDS['SHARE_SETTINGS'])
    return settingValues

def changeSettings(ser, givenSettings = [] ):

    settingValues = readSettings(ser)

    if type(settingValues) is str:
        print( settingValues )
        return "Poop"

    if len(givenSettings) > 0:
        for i in range(len(settingValues)):
            if givenSettings[i] != -1:
                settingValues[i] = givenSettings[i]
    else:

        while True:
            print("Choose a setting to change from the list")
            for i in SETTING_NAMES:
                if SETTING_NAMES[i][2] != "skip":
                    print(i + ", ", end="")
            print("(s)ave, or (q)uit")

            cmd = raw_input("\n")
            if cmd == 'q' or cmd == 'quit':
                print("Exit settings")
                return
            elif cmd == 's' or cmd == 'save':
                print("Saving...")
                break
            elif cmd not in SETTING_NAMES:
                print("Not a valid setting")
            else:
                while True:
                    print("Input a value in the range %s or (q)uit"
                          %SETTING_NAMES[cmd][2])
                    print("The current value is: %d"
                          %( SETTING_NAMES[cmd][1]*settingValues[
                          SETTING_NAMES[cmd][0]]) )
                    val = raw_input(": ")
                    if val == 'q' or val == 'quit':
                        return
                    try:
                        val = int(float(val)/SETTING_NAMES[cmd][1])
                    except:
                        print("Not a number")
                        break
                    if val > 255 or val < 0:
                        print("Not within the range")
                    else:
                        settingValues[SETTING_NAMES[cmd][0]] = val
                        break

    writeArd(ser, COMMANDS['CHANGE_SETTINGS'])
    if not confirm(ser, 'CHANGE_SETTINGS'):
        return
    flushSer(ser)
    writeArd(ser, COMMANDS['CHANGE_SETTINGS'])

    for i in range(len(settingValues)):
        writeArd(ser, settingValues[i])

    if not confirm(ser, 'CHANGE_SETTINGS'):
        return
    writeArd(ser, COMMANDS['CHANGE_SETTINGS'])

def doStuff(ser):

    while True:
        print("Choose (c)olour, (s)equence, sequence (t)ype, (d)efine colour, (m)anual control, s(l)eep, s(e)ttings or (q)uit")
        cmd = raw_input("What's your command Master? ")
        flushSer(ser)
        if cmd == 'q':
            print("Sorry to hear that :(")
            break
        if isAlive(ser) != True:
            print("The Arduino is dead")
            break
        elif cmd == 'q':
            print("Sorry to hear that :(")
            break
        elif cmd == 'c':
            changeCol(ser)
        elif cmd == 's':
            changeSeq(ser)
        elif cmd == 't':
            changeSeqType(ser)
        elif cmd == 'd':
            defineCol(ser)
        elif cmd == 'm':
            manualControl(ser)
        elif cmd == 'e':
            changeSettings(ser)
        elif cmd == 'l':
            sleepArd(ser)
        else:
            print("You suck")

def main():

    if len(sys.argv) <= 1:
        return

    ser = connectPi()
    if ser == "poop":
        print( "Serial connection failed :(")
        return
    else:
        print("Connected")


    try:
        opts, args = getopt.getopt(sys.argv[1:], "mhaplc:s:")
    except getopt.GetoptError as e:
        print( str(e))
        print("UR DUMB")
        sys.exit(2)

    if len(opts) == 0:
        return

    print(len(sys.argv))
    if len(sys.argv) == 2 and '-m' in opts[0]:
        doStuff(ser)
        return

    for opt, arg in opts:
        if opt == '-h':
            print("Help")
            return
        elif opt == '-a':
            changeSettings(ser, [-1, 250, 1, 1, 2, -1, -1, -1, -1, 50, COMMANDS['PLAY_SEQ']])
            return
        elif opt == '-p':
            changeSettings(ser,
                [-1, 5, -1, 6, 0, -1, -1, -1, -1, 100, COMMANDS['PLAY_SEQ']])
            return
        elif opt == '-l':
            sleepArd(ser)
            return
        elif opt == '-c':
            changeCol(ser, arg)
            return
        elif opt == '-s':
            changeSeq(ser, arg)
            return
        elif opt != '-m':
            return
        else:
            continue


main()
