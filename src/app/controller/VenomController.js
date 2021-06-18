// const Venom = require('../venom');
// const Venom = require('venom-bot');

class VenomController {
  constructor(token) {
    console.log('Instance Venom Class', token);

    this.token = token;
  }

  createClient() {
    console.log('Create a Client for ', this.token);
  }
}

module.exports = VenomController;
