.DEFAULT_GOAL := compile

compile:
	go install github.com/karalabe/xgo
	mkdir -p build
	xgo --targets=linux/arm-5,darwin/amd64 --dest build github.com/edinnen/Thanksgiving_Intranet/analyzer

compile-manual:
	mkdir -p build
	env CGO_ENABLED=1 CGO_LDFLAGS="-L/usr/local/opt/openssl/lib" CGO_CPPFLAGS="-I/usr/local/opt/openssl/include" GOOS=linux GOARCH=arm GOARM=5 go build -o ./build/analyzer-rpi
	scp ./build/analyzer pi@10.0.0.173:~/go/bin

compile-upload:
	mkdir -p build
	GOPATH=~/go/ xgo --targets=linux/arm --dest build /Users/ethan/go/src/github.com/edinnen/Thanksgiving_Intranet/analyzer
	mv ./build/analyzer-linux-arm-5 ./build/analyzer
	scp ./build/analyzer pi@10.0.0.173:~/go/bin
