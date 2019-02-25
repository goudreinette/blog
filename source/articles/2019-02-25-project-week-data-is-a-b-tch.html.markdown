---

title: "Project week: Data is a B*tch"
date: 2019-02-25 07:19 UTC
tags: 

---

I made an installation where you can summon the data god Coegi.

- insert video <br>
- insert wiring

I uploaded StandardFirmata. Easier to debug than complex logic on Arduino.
This is the first time I used Processing, shaders and Arduino together.
Really easy to update uniforms.

```java
import processing.serial.*;
import cc.arduino.*;

boolean debug = false;

/**
 * Arduino / Light sensors
 */
Arduino arduino; //creates arduino object
int sensor=1;
float sensorValue;
float val;

int LIGHT_PIN1 = 0; // Pin connected to voltage divider output
int LIGHT_PIN2 = 1;
int LIGHT_PIN3 = 2;
int LED_PIN = 13; // Use built-in LED as dark indicator
float lightR1, lightR2, lightR3;

// Measure the voltage at 5V and the actual resistance of your
// 47k resistor, and enter them below:
float VCC = 4.98; // Measured voltage of Ardunio 5V line
float R_DIV = 4660.0; // Measured resistance of 3.3k resistor

// Set this to the minimum resistance require to turn an LED on:
float DARK_THRESHOLD = 10000.0;

/**
 * Shader / Image
 */
PShader sectors;  
PShader background;  
PImage disk;

void setup() {
  // Shader ----
  //pixelDensity(2);
  noCursor();
  fullScreen(P2D, 2);
  sectors = loadShader("sectors.glsl");
  //background = loadShader("background.glsl");
  //background.set("resolution", float(width * 2), float(height * 2));
  sectors.set("resolution", float(width * 2), float(height * 2));
  disk = loadImage("disk.png");
  
  // Arduino setup ---
  if (!debug) {
    arduino = new Arduino(this, Arduino.list()[1], 57600); //sets up arduino
    arduino.pinMode(sensor, Arduino.INPUT);//setup pins to be input (A0 =0?)
  }
}

void draw() {
  background(0);

  // Read Arduino
  sensorValue = debug ? 0.5 : readAndCalculateLightValue();
  val = lerp(sensorValue, val, 0.9);
  println(sensorValue);
  
  // Set shader uniforms
  sectors.set("time", millis() / 1000.0);  
  sectors.set("bw", val);
  sectors.set("slice", val);
  
  // Draw shader to rect
  shader(sectors);
  rect(0,0, width, height);
  //shader(background);
  //rect(0,0, width, height);
  
  resetShader();
  scale(sin(millis() / 10000));
  //image(disk, width /2 - disk.width / 2, height /2 - disk.height / 2);
}


float readAndCalculateLightValue() {
   // Read the ADC, and calculate voltage and resistance from it
  int lightADC1 = arduino.analogRead(LIGHT_PIN1);
  if (lightADC1 > 0) {
    // Use the ADC reading to calculate voltage and resistance
    float lightV1 = lightADC1 * VCC / 1023.0;
    lightR1 = (VCC / lightV1 - 1.0);
  }
  int lightADC2 = arduino.analogRead(LIGHT_PIN2);
  if (lightADC2 > 0) {
    // Use the ADC reading to calculate voltage and resistance
    float lightV2 = lightADC2 * VCC / 1023.0;
    
    lightR2 =  (VCC / lightV2 - 1.0);
  }
  
  int lightADC3 = arduino.analogRead(LIGHT_PIN3);
  if (lightADC3 > 0) {
    // Use the ADC reading to calculate voltage and resistance
    float lightV3 = lightADC3 * VCC / 1023.0;
    lightR3 = (VCC / lightV3 - 1.0);
  }
  
  return ((lightR1 + lightR2 + lightR3) / 3) / 24.5;
}
```