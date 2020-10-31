shrink:
	sudo chmod 777 $(TARGET)
	docker run --rm --privileged=true -v `pwd`:/workdir turee/pishrink-docker pishrink $(TARGET)
