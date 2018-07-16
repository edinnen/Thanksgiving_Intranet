Usefull stuff for mounting the SD card on the RPi
https://ralimtek.com/Raspberry_Pi_Secondary_SD_Card/

-Check to see if the SD exsits (will give mmcblk2[p1])
ls /dev/mmc*
-run the /etc/fstab mount file
mount -a
-unmount the drive before disconnecting
umount /dev/mmcblk2p1

/*
lsmod
rmmod spi_bcm2708
modprobe spi_bcm2222
*/
