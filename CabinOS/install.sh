#!/bin/bash

GREEN="\033[0;32m"
NORMAL="\033[0m"

should_copy_rsa() {
    echo -e "${GREEN}Would you like to create and/or upload your SSH key ~/.ssh/id_rsa for passwordless access? (y)${NORMAL}"
    read doIt
    if [ "$wiki" = "n" ] || [ "$wiki" = "no" ]
    then
        return
    fi

    echo ""
    if [ ! -f ~/.ssh/id_rsa ]; then
        echo -e "${GREEN}Generating ~/.ssh/id_rsa...${NORMAL}"
        ssh-keygen -q -t rsa -N '' -f ~/.ssh/id_rsa <<<y 2>&1 >/dev/null
    fi


    echo -e "${GREEN}Copying ~/.ssh/id_rsa.pub to Pi. Use password 'cadpan' when prompted${NORMAL}"
    ssh-copy-id -i ~/.ssh/id_rsa pi@thanksgiving.cabin
}

brew_install_pv() {
    if ! command -v brew &> /dev/null
    then
        echo -e "${GREEN}Homebrew package manager not found. Installing...${NORMAL}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
    fi

    brew install pv
}

ensure_wget() {
    if command -v wget &> /dev/null
    then
        return
    fi

    echo -e "${GREEN}The pv command was not found. Installing...${NORMAL}"
    unameOut="$(uname -s)"
    case "${unameOut}" in
        Linux*)     apt-get install -y wget;;
        Darwin*)    brew install wget;;
        *)          echo -e "${GREEN}Your operating system ${unameOut} is unsupported${NORMAL}" && exit 1;;
    esac
}

ensure_pv() {
    if command -v pv &> /dev/null
    then
        return
    fi

    echo -e "${GREEN}The pv command was not found. Installing...${NORMAL}"
    unameOut="$(uname -s)"
    case "${unameOut}" in
        Linux*)     apt-get install -y pv;;
        Darwin*)    brew_install_pv;;
        *)          echo -e "${GREEN}Your operating system ${unameOut} is unsupported${NORMAL}" && exit 1;;
    esac
}

prepare_disk() {
    unameOut="$(uname -s)"
    case "${unameOut}" in
        Linux*)  fdisk -l;;
        Darwin*) diskutil list;;
    esac

    echo -e "${GREEN}Please enter the disk path (like /dev/disk2) to your SD card:${NORMAL}"
    read DISK_PATH

    echo ""
    echo -e "${GREEN}Using ${DISK_PATH}${NORMAL}"
    case "${unameOut}" in
        Linux*)  umount $DISK_PATH;;
        Darwin*) diskutil unmountDisk $DISK_PATH;;
    esac
    DISK_PATH=${DISK_PATH/disk/rdisk}
}

install_wiki() {
    echo -e "${GREEN}Download and install nopic Wikipedia files? (y)${NORMAL}"
    read wiki
    if [ "$wiki" = "n" ] || [ "$wiki" = "no" ]
    then
        return
    fi

    echo -e "${GREEN}Downloading nopic Wikipedia and Wiktionary (44.1GB)...${NORMAL}"
    wget http://download.kiwix.org/zim/wikipedia_en_all_nopic.zim
    wget http://download.kiwix.org/zim/wiktionary_en_all_nopic.zim

    echo -e "${GREEN}Please insert the SD card to the Pi and connect to the 'cabin' WiFi network (password: 'thanksgiving'). Press enter when done${NORMAL}"
    read booted

    echo -e "${GREEN}Copying Wiki files to Pi. Enter 'cadpan' if a password is requested.${NORMAL}"
    ssh pi@thanksgiving.cabin "sudo systemctl stop kiwix"
    rsync -z --progress wikipedia_en_all_nopic.zim pi@thanksgiving.cabin:~/kiwix
    rsync -z --progress wiktionary_en_all_nopic.zim pi@thanksgiving.cabin:~/kiwix
    ssh pi@thanksgiving.cabin "sudo systemctl stop kiwix"

    echo -e "${GREEN}Please reconnect to your standard internet connection. Pres enter when done${NORMAL}"
    read connected
}

install_survivorLibrary() {
    echo -e "${GREEN}Download (192.7GB) and install (309GB) Survivor Library? (y)${NORMAL}"
    read survivorLibrary
    if [ "$survivorLibrary" = "n" ] || [ "$survivorLibrary" = "no" ]
    then
        return
    fi

    echo -e "${GREEN}Plug in your SSD and enter the external disk path to download to:${NORMAL}"
    read dlPath

    echo -e "${GREEN}Downloading and extracting Survivor Library...${NORMAL}"
    wget -qO- https://thanksgiving-intranet.s3.ca-central-1.amazonaws.com/survivorLibrary.tar.gz | tar -zxvf - -C ${dlPath}

    echo -e "${GREEN}Please insert the SD card to the Pi and connect to the 'cabin' WiFi network (password: 'thanksgiving'). Press enter when done${NORMAL}"
    read booted2

    echo -e "${GREEN}Enter path equivalent to ${dlPath}/survivorLibrary when disk mounted on the Pi${NORMAL}"
    read usePath

    echo -e "${GREEN}Creating symlink to /var/www/static/survivorLibrary. Use password 'cadpan' if requested${NORMAL}"
    ssh pi@thanksgiving.cabin "ln -s ${usePath} /var/www/static/survivorLibrary"
}

install_cabinOS() {
    echo ""
    echo -e "${GREEN}Please enter a bs speed for the dd command: (default 24)${NORMAL}"
    read BS
    if [ -z "$BS" ]
    then
        BS=24
    fi

    echo ""
    echo -e "${GREEN}Flashing SD card...${NORMAL}"
    URL='https://thanksgiving-intranet.s3.ca-central-1.amazonaws.com/CabinOS.img'
    OS_IMG_SIZE=$(curl -sI "$URL" | tr -d '\r' | awk '/Content-Length/ {print $2}')
    curl -s $URL | pv -s $OS_IMG_SIZE | dd bs="${BS}m" of=$DISK_PATH
    echo ""
}

mkdir -p /tmp/CabinOS
cd /tmp/CabinOS

ensure_pv
ensure_wget
prepare_disk

install_cabinOS
should_copy_rsa
install_wiki
install_survivorLibrary

echo -e "${GREEN}Done! Please turn off the Pi, connect the Arduino, and turn it back on${NORMAL}"
