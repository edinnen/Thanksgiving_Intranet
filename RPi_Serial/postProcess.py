import pandas as pd
import matplotlib.pyplot as plt
#import os

#filename = "processedFiles/20200801_123349.csv"
filename = "processedFiles/20200731_112310.csv"

def plotStuff():
    plt.close('all')
    df = pd.read_csv(filename)
    #print(df.head())
    #x = df.dateTime
    #y1 = df.CabinTemp
    #plt.figure()
    ax = plt.gca()
    df.plot(kind='line', x='dateTime', y='BattTemp', ax=ax)
    df.plot(kind='line', x='dateTime', y='CabinTemp', ax=ax)
    df.plot(kind='line', x='dateTime', y='OutsideTemp', ax=ax)
    #plt.plot(x, y1, color="red", linewidth=3)
    plt.show()
    #df.plot()


plotStuff()

