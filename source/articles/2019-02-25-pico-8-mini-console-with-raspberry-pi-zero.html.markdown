---

title: Pico-8 mini console with Raspberry Pi Zero
date: 2019-02-25 07:18 UTC
tags: 

---


![](/images/picopi.png)

## Components
- Pi Zero WH (save by soldering headers yourself?)
- Waveshare 1.44 
- Powerbank
- 8gb SD card
- internet from phone: connect to personal hotspot in Raspbian

Cost = around 30 euros for Pi + Waveshare


## Software
Used Raspbian with desktop for easier setup on Pi



## Display driver

- [fbcp-ili9341](https://github.com/juj/fbcp-ili9341) with steps to compile/install

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

[Link to compiled executable?]()

## Adafruit Retrogame
- tutorial
- autoreload is cool

```python
LEFT      5   # Joypad left
RIGHT     26  # Joypad right
UP        6   # Joypad up
DOWN      19  # Joypad down
Z         20  # Button 3
X         16  # Button 2
ESC       21  # Button 1
```

## Startup

### Config.txt
```ini
hdmi_group=2
hdmi_mode=87
hdmi_cvt=128 128 60 1 0 0 0
hdmi_force_hotplug=1
```




## 
```

```

## Download completed image
- Except for Pico-8

## Next steps
- Speaker?
- Cartridge directory: boot to add carts to SD
- PicoPi rom? How to add startup programs?
- Power: [NODE's battery backpack](https://n-o-d-e.net/zerobattery.html)?