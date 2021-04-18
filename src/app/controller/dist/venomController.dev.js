"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _venom = _interopRequireDefault(require("../venom"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var VenomController =
/*#__PURE__*/
function () {
  function VenomController() {
    _classCallCheck(this, VenomController);
  }

  _createClass(VenomController, [{
    key: "stanceBot",
    value: function stanceBot(req, res) {
      var bot = new _venom["default"]();
      return res.json({
        bot: bot
      });
    }
  }, {
    key: "connectClient",
    value: function connectClient(req, res) {
      var token, bot, qrcode;
      return regeneratorRuntime.async(function connectClient$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              token = req.body.token;
              bot = new _venom["default"]();
              _context.next = 4;
              return regeneratorRuntime.awrap(bot.connectToClient(token));

            case 4:
              qrcode = _context.sent;
              return _context.abrupt("return", res.json({
                qrcode: qrcode
              }));

            case 6:
            case "end":
              return _context.stop();
          }
        }
      });
    }
  }]);

  return VenomController;
}();

var _default = new VenomController();

exports["default"] = _default;