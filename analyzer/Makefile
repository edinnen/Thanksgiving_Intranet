.DEFAULT_GOAL := compile-upload

compile:
	go install github.com/karalabe/xgo
	mkdir -p build
	xgo --targets=linux/arm-5 --dest build github.com/edinnen/Thanksgiving_Intranet/analyzer

compile-both:
	xgo --targets=linux/arm-5,darwin/amd64 --dest build github.com/edinnen/Thanksgiving_Intranet/analyzer

compile-manual:
	mkdir -p build
	env CGO_ENABLED=1 CGO_LDFLAGS="-L/usr/local/opt/openssl/lib" CGO_CPPFLAGS="-I/usr/local/opt/openssl/include" GOOS=linux GOARCH=arm GOARM=5 go build -o ./build/analyzer-rpi
	scp ./build/analyzer pi@10.0.0.173:~/go/bin

compile-upload:
	mkdir -p build
	xgo --targets=linux/arm-5 --dest build github.com/edinnen/Thanksgiving_Intranet/analyzer
	rsync -z --progress -e "ssh -i ~/.ssh/id_rsa" ./build/analyzer-linux-arm-5 pi@thanksgiving.cabin:~/go/bin/analyzer

upload:
	rsync -z --progress -e "ssh -i ~/.ssh/id_rsa" ./build/analyzer-linux-arm-5 pi@thanksgiving.cabin:~/go/bin/analyzer
