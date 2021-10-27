#!/usr/bin/env python3
# Created: 2020 March 15
# Stuart de Haas

# Takes files output from Rev1 of the TGCPSM and makes them more human readable

import os
import pandas as pd
import time
import matplotlib.pyplot as plt

uCFilesFolder = "rawFiles/"
processedFilesFolder = "processedFiles/"

def findAllOutputFiles():
    files = []
    for filename in os.listdir(uCFilesFolder):
        hexTime = int(filename.split('.')[0], 16)
        files.append((hexTime, filename))
    files =  sorted(files, key=lambda tup: tup[0])
   # print(files)
    return files

def preProcess():
    files = findAllOutputFiles()
    _ , test = files[0]

    listOfFrames = []
    for _ , f in files:
        #print(f)
        try:
            df = pd.read_csv(uCFilesFolder + f, sep=',', comment='#',
                    header=None, dtype=float,
                    names = ["Unix", "BattV", "SolarV", "LoadA", "BattA", "SolarA",
                        "loadPWR", "solarPWR", "hydroPWR",
                        "OutsideTemp", "CabinTemp", "BoxTemp"])
        except (pd.errors.EmptyDataError):
            print("Bad file: " + f)
            pass

        # if no data, skip it
        if len(df.Unix) < 1:
            continue

        # Remove any rows with timestamps before ~Jan 2020 or after ~ Jan 2030
        # If the clock is messed up on the uC it will sometimes output funny dates
        # This won't remove all the bad data but will help!
        indexNames = df[ (df["Unix"] < 1577903693) |
                (df['Unix'] > 1893522893) ].index
        df.drop(indexNames, inplace=True)

        # Sort everything by the timestamp so it is in chronological order
        df.sort_values(by=['Unix'], inplace=True)

        # Add a more readable datetime column (goes to far right column)
        df['dateTime'] = pd.to_datetime(df['Unix'], unit='s')
        # Move datetime column to the left
        cols = df.columns.tolist()
        cols = cols[-1:] + cols[:-1]
        df = df[cols]

        listOfFrames.append(df)
    return listOfFrames


def outputConcatFile(combined_df):
    #combined_df = concateData(Frames)

    #firstTime = combined_df.Unix[0]
    firstTime = combined_df.iloc[0, combined_df.columns.get_loc('Unix')]
    # Unix time used by uC is actually offset from true UNIX time
    # The Vancouver timezone is used, not UTC so we have to convert
    # Makes it kinda confusing here but easier for the uC
    #print(time.ctime(int(firstTime + 7*3600))) # outputs the correct time
    #processedFilename = time.strftime("%Y%m%d_%H%M%S_COMBINED.csv", time.gmtime(firstTime))
    print(firstTime)
    processedFilename = time.strftime("%Y%m%d_%H%M%S_COMBINED.csv", time.gmtime(firstTime))
    print("Processed file will be:")
    print(processedFilename)

    #export to csv
    combined_df.to_csv(processedFilesFolder +  processedFilename , index=False, encoding="utf-8")

    
def concateData(Frames):
    # Combine all the file dataframes into one big one
    combined_df = pd.concat(Frames, ignore_index=True)

    # Sort everything by the timestamp so it is in chronological order
    combined_df.sort_values(by=['Unix'], inplace=True)

    return combined_df


def generateDataframe():
    return concateData(preProcess())
    
if __name__ == '__main__':
    try:
        main()
    except(KeyboardInterrupt, SystemExit):
        print()
        print("Keyboard Interrupt. Exiting")
    except:
        raise
