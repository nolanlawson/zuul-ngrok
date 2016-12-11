var ngrok = require('ngrok');
var xtend = require('xtend');

var AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;

var DEFAULT_TIMEOUT = 10000;

function Tunnel(config) {
  if (!this instanceof Tunnel) {
    return new Tunnel(config);
  }

  var self = this;

  self.tunnel_settings = config.tunnel;
  if (AUTH_TOKEN) {
    self.tunnel_settings.authtoken = AUTH_TOKEN;
  }
}

Tunnel.prototype.connect = function(port, cb) {
  var self = this;

  ngrok.connect(xtend({ port: port }, self.tunnel_settings), function(err, url) {
    if (err) {
      err.stack = '';
      cb(err);
      return;
    }

    self.ngrok_url = url;
    var timeout = typeof self.tunnel_settings.timeout === 'number' ? self.tunnel_settings.timeout : DEFAULT_TIMEOUT
    setTimeout(function () {
      cb(null, url.replace('tcp://', 'https://') + '/__zuul');
    }, timeout);
  });
};

Tunnel.prototype.close = function() {
  var self = this;

  ngrok.disconnect(self.ngrok_url);
};

module.exports = Tunnel;
