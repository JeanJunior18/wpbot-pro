const { default: axios } = require('axios');
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
    this.validateNumber = this.validateNumber.bind(this);
  }

  initializeClients() {
    const tokenRef = this.database.ref('tokens');

    tokenRef.once('value', snapshot => {
      if (!snapshot.val()) return;
      const tokenList = snapshot.val();

      for (const token in tokenList) {
        this.sessions[token] = new VenomClient(token, tokenList[token]);
      }
    });
  }

  async getClientStatus(req, res, next) {
    try {
      const token = req.params.token || req.body.token;
      const session = this.sessions[token];

      if (!session)
        return res.status(410).json({ error: 'Session is not avaliable' });

      if (session.clientSession) {
        const connectionState = await session.clientSession.getConnectionState();
        session.clientData.connectionState = await session.clientSession.isConnected();

        let qr = null;
        if (connectionState !== 'CONNECTED') {
          qr = await session.clientSession.getQrCode();
        }

        if (qr) {
          session.clientData.qrcode = qr.base64Image;
        } else {
          session.clientData.qrcode = null;
        }
      }

      const payload = {
        token: session.token,
        ...session.clientData,
      };

      return res.json({
        status: payload,
        qrCodeUrl: session.clientData.qrcode,
      });
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
      const { token, number, chat_id: chatID } = req.body;

      if (token && !this.sessions[token])
        return res.status(410).json({ error: 'Token is not avaliable' });

      if (!number)
        return res.status(410).json({ error: 'Phone number is not provided' });

      req.body.number = `${number}@c.us`;
      const webhookURL = `${this.sessions[token].clientInfo.webhook}?token=${token}`;

      this.sessions[token]
        .sendMessageToClient(req.body)
        .then(msgResponse => {
          axios
            .post(webhookURL, {
              cmd: 'ack',
              chat_id: chatID,
              ack: 2,
              engine: 'venom',
              message: msgResponse,
            })
            .catch(err => {
              console.log('Error on send DELIVERED ACK - ', err.message);
            });
        })
        .catch(err => {
          console.log(err.message);
          axios
            .post(webhookURL, {
              cmd: 'ack',
              chat_id: chatID,
              ack: 0,
              engine: 'venom',
            })
            .catch(e => {
              console.log('Error on send ERROR ACK - ', e.message);
            });
        });

      return res.json({ message: 'Sending Message' });
    } catch (err) {
      return next(err);
    }
  }

  async createToken(req, res, next) {
    try {
      const { organization, webhook, token, host } = req.body;

      const clientInfo = { organization, webhook, host };

      await this.database.ref(`tokens/${token}`).set(clientInfo);

      this.sessions[token] = new VenomClient(token, clientInfo);
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

      if (session.clientSession) {
        await session.clientSession.logout();
        await session.clientSession.close();
      }
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

  async validateNumber(req, res, next) {
    try {
      const { token, value } = req.body;

      const session = this.sessions[token];

      if (token && !session)
        return res.status(410).json({ error: 'Token is not avaliable' });

      const records = [];

      for (const number of value) {
        const { numberExists } = await session.clientSession.checkNumberStatus(
          `${number}@c.us`,
        );
        records.push({ number, exist: numberExists || false });
      }

      return res.json({ records });
    } catch (err) {
      return next(err);
    }
  }
}

const clientManager = new ClientManager();

module.exports = { clientManager, sessions: clientManager.sessions };
