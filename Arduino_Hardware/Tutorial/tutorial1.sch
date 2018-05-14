EESchema Schematic File Version 2
LIBS:power
LIBS:device
LIBS:switches
LIBS:relays
LIBS:motors
LIBS:transistors
LIBS:conn
LIBS:linear
LIBS:regul
LIBS:74xx
LIBS:cmos4000
LIBS:adc-dac
LIBS:memory
LIBS:xilinx
LIBS:microcontrollers
LIBS:dsp
LIBS:microchip
LIBS:analog_switches
LIBS:motorola
LIBS:texas
LIBS:intel
LIBS:audio
LIBS:interface
LIBS:digital-audio
LIBS:philips
LIBS:display
LIBS:cypress
LIBS:siliconi
LIBS:opto
LIBS:atmel
LIBS:contrib
LIBS:valves
LIBS:microchip_pic12mcu
LIBS:myLib
LIBS:tutorial1-cache
EELAYER 25 0
EELAYER END
$Descr A4 11693 8268
encoding utf-8
Sheet 1 1
Title "Tutorial 1"
Date ""
Rev ""
Comp ""
Comment1 ""
Comment2 ""
Comment3 ""
Comment4 ""
$EndDescr
$Comp
L R R2
U 1 1 5AEFA903
P 8150 1750
F 0 "R2" V 8230 1750 50  0000 C CNN
F 1 "1k" V 8150 1750 50  0000 C CNN
F 2 "Resistors_SMD:R_2816_HandSoldering" V 8080 1750 50  0001 C CNN
F 3 "" H 8150 1750 50  0001 C CNN
	1    8150 1750
	0    1    1    0   
$EndComp
$Comp
L R R1
U 1 1 5AEFA9FB
P 7050 3750
F 0 "R1" V 7150 3750 50  0000 C CNN
F 1 "100" V 7050 3750 50  0000 C CNN
F 2 "Resistors_SMD:R_2816_HandSoldering" V 6980 3750 50  0001 C CNN
F 3 "" H 7050 3750 50  0001 C CNN
	1    7050 3750
	0    1    1    0   
$EndComp
$Comp
L PIC12C508A-I/SN U1
U 1 1 5AEFAAFB
P 6350 2500
F 0 "U1" H 5800 3050 50  0000 L CNN
F 1 "PIC12C508A-I/SN" H 5800 2950 50  0000 L CNN
F 2 "Housings_DIP:DIP-8_W7.62mm" H 6350 2500 50  0001 C CNN
F 3 "" H 6350 2500 50  0001 C CNN
	1    6350 2500
	1    0    0    -1  
$EndComp
$Comp
L LED D1
U 1 1 5AEFAB8E
P 7350 1750
F 0 "D1" H 7350 1850 50  0000 C CNN
F 1 "LED" H 7350 1650 50  0000 C CNN
F 2 "LEDs:LED_D5.0mm" H 7350 1750 50  0001 C CNN
F 3 "" H 7350 1750 50  0001 C CNN
	1    7350 1750
	1    0    0    -1  
$EndComp
$Comp
L MYCONN3 J1
U 1 1 5AEFAEDA
P 6250 3750
F 0 "J1" H 6200 3550 60  0000 C CNN
F 1 "MYCONN3" H 6200 3950 60  0000 C CNN
F 2 "Connectors:Banana_Jack_3Pin" H 6250 3750 60  0001 C CNN
F 3 "" H 6250 3750 60  0001 C CNN
	1    6250 3750
	1    0    0    -1  
$EndComp
$Comp
L VCC #PWR01
U 1 1 5AEFAF3F
P 5550 2150
F 0 "#PWR01" H 5550 2000 50  0001 C CNN
F 1 "VCC" H 5550 2300 50  0000 C CNN
F 2 "" H 5550 2150 50  0001 C CNN
F 3 "" H 5550 2150 50  0001 C CNN
	1    5550 2150
	1    0    0    -1  
$EndComp
$Comp
L VCC #PWR02
U 1 1 5AEFAF80
P 8400 1700
F 0 "#PWR02" H 8400 1550 50  0001 C CNN
F 1 "VCC" H 8400 1850 50  0000 C CNN
F 2 "" H 8400 1700 50  0001 C CNN
F 3 "" H 8400 1700 50  0001 C CNN
	1    8400 1700
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR03
U 1 1 5AEFAFB2
P 6650 3900
F 0 "#PWR03" H 6650 3650 50  0001 C CNN
F 1 "GND" H 6650 3750 50  0000 C CNN
F 2 "" H 6650 3900 50  0001 C CNN
F 3 "" H 6650 3900 50  0001 C CNN
	1    6650 3900
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR04
U 1 1 5AEFAFD0
P 5500 2900
F 0 "#PWR04" H 5500 2650 50  0001 C CNN
F 1 "GND" H 5500 2750 50  0000 C CNN
F 2 "" H 5500 2900 50  0001 C CNN
F 3 "" H 5500 2900 50  0001 C CNN
	1    5500 2900
	1    0    0    -1  
$EndComp
$Comp
L VCC #PWR05
U 1 1 5AEFB06D
P 6650 3550
F 0 "#PWR05" H 6650 3400 50  0001 C CNN
F 1 "VCC" H 6650 3700 50  0000 C CNN
F 2 "" H 6650 3550 50  0001 C CNN
F 3 "" H 6650 3550 50  0001 C CNN
	1    6650 3550
	1    0    0    -1  
$EndComp
Wire Wire Line
	7050 1750 7050 2200
Wire Wire Line
	7050 1750 7200 1750
Wire Wire Line
	7500 1750 8000 1750
Wire Wire Line
	8300 1750 8400 1750
Wire Wire Line
	8400 1750 8400 1700
Wire Wire Line
	5550 2150 5550 2200
Wire Wire Line
	5550 2200 5650 2200
Wire Wire Line
	5500 2900 5500 2800
Wire Wire Line
	5500 2800 5650 2800
Wire Wire Line
	6550 3650 6650 3650
Wire Wire Line
	6650 3650 6650 3550
Wire Wire Line
	6900 3750 6550 3750
Wire Wire Line
	6550 3850 6650 3850
Wire Wire Line
	6650 3850 6650 3900
Wire Wire Line
	7200 3750 8400 3750
Text Label 7050 2300 0    60   ~ 0
INPUT
Text Label 7900 3750 0    60   ~ 0
INPUT
Text Label 7050 2050 0    60   ~ 0
uCtoLED
Text Label 7600 1750 0    60   ~ 0
LEDtoR
NoConn ~ 7050 2600
NoConn ~ 7050 2700
NoConn ~ 7050 2500
NoConn ~ 7050 2400
$Comp
L PWR_FLAG #FLG06
U 1 1 5AEFB403
P 4650 4950
F 0 "#FLG06" H 4650 5025 50  0001 C CNN
F 1 "PWR_FLAG" H 4650 5100 50  0000 C CNN
F 2 "" H 4650 4950 50  0001 C CNN
F 3 "" H 4650 4950 50  0001 C CNN
	1    4650 4950
	1    0    0    -1  
$EndComp
$Comp
L PWR_FLAG #FLG07
U 1 1 5AEFB421
P 5200 4950
F 0 "#FLG07" H 5200 5025 50  0001 C CNN
F 1 "PWR_FLAG" H 5200 5100 50  0000 C CNN
F 2 "" H 5200 4950 50  0001 C CNN
F 3 "" H 5200 4950 50  0001 C CNN
	1    5200 4950
	1    0    0    -1  
$EndComp
$Comp
L GND #PWR08
U 1 1 5AEFB43F
P 4650 5000
F 0 "#PWR08" H 4650 4750 50  0001 C CNN
F 1 "GND" H 4650 4850 50  0000 C CNN
F 2 "" H 4650 5000 50  0001 C CNN
F 3 "" H 4650 5000 50  0001 C CNN
	1    4650 5000
	1    0    0    -1  
$EndComp
$Comp
L VCC #PWR09
U 1 1 5AEFB45D
P 5200 5000
F 0 "#PWR09" H 5200 4850 50  0001 C CNN
F 1 "VCC" H 5200 5150 50  0000 C CNN
F 2 "" H 5200 5000 50  0001 C CNN
F 3 "" H 5200 5000 50  0001 C CNN
	1    5200 5000
	1    0    0    1   
$EndComp
Wire Wire Line
	4650 5000 4650 4950
Wire Wire Line
	5200 4950 5200 5000
Text Notes 9800 4900 0    60   ~ 0
Nice
$EndSCHEMATC
