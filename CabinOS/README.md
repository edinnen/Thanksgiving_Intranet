# CabinOS

The Thanksgiving CabinOS is based on Raspberry Pi OS v4.19. When booted up the OS initializes the analyzer program which is set up as a system service as well as the Kiwix Wikipedia server which is set up similarly.

## Installation

The default username/password is:

Username: pi
Password: cadpan

### Automatic

The CabinOS can be installed by running one of the following commands in your terminal. The script will prompt you for your SD card's path so be sure to find it with `diskutil list` and enter it with an `r` before the disk number like `/dev/rdisk2` to ensure a faster copy.

| Method    | Command                                                                                                           |
|:----------|:------------------------------------------------------------------------------------------------------------------|
| **curl**  | `sudo sh -c "$(curl -fsSL https://raw.githubusercontent.com/edinnen/Thanksgiving_Intranet/master/CabinOS/install.sh)"` |
| **wget**  | `sudo sh -c "$(wget -O- https://raw.githubusercontent.com/edinnen/Thanksgiving_Intranet/master/CabinOS/install.sh)"`   |
| **fetch** | `sudo sh -c "$(fetch -o - https://raw.githubusercontent.com/edinnen/Thanksgiving_Intranet/master/CabinOS/install.sh)"` |

If you get any no space left on disk errors following installation you will need to connect to the Pi and run `sudo raspi-config` and then navigate to and select `Advanced Options > Expand Filesystem`

### Manual

All the disk images and other files are hosted on AWS S3. In order to install the system manually you will need to download all the files in the S3 bucket.

1. Insert your SD card and determine its path: `diskutil list`
2. Unmount the disk: `diskutil unmountDisk /path/to/disk`
3. Copy `CabinOS.img` to your Raspberry Pi SD card: `sudo dd bs=100m if=CabinOS.img of=/path/to/rdisk`. If your disk is located at /dev/disk2 make sure to enter /dev/rdisk2 in the dd command as it will speed up the I/O. We use 100m (lowercase `m` for Mac OS; use `100M` on Linux) as our SD card can handle I/O of 100MB/s. You may additionally use the `pv` command to track the progress of this operation: `sudo dd bs=100m if=CabinOS.img | pv | sudo dd of=/path/to/rdisk`
4. Boot up the Pi and connect to the `cabin` SSID using the password `thanksgiving`. If you choose to plug the Pi into your network via an ethernet port be sure to use the Pi's local IP address rather than the custom `thanksgiving.cabin` DNS that is avaliable when connected to the Pi's network
5. Download the English nopic Wikipedia and Wiktionary zim files from https://wiki.kiwix.org/wiki/Content_in_all_languages. Remove the `_YYYY-MM` stamps from the file names.
6. Copy the `.zim` files to `/home/pi/kiwix` with rsync or scp: `rsync -z --progress *.zim pi@thanksgiving.cabin:~/kiwix/`. Use the password `cadpan`

## Analyzer and Web Server

The analyzer starts as a system service on boot and creates two files:
- The SQLite3 database `/cabin.db`
- The analyzer service's logfile `/analyzer.log`

### Database
If you know SQL and promise not to break the database you can connect to the database by running `sudo sqlite3 /cabin.db`.

### Log file
If you'd like to view the live output of the log file you can run `tail -F /analyzer.log`

## Kiwix Wikipedia

If you want to install the larger versions of Wikipedia/Wiktionary or other [Kiwix compatible .zim files](https://wiki.kiwix.org/wiki/Content_in_all_languages) to an external SSD or a larger SD card follow these steps:

1. Login to the Pi and stop the Kiwix service
    - `ssh pi@thanksgiving.cabin`
    - `sudo systemctl stop kiwix`
2. Delete the current kiwix library file: `rm /home/pi/kiwix/library.xml`
3. Copy the `.zim` files you wish to use to any location you wish
4. Run the following command for each .zim file you have copied: `kiwix-manage /path/to/new/library.xml add /path/to/zim`
5. Modify the Kiwix system service file: `sudo vi /etc/systemd/system/kiwix.service`
6. Update the ExecStart command to point to your new library file
7. Restart the Kiwix service: `sudo systemctl start kiwix`