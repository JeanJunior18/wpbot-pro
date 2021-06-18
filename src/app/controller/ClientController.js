const VenomController = require('./VenomController');

class Client extends VenomController {
  constructor(token) {
    super(token);
    console.log('Connecting Client', token);

    this.createClient();
  }
}

module.exports = Client;
