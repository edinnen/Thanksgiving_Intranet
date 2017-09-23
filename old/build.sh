#!/bin/sh

mkdir build
cp -R www_content build/
mkdir build/rpi
cp rpi/motd.txt build/rpi/
cp -R www build/
mkdir build/conf
cp conf/piratebox.conf build/conf/
cp -R iris build/

tar -zcvf build.tar.gz build

scp build.tar.gz alarm@alarmpi:/tmp

ssh alarm@alarmpi 'bash -s' < thanksgivingInstall.sh
