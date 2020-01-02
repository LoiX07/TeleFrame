const Gpio = require('onoff').Gpio; // Include onoff to interact with the GPIO

var gpioHandler = class {
  constructor(config, emitter, logger, ipcMain) {
    this.config = config;
    this.logger = logger;
    this.emitter = emitter;
    this.ipcMain = ipcMain;
    this.ledsMap = new Map(); // Keep a reference of the LED
    this.buttonsMap = new Map(); // Keep a reference of the buttons
  }

  init() {
    if (config.gpio === null) {
      this.logger.warn("GPIO controls are disabled");
      return;
    }

    // Definition of the LED outputs
    initialiseLed("play", config.gpio.playLed);
    initialiseLed("pause", config.gpio.pauseLed);
    initialiseLed("record", config.gpio.recordLed);

    if (config.gpio.playLed === config.gpio.pauseLed) {
      // TODO Add condition to test button and a mode for a unique led for play/pause (continious / blinking)
    }

    // Initialisation of the control buttons
    initialiseButton("previous",config.gpio.previousButton);
    initialiseButton("pause",config.gpio.pauseButton);
    initialiseButton("play",config.gpio.playButton);
    initialiseButton("record",config.gpio.recordButton);
    initialiseButton("next",config.gpio.nextButton);
    // TODO Add a stop button to shutdown raspi


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
    if (Gpio.accessible) {
      logger.log("Initialisation of the LED ", key)
      led = new Gpio(gpioNumber, 'out');
    } else {
      logger.log("Initialisation of the virtual LED ", key)
      led = {
        writeSync: value => {
          logger.info('Virtual led ' + gpioNumber + 'now uses value: '+ value);
        }
      };
    }
    this.ledsMap.set(key,led);
  }

  initialiseButton(eventRaised,gpioNumber) {
	  if (Gpio.accessible) {
      let button;
      logger.log("Initialisation of the button ", eventRaised);
		  button = new Gpio(gpioNumber,'in','rising',{debounceTimeout: 10});
      button.watch((err, value) => {
        if (err) {
          this.logger.error(err);
          return;
        }
        this.emitter.send(eventRaised);
      }
      this.buttonsMap.set(eventRaised,button);
    } else {
      logger.log("Non initialisation of the button ", eventRaised);
    }
  }

  indicatePlaying() {
    this.logger.info("GPIO indicate playing");
    this.ledsMap.get("play").writeSync(1);
    this.ledsMap.get("pause").writeSync(0);
  }

  indicatePaused() {
    this.logger.info("GPIO indicate pause");
    this.ledsMap.get("play").writeSync(0);
    this.ledsMap.get("pause").writeSync(1);
  }

  indicateRecording() {
    this.logger.info("GPIO indicate recording")
    this.ledsMap.get("record").writeSync(1);
  }

  indicateStopRecording() {
    this.logger.info("GPIO indicate record stopped")
    this.ledsMap.get("record").writeSync(0);
  }

  unexport() {
    if (Gpio.accessible) {
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
  }

};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = gpioHandler;
}
