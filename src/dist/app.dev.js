"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var express = require('express');

var cors = require('cors');

var http = require('http');

var _router = require('./router');

var App =
/*#__PURE__*/
function () {
  function App() {
    _classCallCheck(this, App);

    this.app = express();
    this.server = http.Server(this.app);
    this.middlewares();
    this.router();
  }

  _createClass(App, [{
    key: "middlewares",
    value: function middlewares() {
      this.app.use(cors());
      this.app.use(express.json());
    }
  }, {
    key: "router",
    value: function router() {
      this.app.use(_router);
    }
  }]);

  return App;
}();

var app = new App();
module.exports = app;