"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _venomBot = require("venom-bot");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Bot =
/*#__PURE__*/
function () {
  function Bot() {
    _classCallCheck(this, Bot);
  }

  _createClass(Bot, [{
    key: "connectToClient",
    // constructor() {
    //   create(
    //     'Jean',
    //     // Catch QrCode
    //     (base64Qr, asciiQr, attemps, urlCode) => {
    //       console.log('QrCode', asciiQr);
    //       console.log('Attemps', attemps);
    //       console.log('urlCode', urlCode);
    //     },
    //     // Status Find
    //     (statusSession, session) => {
    //       console.log('statusSession', statusSession);
    //       console.log('session', session);
    //     },
    //   ).then(async client => {
    //     const token = await client.getSessionTokenBrowser();
    //     console.log('Token', token);
    //     this.start(client);
    //     this.client = client;
    //   });
    // }
    value: function connectToClient(clientToken) {
      var token;
      return regeneratorRuntime.async(function connectToClient$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (!clientToken) {
                _context.next = 5;
                break;
              }

              _context.next = 3;
              return regeneratorRuntime.awrap(new Promise(function (res, rej) {
                (0, _venomBot.create)(clientToken, function (base64) {
                  if (base64) {
                    console.log('BASE');
                    return res(base64);
                  }

                  console.log('Sem token');
                  return rej(); // token = { base64 };
                });
              }));

            case 3:
              token = _context.sent;
              return _context.abrupt("return", token);

            case 5:
              return _context.abrupt("return", null);

            case 6:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }, {
    key: "start",
    value: function start(client) {
      client.onMessage(function (message) {
        console.log('New message: ', message);
      });
    }
  }]);

  return Bot;
}();

var _default = Bot;
exports["default"] = _default;