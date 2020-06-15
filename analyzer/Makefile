.DEFAULT_GOAL := compile

compile:
	go install github.com/karalabe/xgo
	mkdir -p build && cd build
	xgo github.com/edinnen/Thanksgiving_Intranet/analyzer
	cd ..

compile-manual:
	mkdir -p build
	go build -o ./build/analyzer
	env GOOS=linux GOARCH=arm GOARM=5 go build -o ./build/analyzer-rpi
	env GOOS=linux GOARCH=amd64 go build -o ./build/analyzer-ubuntu
