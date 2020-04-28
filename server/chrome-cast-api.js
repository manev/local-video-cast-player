const {
  ipcMain
} = require('electron');
const {
  address,
  port
} = require('./os-info');
const ChromecastAPI = require('chromecast-api')

let chromeCast = null;

ipcMain.on('chrome-cast-search', (event, args) => {
  chromeCast = new ChromecastAPI();

  chromeCast.on('device', () => event.reply('chrome-cast-search-result', chromeCast.devices));

  chromeCast.on('status', status => event.reply('chrome-cast-status-changed', status));

  chromeCast.on('connected', () => event.reply('chrome-cast-connected'));
});

ipcMain.on('disconnect-device', (event, args) => {

  if (!chromeCast) {
    event.reply('start-media-error', {
      error: 'No device connected'
    });
  }

  chromeCast.close(() => event.reply('chrome-cast-disconnected'));
});

ipcMain.on('connect-to-device', (event, args) => {

  if (!args || !args.host) {
    event.reply('start-media-error', {
      error: 'No media provided'
    });
  }

  if (!chromeCast) {
    event.reply('start-media-error', {
      error: 'No device connected'
    });
  }

  chromeCast = chromeCast.devices.find(f => f.host === args.host);

  if (!chromeCast) {
    event.reply('start-media-error', {
      error: 'No device found with this host'
    });
  }

  event.reply('chrome-cast-connected');
});

ipcMain.on('play-media', (event, args) => {

  if (!chromeCast) {
    event.reply('start-media-error', {
      error: 'No Device Detected'
    });
  }

  const media = {
    url: `http://${address}:${port}/videos/${encodeURI(args.mediaURL)}`,
    subtitles: [{
      url: `http://${address}:${port}/subs/${encodeURI(args.subsUrl)}`,
      language: 'en-US',
      name: 'English'
    }],
    subtitles_style: {
      backgroundColor: '#FFFFFF00', // see http://dev.w3.org/csswg/css-color/#hex-notation
      foregroundColor: '#FFFFFFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
      edgeType: 'OUTLINE', // can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
      edgeColor: '#000000FF', // see http://dev.w3.org/csswg/css-color/#hex-notation
      fontScale: 1.3, // transforms into "font-size: " + (fontScale*100) +"%"
      fontStyle: 'BOLD', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
      fontFamily: 'Droid Sans',
      fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
      //windowColor: '#AA00FFFF', // see http://dev.w3.org/csswg/css-color/#hex-notation
      //windowRoundedCornerRadius: 10, // radius in px
      //windowType: 'ROUNDED_CORNERS' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
    }
  };

  chromeCast.play(media, err => {
    if (err) {
      event.reply('start-media-error', {
        error: err
      });
    } else {
      event.reply('start-media-success', media);
    }
  });
});
