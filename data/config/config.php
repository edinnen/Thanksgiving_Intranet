<?php
$CONFIG = array (
  'data_directory' => '/mnt/data/files',
  'apps_paths' => 
  array (
    0 => 
    array (
      'path' => '/var/www/owncloud/apps',
      'url' => '/apps',
      'writable' => false,
    ),
    1 => 
    array (
      'path' => '/var/www/owncloud/custom',
      'url' => '/custom',
      'writable' => true,
    ),
  ),
  'dbtype' => 'mysql',
  'dbhost' => 'filedb:3306',
  'dbname' => 'owncloud',
  'dbuser' => 'owncloud',
  'dbpassword' => 'owncloud',
  'dbtableprefix' => 'oc_',
  'trusted_domains' => 
  array (
    0 => 'localhost',
  ),
  'mysql.utf8mb4' => true,
  'passwordsalt' => 'Nnvq7ZGE2CCNRUFUle7Ye1Plx7nIPM',
  'secret' => 'gDdB3PURcB84ZLuOOojSZHr7/WejgT/joYgRYYCFmSXgNmte',
  'datadirectory' => '/mnt/data/files',
  'overwrite.cli.url' => 'http://localhost/',
  'version' => '10.0.4.4',
  'instanceid' => 'oc71anl7cz30',
  'logtimezone' => 'UTC',
  'installed' => true,
  'updatechecker' => 'false',
  'redis' => array('host' => 'redis', 'port' => 6379),
  'filelocking.enabled' => 'true',
  'memcache.local' => '\\OC\\Memcache\\APCu',
  'loglevel' => '0',
  'default_language' => 'en',
  'htaccess.RewriteBase' => '/',
  'memcache.distributed' => '\\OC\\Memcache\\Redis',
  'memcache.locking' => '\\OC\\Memcache\\Redis',
);
