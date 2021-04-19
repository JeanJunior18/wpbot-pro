"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Venom = require('../venom');

var VenomController =
/*#__PURE__*/
function () {
  function VenomController() {
    _classCallCheck(this, VenomController);

    this.sessions = {};
    this.newClient = this.newClient.bind(this);
    this.checkSessions = this.checkSessions.bind(this);
    this.sendTextMessage = this.sendTextMessage.bind(this);
  }

  _createClass(VenomController, [{
    key: "newClient",
    value: function newClient(req, res) {
      var _this = this;

      var token, bot, qrcode, interval;
      return regeneratorRuntime.async(function newClient$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              token = req.body.token;

              if (!this.sessions[token]) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", res.json('Has Session'));

            case 3:
              bot = new Venom();
              _context.next = 6;
              return regeneratorRuntime.awrap(bot.connectToClient(token));

            case 6:
              qrcode = _context.sent;
              interval = setInterval(function () {
                console.log(' Try get Client ');

                if (bot.client) {
                  console.log(' Client Catch ');
                  _this.sessions[token] = bot.client;
                  clearInterval(interval);
                }
              }, 1000);
              return _context.abrupt("return", res.json(qrcode));

            case 9:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "sendTextMessage",
    value: function sendTextMessage(req, res) {
      var _req$body, token, phone, text, client;

      return regeneratorRuntime.async(function sendTextMessage$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _req$body = req.body, token = _req$body.token, phone = _req$body.phone, text = _req$body.text;
              client = this.sessions[token];

              if (client) {
                _context2.next = 4;
                break;
              }

              return _context2.abrupt("return", res.status(400).json('Não há sessão ativa neste token'));

            case 4:
              _context2.next = 6;
              return regeneratorRuntime.awrap(client.sendText("".concat(phone, "@c.us"), text));

            case 6:
              return _context2.abrupt("return", res.json('Mensagem Enviada'));

            case 7:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "checkSessions",
    value: function checkSessions(req, res) {
      return regeneratorRuntime.async(function checkSessions$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              console.log(this.sessions);
              return _context3.abrupt("return", res.json(Object.keys(this.sessions)));

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);

  return VenomController;
}();

module.exports = new VenomController();