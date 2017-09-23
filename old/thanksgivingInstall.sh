#!/bin/sh

cd /tmp
tar -zxvf build.tar.gz

cd /opt/piratebox
rm -rf www_content
cp -R /tmp/www_content .
rm -rf www
cp -R /tmp/www .
cp -R /tmp/iris .
cp /tmp/conf/piratebox.conf conf/
cp /tmp/rpi/motd.txt rpi/

sed -i -e 's|^#include "/opt/piratebox/conf/lighttpd/fastcgi-php.conf"|include "/opt/piratebox/conf/lighttpd/fastcgi-php.conf"|' \
  /opt/piratebox/conf/lighttpd/lighttpd.conf
