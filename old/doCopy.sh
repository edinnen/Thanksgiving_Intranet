#!/bin/sh

cd ~/Documents/git/Thanksgiving_Intranet
rm -rf /var/www/html/*
cp -R www_content/* /var/www/html
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 777 /var/www/html
