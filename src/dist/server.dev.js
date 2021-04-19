"use strict";

var app = require('./app');

var PORT = process.env.PORT || 3333;
app.server.listen(PORT, function () {
  console.log('Server is running on PORT ', PORT);
});