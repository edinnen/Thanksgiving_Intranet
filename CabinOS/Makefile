shrink:
	sudo chmod 777 $(TARGET)
	docker run --rm --privileged=true -v `pwd`:/workdir turee/pishrink-docker pishrink $(TARGET)

copy:
	sudo diskutil unmountDisk $(DISK)
	sudo dd bs=24m if=CabinOS.img | pv -s 7564431872 | sudo dd bs=24m of=/dev/rdisk2
