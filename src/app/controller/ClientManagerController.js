const VenomClient = require('../libs/Venom');

class ClientManager {
  constructor() {
    console.log('Verify active tokens to connect');
    this.sessions = {};
    this.tokens = ['jeanjr'];
    this.initializeClients();

    this.getClientStatus = this.getClientStatus.bind(this);
  }

  initializeClients() {
    this.tokens.forEach(token => {
      this.sessions[token] = new VenomClient(token);
    });
  }

  getClientStatus(req, res, next) {
    const token = req.params.token || req.body.token;

    try {
      const session = this.sessions[token];

      return res.json(session?.clientData);
    } catch (err) {
      return next(err);
    }
  }

  sendMessage(req, res, next) {
    try {
      return res.json({ message: 'Try send Message' });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new ClientManager();
