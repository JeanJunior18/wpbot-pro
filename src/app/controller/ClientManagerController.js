const VenomClient = require('../libs/Venom');
const firebase = require('../../firebase');

class ClientManager {
  constructor() {
    console.log('Verify active tokens to connect');
    this.sessions = {};
    this.database = firebase.database();
    this.initializeClients();

    this.getClientStatus = this.getClientStatus.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.createToken = this.createToken.bind(this);
    this.deleteToken = this.deleteToken.bind(this);
    this.updateToken = this.updateToken.bind(this);
    this.restartAndLogout = this.restartAndLogout.bind(this);
  }

  initializeClients() {
    const tokenRef = this.database.ref('tokens');

    tokenRef.once('value', snapshot => {
      if (!snapshot.val()) return;
      const token = Object.keys(snapshot.val())[0];
      const value = snapshot.val()[token];

      this.sessions[token] = new VenomClient(token, value);
    });
  }

  async getClientStatus(req, res, next) {
    try {
      const token = req.params.token || req.body.token;
      const session = this.sessions[token];

      if (!session)
        return res.status(410).json({ error: 'Session is not avaliable' });

      if (!session.clientSession && session.clientData !== 'starting')
        this.sessions[token] = new VenomClient(token);

      const payload = {
        token: session.token,
        ...session.clientData,
      };

      return res.json(payload);
    } catch (err) {
      return next(err);
    }
  }

  async restartAndLogout(req, res, next) {
    try {
      const { token, command } = req.body;
      const session = this.sessions[token];

      if (token && !session)
        return res.status(410).json({ error: 'Token is not avaliable' });
      if (!session.clientSession)
        return res.status(428).json({ error: 'Token has not active session' });

      if (command === 'logout') {
        await session.clientSession.logout();
      } else if (command === 'start') {
        await session.clientSession.restartService();
      } else {
        return res.status(418).json({ error: 'Invalid Command' });
      }
      return res.json(`Command ${command} success`);
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

  async createToken(req, res, next) {
    try {
      const { organization, webhook, token, host } = req.body;

      await this.database
        .ref(`tokens/${token}`)
        .set({ organization, webhook, host });

      this.sessions[token] = new VenomClient(token);
      return res.json({
        message: `Token from ${organization} created - ${token}`,
      });
    } catch (err) {
      return next(err);
    }
  }

  async deleteToken(req, res, next) {
    try {
      const { token } = req.params;
      const session = this.sessions[token];

      if (token && !session)
        return res.status(410).json({ error: 'Token is not avaliable' });
      if (!session.clientSession)
        return res.status(428).json({ error: 'Token has not active session' });

      await session.clientSession.logout();

      await this.database.ref(`tokens/${token}`).remove();

      return res.json({ message: `Token ${token} deleted` });
    } catch (err) {
      return next(err);
    }
  }

  async updateToken(req, res, next) {
    try {
      const { token } = req.params;
      const { organization, host, webhook, sessionInfo } = req.body;

      const session = this.sessions[token];

      if (token && !session)
        return res.status(410).json({ error: 'Token is not avaliable' });

      const data = {};

      if (organization) data.organization = organization;
      if (host) data.host = host;
      if (webhook) data.webhook = webhook;
      if (sessionInfo) data.sessionInfo = sessionInfo;

      await this.database.ref(`tokens/${token}`).update(data);

      return res.json({ message: `Token ${token} updated` });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new ClientManager();
