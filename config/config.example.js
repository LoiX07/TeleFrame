var config = {
  botToken: "",
  whitelistChats: [],
  playSoundOnRecieve: "sound1.mp3",
  showVideos: true,
  playVideoAudio: false,
  imageFolder: "images",
  fullscreen: true,
  fadeTime: 1500,
  interval: 10 * 1000,
  imageCount: 30,
  newPhotoMessage: "Neues Foto von",
  newVideoMessage: "Neues Video von",
  showSender: true,
  showCaption: true,
  toggleMonitor: false,
  turnOnHour: 9,
  turnOffHour: 22,
  keys: {
    next: "right",
    previous: "left",
    play: "l",
    pause: "k"
  },
  voiceReply: {
    key: "a",
    maxRecordTime: 60*1000,
    recordingMessageTitle: "Voice Message",
    recordingPreMessage: "Recording for",
    recordingPostMessage: "in progress...",
    recordingDone: "Voice message sent sucessfully!",
    recordingError: "Voice message has failed!"
  }
  gpio: {
    playLed: 1, // #GPIO of the LED "playing"
    pauseLed: 2, // #GPIO of the LED "paused"
    recordLed: 3, // #GPIO of the LED "recording"
    previousButton: 4, // #GPIO of the button "previous"
    pauseButton: 5, // #GPIO of the button "pause"
    playButton: 6, // #GPIO of the button "play"
    recordButton: 7, // #GPIO of the button "record"
    nextButton: 8 // #GPIO of the button "next"
  }
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = config;
}
