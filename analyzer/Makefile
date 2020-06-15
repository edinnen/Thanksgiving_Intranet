.DEFAULT_GOAL := compile

compile:
	go install github.com/karalabe/xgo
	mkdir -p build && cd build
	xgo github.com/edinnen/Thanksgiving_Intranet/analyzer
	cd ..
