"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('venom-bot'),
    create = _require.create;

var Bot =
/*#__PURE__*/
function () {
  function Bot() {
    _classCallCheck(this, Bot);

    this.client = null;
  }

  _createClass(Bot, [{
    key: "connectToClient",
    value: function connectToClient(clientToken) {
      var _this = this;

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
                create(clientToken, function (base64) {
                  if (base64) {
                    return res({
                      qrcode: base64
                    });
                  }

                  return rej();
                }, function (statusSession, session) {
                  if (statusSession, session) {
                    return res({
                      token: session,
                      state: statusSession
                    });
                  }

                  return null;
                }).then(function (client) {
                  return _this.start(client, clientToken);
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
      return regeneratorRuntime.async(function start$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.client = client;
              client.onMessage(function (data) {
                var messageId = data.id,
                    chatId = data.chatId,
                    sender = data.sender,
                    isGroup = data.isGroupMsg,
                    content = data.content,
                    timestamp = data.timestamp,
                    fromId = data.from,
                    quotedMsgObj = data.quotedMsgObj;
                var id = sender.id,
                    profileName = sender.pushname,
                    name = sender.name,
                    profilePicThumbObj = sender.profilePicThumbObj,
                    isMyContact = sender.isMyContact,
                    isMe = sender.isMe,
                    isWAContact = sender.isWAContact,
                    isEnterprise = sender.isEnterprise,
                    isBusiness = sender.isBusiness;
                var message = {
                  id: id,
                  profileName: profileName,
                  name: name,
                  avatarUrl: profilePicThumbObj.eurl,
                  messageId: messageId,
                  chatId: chatId,
                  isMyContact: isMyContact,
                  isGroup: isGroup,
                  isMe: isMe,
                  isWAContact: isWAContact,
                  isEnterprise: isEnterprise,
                  isBusiness: isBusiness,
                  message: {
                    content: content,
                    timestamp: timestamp,
                    fromId: fromId,
                    quotedMsgObj: quotedMsgObj
                  }
                };
                console.log('New message: ', message);
              });

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);

  return Bot;
}();

module.exports = Bot;