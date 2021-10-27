#!/usr/bin/env python3
# Created: 2020 March 15
# Stuart de Haas

# Takes files output from Rev1 of the TGCPSM and makes them more human readable

import os
import pandas as pd
import time
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

uCFilesFolder = "rawFiles/"
processedFilesFolder = "processedFiles/"

def findAllOutputFiles():
    files = []
    for filename in os.listdir(uCFilesFolder):
        hexTime = int(filename.split('.')[0], 16)
        files.append((hexTime, filename))
    files =  sorted(files, key=lambda tup: tup[0])
    print(files)
    return files

def preProcess():
    files = findAllOutputFiles()
    _ , test = files[0]

    listOfFrames = []
    for _ , f in files:
        print(f)
        try:
            df = pd.read_csv(uCFilesFolder + f, sep=',', comment='#',
                    header=None, dtype=float,
                    names = ["Unix", "BattV", "SolarV", "LoadA", "BattA", "SolarA",
                        "loadPWR", "solarPWR", "hydroPWR",
                        "OutsideTemp", "CabinTemp", "BoxTemp"])
        except pd.errors.EmptyDataError:
            print("Bad file: " + f)
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

def outputProcessedFiles(Frames):

    for df in Frames:
        firstTime = df.Unix[0]
        # Unix time used by uC is actually offset from true UNIX time
        # The Vancouver timezone is used, not UTC so we have to convert
        # Makes it kinda confusing here but easier for the uC
        processedFilename = time.strftime("%Y%m%d_%H%M%S.csv", time.gmtime(firstTime))

        #export to csv
        df.to_csv(processedFilesFolder +  processedFilename, index=False, encoding="utf-8")

def outputConcatFile(Frames):
    combined_df = concateData(Frames)

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

def concatFiles():
    print("concatFiles...")
    files = findAllOutputFiles()
    _ , test = files[0]

    listOfFrames = []
    for _ , f in files:
        try:
            df = pd.read_csv(uCFilesFolder + f, sep=',', comment='#',
                    header=None, dtype=float,
                    names = ["Unix", "BattV", "SolarV", "LoadA", "BattA", "SolarA",
                        "BattPercent", "AveBattPower", "AveLoadPower",
                        "OutsideTemp", "CabinTemp", "BoxTemp"])
        except pd.errors.EmptyDataError:
            print("Bad file: " + f)
        # if no data, skip it
        if len(df.Unix) < 1:
            continue

        # Add a column indicating if the loads are connected
        df['LoadsConnected'] = 1 if f.find('.ON') != -1 else 0
        # Remove any rows with timestamps before ~Jan 2020 or after ~ Jan 2030
        # If the clock is messed up on the uC it will sometimes output funny dates
        # This won't remove all the bad data but will help!
        indexNames = df[ (df["Unix"] < 1577903693) |
                (df['Unix'] > 1893522893) ].index
        df.drop(indexNames, inplace=True)

        # Sort everything by the timestamp so it is in chronological order
        df.sort_values(by=['Unix'], inplace=True)

        # Elaborate way to get the first timestamp
        #firstTime = df.iloc[0, df.columns.get_loc('Unix')]
        firstTime = df.Unix[0]
        # Unix time used by uC is actually offset from true UNIX time
        # The Vancouver timezone is used, not UTC so we have to convert
        # Makes it kinda confusing here but easier for the uC
        #print(time.ctime(int(firstTime + 7*3600))) # outputs the correct time
        processedFilename = time.strftime("%Y%m%d_%H%M%S.csv", time.gmtime(firstTime))
        #print("Processed file will be:")
        #print(processedFilename)

        # Add a more readable datetime column (goes to far right column)
        df['dateTime'] = pd.to_datetime(df['Unix'], unit='s')
        # Move datetime column to the left
        cols = df.columns.tolist()
        cols = cols[-1:] + cols[:-1]
        df = df[cols]

        #export to csv
        df.to_csv(processedFilesFolder +  processedFilename, index=False, encoding="utf-8")

        listOfFrames.append(df)


    # Combine all the file dataframes into one big one
    combined_df = pd.concat(listOfFrames)

    # Sort everything by the timestamp so it is in chronological order
    combined_df.sort_values(by=['Unix'], inplace=True)

    # Elaborate way to get the first timestamp
    #firstTime = combined_df.iloc[0, combined_df.columns.get_loc('Unix')]
    firstTime = combined_df.Unix[0]
    # Unix time used by uC is actually offset from true UNIX time
    # The Vancouver timezone is used, not UTC so we have to convert
    # Makes it kinda confusing here but easier for the uC
    #print(time.ctime(int(firstTime + 7*3600))) # outputs the correct time
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

def graphTemperatures(df):

   #df.plot(kind='scatter', x='dateTime', y='BoxTemp')


   # Remove sensor errors
   df = df.drop(df[(df.BoxTemp < -50) | (df.BoxTemp > 70)].index)
   df = df.drop(df[(df.CabinTemp < -50) | (df.CabinTemp > 70)].index)
   df = df.drop(df[(df.OutsideTemp < -50) | (df.OutsideTemp > 70)].index)

   ax = plt.gca()
   #df.plot(kind='line', x='dateTime', y='BoxTemp',    ax=ax)
   #df.plot(kind='line', x='dateTime', y='CabinTemp',   ax=ax)

   #print(df.head())
   df_max  = df.resample('D', on='dateTime', origin='start_day', offset='5h').max()
   df_min  = df.resample('D', on='dateTime', origin='start_day', offset='5h').min()
   df_mean = df.resample('D', on='dateTime', origin='start_day', offset='5h').mean()
   df_mean.reset_index(level=0, inplace=True)



   df_min.plot(kind='line', x='dateTime', y='OutsideTemp', ax=ax, label='minTemp')

   df_max.plot(kind='line', x='dateTime', y='OutsideTemp', ax=ax, label='maxTemp')
   df_mean.plot(kind='line', x='dateTime', y='OutsideTemp', ax=ax, label='mean daily temperature')

   #df.plot(kind='line', x='dateTime', y='OutsideTemp', ax=ax, title="Temperatures at Thanksgiving Cabin: Jan - Oct, 2021")
   ax.xaxis.set_major_formatter(mdates.DateFormatter('%b %d'))
   plt.title("Temperatures at Thanksgiving Cabin: Jan - Oct, 2021")
   plt.xlabel("Date")
   plt.ylabel("Temperature (\N{DEGREE SIGN}C)")

   plt.tight_layout()
   plt.show()

def graphBatt(df):


   ax = plt.gca()
   df.plot(kind='line', x='dateTime', y=['BattV', 'SolarV'], ax=ax)
   df.plot(kind='line', x='dateTime', y=['BattA', 'LoadA', 'SolarA'], ax=ax, secondary_y=True, mark_right=False)
   ax.set_ylabel("Voltage (V)")
   ax.right_ax.set_ylabel("Current (A)")
   ax.set(xlabel="Date, Time",
           title="Voltage and Current readings at TGC")
   plt.show()

def main():
    Frames = preProcess()
    print("preProcess done")
    #outputProcessedFiles(Frames)
    outputConcatFile(Frames)
    graphTemperatures(concateData(Frames))
    graphBatt(concateData(Frames))

try:
    main()
except(KeyboardInterrupt, SystemExit):
    print()
    print("Keyboard Interrupt. Exiting")
except:
    raise
