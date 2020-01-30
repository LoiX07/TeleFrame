const Gpio = require('pigpio').Gpio; // Include onoff to interact with the GPIO

var gpioHandler = class {
  constructor(config, emitter, logger, ipcMain) {
    this.config = config;
    this.logger = logger;
    this.emitter = emitter;
    this.ipcMain = ipcMain;
    this.ledsMap = new Map(); // Keep a reference of the LED
    this.buttonsMap = new Map(); // Keep a reference of the buttons
    this.blinkIntervals = new Map(); // Reference of the blinking intervals
  }

  init() {
    if (config.gpio === null) {
      this.logger.warn("GPIO controls are disabled");
      return;
    }

    // Definition of the LED outputs
    for (var key in config.gpio.leds) {
      initialiseLed(key,config.gpio.leds[key]);
    }

    // Initialisation of the control buttons
    for (var command in config.gpio.buttons) {
      initialiseButton(command, config.gpio.buttons[command]);
    }

      this.ipcMain.on("recordStarted", function(event, arg) {
        indicateRecording();
      })

      this.ipcMain.on("recordStopped", function(event, arg) {
        indicateRecordStopped();
      })

      this.ipcMain.on("recordError", function(event, arg) {
        indicateRecordStopped();
      })

      this.ipcMain.on("pause", function(event, arg) {
        indicatePause();
      })

      this.ipcMain.on("play", function(event, arg) {
        indicatePlaying();
      })
  }

  initialiseLed(key,gpioNumber) {
    let led;
    logger.log("Initialisation of the LED ", key)
    led = new Gpio(gpioNumber, {mode: Gpio.OUTPUT});
    this.ledsMap.set(key,led);
  }

  initialiseButton(eventRaised,gpioNumber) {
	  let button;
    logger.log("Initialisation of the button ", eventRaised);
    button = new Gpio(gpioNumber, {
      mode: Gpio.INPUT,
      pullUpDown: Gpio.PUD_UP,
      edge: Gpio.FALLING_EDGE
    });
    
    // Level must be stable for 10 ms before an alert event is emitted
    button.glitchFilter(10000);

    button.on('interrupt', (level) => {
      this.emitter.send(eventRaised);
    });
    this.buttonsMap.set(eventRaised, button);
  }

  indicatePlaying() {
    this.logger.info("GPIO indicate playing");
    // Condition to test button and a mode for a unique led for play/pause (continious / blinking)
    if (config.gpio.leds["play"] === config.gpio.leds["pause"]) {
      endBlink(this.ledsMap.get("play"));
    } else {
      this.ledsMap.get("pause").writeSync(0);
    }
    this.ledsMap.get("play").writeSync(1);
  }

  indicatePaused() {
    this.logger.info("GPIO indicate pause");
    if (config.gpio.leds["play"] === config.gpio.leds["pause"]) {
      blinkLed(this.ledsMap.get("play"));
    } else {
      this.ledsMap.get("play").writeSync(0);
      this.ledsMap.get("pause").writeSync(1);
    }
  }

  indicateRecording() {
    this.logger.info("GPIO indicate recording")
    this.ledsMap.get("record").writeSync(1);
  }

  indicateStopRecording() {
    this.logger.info("GPIO indicate record stopped")
    this.ledsMap.get("record").writeSync(0);
  }
  
  blinkLed(led) { // Function to blinking led
  }

  startBlink(led) { // Function to start blinking
    this.blinkIntervals[led] = setInterval((led) => led.writeSync(led.readSync() ^ 1), config.gpio.blinkInterval); // Inverse led state
  }
  
  endBlink(led) { // Function to stop blinking
    clearInterval(this.blinkIntervals[led]); // Stop blink interval 
    led.writeSync(0); // Turn LED off
  }

  unexport() {
    for (var [key, interval] of this.blinkIntervals) {
      // Stop blinking led
      clearInterval(interval);
    }
    for (var [key, led] of this.ledsMap) {
      // Turn LED off
      this.logger.info("Turn off led "+key);
      led.writeSync(0);
      // Unexport led GPIO to free resources
      this.logger.info("Unexport led "+key);
      led.unexport()
    }
    for (var [key, button] of this.buttonsMap) {
      // Unexport button GPIO to free resources
      this.logger.info("Unexport button "+key);
      button.unexport();
    }
  }

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = gpioHandler;
}
