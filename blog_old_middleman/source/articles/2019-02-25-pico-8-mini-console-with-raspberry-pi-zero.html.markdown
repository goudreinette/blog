---

title: Pico-8 mini console with Raspberry Pi Zero
date: 2019-02-25 07:18 UTC
tags: 

---



![](/images/picopi.png)





I’ve seen several variations of a physical Pico-8 online, but either couldn’t find 
a good walkthrough or didn’t really like the design. So here it is.



Components
---

- **Pi Zero WH**. I chose the Wifi-version so I could download games over my phone’s 4G with personal hotspot. The headers are necessary for the screen, though you could solder them yourself
- **Waveshare 1.44in 128x128 screen**. Perfectly matches the Pico’s resolution, and three buttons and a keypad. Enough for Pico too. I’ve seen this screen being used a lot.
- **Powerbank.** My goal is to eventually power the raspberry using [NODE’s battery backpack](<https://n-o-d-e.net/zerobattery.html>), while I’m waiting for the necessary components I’m running it from a  simple powerbank
- **SD-card** ofcourse



OS
---

I burnt Raspbian to the SD card using [Etcher](). I chose Raspbian with desktop because it was easier to set everything up using a GUI, including selecting my home and phone’s WiFi.



Display driver
---

After that the display driver, [fbcp-ili9341](https://github.com/juj/fbcp-ili9341). This were the commands I used to compile it: 

```bash
sudo apt-get install cmake
git clone https://github.com/juj/fbcp-ili9341.git
cd fbcp-ili9341
mkdir build
cd build

cmake -DWAVESHARE_ST7789VW_HAT=ON  
      -DSPI_BUS_CLOCK_DIVISOR=30 
      -DSINGLE_CORE_BOARD=ON 
      -DARMV6Z=ON ..

make -j
sudo ./fbcp-ili9341
```

Please check out the Readme for more info, or just [download]() the compiled program for my configuration.



Adafruit Retrogame
---

Next were the physical buttons. I used Adafruit’s Retrogame for this. They have  an excellent [tutorial]() and the library has the feature of immediately changing your keymapping after you save. You don’t need to restart it. Edit `ff` as follows:

```python
LEFT      5   # Joypad left
RIGHT     26  # Joypad right
UP        6   # Joypad up
DOWN      19  # Joypad down
Z         20  # Button 3
X         16  # Button 2
ESC       21  # Button 1
```



### Config.txt

The `/boot/config.txt` needs a few lines to change the resolution to match the Waveshare screen.

```ini
hdmi_group=2
hdmi_mode=87
hdmi_cvt=128 128 60 1 0 0 0
hdmi_force_hotplug=1
```





Startup
---





Pico-8
---

Pico is not free.



Download completed image
---

- Except for Pico-8

Next steps
---

- Speaker?
- Cartridge directory: boot to add carts to SD
- PicoPi rom? How to add startup programs?
- Power: [NODE’s battery backpack](https://n-o-d-e.net/zerobattery.html)?