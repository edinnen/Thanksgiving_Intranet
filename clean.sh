#!/bin/bash

docker system prune
docker rm $(docker ps -a -f status=exited -q)
docker rmi $(docker images)
sudo rm -rf db/pgdata
sudo rm -rf api/tmp
