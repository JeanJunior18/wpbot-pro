const Client = require('./ClientController');

class ClientManager {
  constructor() {
    console.log('Verify active tokens to connect');
    this.sessions = {};
    this.tokens = ['jeanjr'];
    this.initializeClients();
  }

  initializeClients() {
    this.tokens.forEach(token => {
      this.sessions[token] = new Client(token);
    });
  }
}

module.exports = new ClientManager();
