var os = require('os');

var hostName = os.hostname();

var ifaces = os.networkInterfaces();

const address = ifaces['Wi-Fi'].find(i => i.family === 'IPv4').address;

module.exports = {
  address,
  port: 8080
};
