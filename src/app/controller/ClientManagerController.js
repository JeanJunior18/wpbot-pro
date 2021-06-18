const VenomClient = require('../libs/Venom');

class ClientManager {
  constructor() {
    console.log('Verify active tokens to connect');
    this.sessions = {};
    this.tokens = ['jeanjr'];
    this.initializeClients();

    this.getClientStatus = this.getClientStatus.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
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

  async sendMessage(req, res, next) {
    try {
      const { token, number } = req.body;
      if (token && !this.sessions[token])
        return res.status(410).json({ error: 'Token is not avaliable' });

      if (!number)
        return res.status(410).json({ error: 'Phone number is not provided' });

      req.body.number = `${number}@c.us`;

      await this.sessions[token].sendMessageToClient(req.body);

      return res.json({ message: 'Sending Message' });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new ClientManager();
